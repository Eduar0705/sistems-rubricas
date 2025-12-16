const express = require('express')
const router = express.Router()
const conexion = require('../models/conetion')

router.get('/admin/evaluacion=docente', (req, res) => {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Query to fetch teachers with their latest evaluation info
    const query = `
        SELECT 
            d.cedula,
            CONCAT(d.nombre, ' ', d.apellido) as docente_nombre,
            d.especializacion,
            e.id as evaluacion_id,
            e.unidad_curricular as rubrica_nombre,
            e.fecha_evaluacion,
            CASE 
                WHEN e.id IS NOT NULL THEN 'Evaluado'
                ELSE 'Pendiente'
            END as estado
        FROM docente d
        LEFT JOIN (
            SELECT 
                docente_cedula,
                id,
                unidad_curricular,
                fecha_evaluacion,
                ROW_NUMBER() OVER (PARTITION BY docente_cedula ORDER BY fecha_evaluacion DESC) as rn
            FROM evaluaciones_docente
            WHERE activo = 1
        ) e ON d.cedula = e.docente_cedula AND e.rn = 1
        WHERE d.activo = 1
        ORDER BY d.nombre, d.apellido
    `;

    conexion.query(query, (error, evaluaciones) => {
        if (error) {
            console.error('Error fetching evaluaciones:', error);
            return res.render('admin/evaluacionDocente', {
                datos: req.session,
                title: 'SGR - Evaluacion Docente',
                currentPage: 'eva-doc',
                evaluaciones: [],
                permisosPorDocente: '{}',
                mensaje: 'Error al cargar las evaluaciones'
            });
        }

        // Fetch permissions for all teachers to populate dropdowns
        const permisosQuery = `
            SELECT 
                p.docente_cedula,
                c.codigo as carrera_codigo,
                c.nombre as carrera_nombre,
                p.semestre,
                s.id as seccion_id,
                s.codigo as seccion_nombre,
                m.codigo as materia_codigo,
                m.nombre as materia_nombre
            FROM permisos p
            INNER JOIN carrera c ON p.carrera_codigo = c.codigo
            INNER JOIN seccion s ON p.seccion_id = s.id
            INNER JOIN materia m ON p.materia_codigo = m.codigo
            WHERE p.activo = 1
            GROUP BY p.docente_cedula, c.codigo, c.nombre, p.semestre, s.id, s.codigo, m.codigo, m.nombre
            ORDER BY p.docente_cedula, c.nombre, p.semestre, s.codigo
        `;

        conexion.query(permisosQuery, (permisosError, permisos) => {
            if (permisosError) {
                console.error('Error fetching permisos:', permisosError);
            }

            // Organize permissions by teacher
            const permisosPorDocente = {};
            if (permisos && permisos.length > 0) {
                permisos.forEach(permiso => {
                    if (!permisosPorDocente[permiso.docente_cedula]) {
                        permisosPorDocente[permiso.docente_cedula] = {
                            carreras: {},
                            semestres: new Set(),
                            secciones: {},
                            materias: {}
                        };
                    }

                    // Add career
                    if (!permisosPorDocente[permiso.docente_cedula].carreras[permiso.carrera_codigo]) {
                        permisosPorDocente[permiso.docente_cedula].carreras[permiso.carrera_codigo] = permiso.carrera_nombre;
                    }

                    // Add semester
                    permisosPorDocente[permiso.docente_cedula].semestres.add(permiso.semestre);

                    // Add section
                    if (!permisosPorDocente[permiso.docente_cedula].secciones[permiso.seccion_id]) {
                        permisosPorDocente[permiso.docente_cedula].secciones[permiso.seccion_id] = permiso.seccion_nombre;
                    }

                    // Add materia
                    if (permiso.materia_codigo && !permisosPorDocente[permiso.docente_cedula].materias[permiso.materia_codigo]) {
                        permisosPorDocente[permiso.docente_cedula].materias[permiso.materia_codigo] = permiso.materia_nombre;
                    }
                });

                // Convert Sets to Arrays for JSON serialization
                Object.keys(permisosPorDocente).forEach(cedula => {
                    permisosPorDocente[cedula].semestres = Array.from(permisosPorDocente[cedula].semestres).sort((a, b) => a - b);
                });
            }

            res.render('admin/evaluacionDocente', {
                datos: req.session,
                title: 'SGR - Evaluacion Docente',
                currentPage: 'eva-doc',
                evaluaciones: evaluaciones || [],
                permisosPorDocente: JSON.stringify(permisosPorDocente)
            });
        });
    });
})

module.exports = router
