const express = require('express')
const router = express.Router()
const conexion = require('../models/conetion')

router.get('/admin/evaluacion=docente', (req, res)=>{
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    // Query to fetch teacher evaluations
    const query = `
        SELECT 
            d.cedula,
            CONCAT(d.nombre, ' ', d.apellido) as docente_nombre,
            d.especializacion,
            'Pendiente' as rubrica_nombre,
            CURDATE() as fecha_evaluacion
        FROM docente d
        WHERE d.activo = 1
        ORDER BY d.nombre, d.apellido
        LIMIT 20
    `;
    
    conexion.query(query, (error, evaluaciones) => {
        if(error){
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
                s.codigo as seccion_nombre
            FROM permisos p
            INNER JOIN carrera c ON p.carrera_codigo = c.codigo
            INNER JOIN seccion s ON p.seccion_id = s.id
            WHERE p.activo = 1
            GROUP BY p.docente_cedula, c.codigo, c.nombre, p.semestre, s.id, s.codigo
            ORDER BY p.docente_cedula, c.nombre, p.semestre, s.codigo
        `;
        
        conexion.query(permisosQuery, (permisosError, permisos) => {
            if(permisosError){
                console.error('Error fetching permisos:', permisosError);
            }
            
            // Organize permissions by teacher
            const permisosPorDocente = {};
            if(permisos && permisos.length > 0) {
                permisos.forEach(permiso => {
                    if(!permisosPorDocente[permiso.docente_cedula]) {
                        permisosPorDocente[permiso.docente_cedula] = {
                            carreras: {},
                            semestres: new Set(),
                            secciones: {}
                        };
                    }
                    
                    // Add career
                    if(!permisosPorDocente[permiso.docente_cedula].carreras[permiso.carrera_codigo]) {
                        permisosPorDocente[permiso.docente_cedula].carreras[permiso.carrera_codigo] = permiso.carrera_nombre;
                    }
                    
                    // Add semester
                    permisosPorDocente[permiso.docente_cedula].semestres.add(permiso.semestre);
                    
                    // Add section
                    if(!permisosPorDocente[permiso.docente_cedula].secciones[permiso.seccion_id]) {
                        permisosPorDocente[permiso.docente_cedula].secciones[permiso.seccion_id] = permiso.seccion_nombre;
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