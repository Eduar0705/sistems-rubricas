const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// Ruta principal de evaluaciones
router.get("/admin/evaluaciones", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const query = `
        SELECT
            r.id as rubrica_id,
            r.nombre_rubrica,
            r.porcentaje_evaluacion as valor,
            d.cedula as docente_cedula,
            d.nombre as docente_nombre,
            d.apellido as docente_apellido,
            m.nombre as materia_nombre,
            c.nombre as carrera_nombre,
            s.codigo as grupo_nombre,
            COUNT(ee.id) as total_evaluaciones,
            SUM(CASE WHEN ee.puntaje_total IS NOT NULL THEN 1 ELSE 0 END) as completadas,
            SUM(CASE WHEN ee.puntaje_total IS NULL THEN 1 ELSE 0 END) as pendientes,
            MAX(ee.fecha_evaluacion) as fecha_ultima_evaluacion,
            CASE
                WHEN SUM(CASE WHEN ee.puntaje_total IS NOT NULL THEN 1 ELSE 0 END) = COUNT(ee.id) THEN 'Completada'
                WHEN SUM(CASE WHEN ee.puntaje_total IS NULL THEN 1 ELSE 0 END) = COUNT(ee.id) THEN 'Pendiente'
                ELSE 'En Progreso'
            END as estado
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = 1 AND s.activo = 1 AND c.activo = 1
        GROUP BY r.id, r.nombre_rubrica, r.porcentaje_evaluacion, 
                 d.cedula, d.nombre, d.apellido,
                 m.nombre, c.nombre, s.codigo
        ORDER BY d.apellido, d.nombre, c.nombre, s.codigo
    `;

    conexion.query(query, (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.render("admin/evaluaciones", {
                datos: req.session, 
                title: 'SGR - Evaluaciones', 
                currentPage: 'evaluaciones',
                evaluaciones: [],
                error: 'Error al cargar las evaluaciones'
            });
        }

        const evaluacionesFormateadas = evaluaciones.map(ev => {
            const fecha = ev.fecha_ultima_evaluacion ? 
                new Date(ev.fecha_ultima_evaluacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : 'Sin evaluaciones';
            
            // Formato del estado con contadores
            let estadoFormateado = ev.estado;
            
            return {
                ...ev,
                fecha_formateada: fecha,
                estado_formateado: estadoFormateado
            };
        });

        res.render("admin/evaluaciones", {
            datos: req.session, 
            title: 'SGR - Evaluaciones', 
            currentPage: 'evaluaciones',
            evaluaciones: evaluacionesFormateadas
        });
    });
});

// API: Obtener carreras activas
router.get('/api/carreras', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT codigo, nombre, descripcion
        FROM carrera
        WHERE activo = 1
        ORDER BY nombre
    `;

    conexion.query(query, (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras });
    });
});

// API: Obtener materias por carrera
router.get('/api/carrera/:carreraCodigo/materias', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { carreraCodigo } = req.params;

    const query = `
        SELECT 
            codigo,
            nombre,
            semestre,
            creditos
        FROM materia
        WHERE carrera_codigo = ? 
        AND activo = 1
        ORDER BY semestre, nombre
    `;

    conexion.query(query, [carreraCodigo], (error, materias) => {
        if (error) {
            console.error('Error al obtener materias:', error);
            return res.json({ success: false, message: 'Error al obtener materias' });
        }

        res.json({ success: true, materias });
    });
});

// API: Obtener secciones por materia
router.get('/api/materia/:materiaCodigo/secciones', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { materiaCodigo } = req.params;

    const query = `
        SELECT 
            s.id,
            s.codigo,
            s.horario,
            s.aula,
            s.capacidad_maxima,
            COUNT(ins.id) as estudiantes_inscritos
        FROM seccion s
        LEFT JOIN inscripcion_seccion ins ON s.id = ins.seccion_id AND ins.estado = 'Inscrito'
        WHERE s.materia_codigo = ? 
        AND s.activo = 1
        GROUP BY s.id, s.codigo, s.horario, s.aula, s.capacidad_maxima
        ORDER BY s.codigo
    `;

    conexion.query(query, [materiaCodigo], (error, secciones) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.json({ success: false, message: 'Error al obtener secciones' });
        }

        res.json({ success: true, secciones });
    });
});

// API: Obtener estudiantes de una sección
router.get('/api/seccion/:seccionId/estudiantes', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { seccionId } = req.params;

    const query = `
        SELECT 
            e.cedula,
            e.nombre,
            e.apellido,
            e.email
        FROM estudiante e
        INNER JOIN inscripcion_seccion ins ON e.cedula = ins.estudiante_cedula
        WHERE ins.seccion_id = ? 
        AND e.activo = 1 
        AND ins.estado = 'Inscrito'
        ORDER BY e.apellido, e.nombre
    `;

    conexion.query(query, [seccionId], (error, estudiantes) => {
        if (error) {
            console.error('Error al obtener estudiantes:', error);
            return res.json({ success: false, message: 'Error al obtener estudiantes' });
        }

        res.json({ success: true, estudiantes });
    });
});

// API: Obtener rúbricas activas con detalle de carrera, materia, sección y docente
router.get('/api/rubricas/activas', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT
            r.id,
            r.nombre_rubrica,
            r.tipo_evaluacion,
            r.porcentaje_evaluacion,
            r.modalidad,
            r.cantidad_personas,
            r.seccion_id,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            m.semestre,
            c.codigo as carrera_codigo,
            c.nombre as carrera_nombre,
            s.codigo as seccion_codigo,
            s.horario as seccion_horario,
            s.aula as seccion_aula,
            s.lapso_academico as seccion_lapso,
            d.cedula as docente_cedula,
            d.nombre as docente_nombre,
            d.apellido as docente_apellido
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = 1
        AND NOT EXISTS (
            SELECT 1 FROM evaluacion_estudiante ee WHERE ee.rubrica_id = r.id
        )
        ORDER BY r.nombre_rubrica
    `;

    conexion.query(query, (error, rubricas) => {
        if (error) {
            console.error('Error al obtener rúbricas:', error);
            return res.json({ success: false, message: 'Error al obtener rúbricas' });
        }

        res.json({ success: true, rubricas });
    });
});

// API: Crear evaluaciones
router.post('/api/evaluaciones/crear', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { rubrica_id, estudiantes, observaciones } = req.body;

    // Validaciones
    if (!rubrica_id || !estudiantes || estudiantes.length === 0) {
        return res.json({ 
            success: false, 
            message: 'Datos incompletos' 
        });
    }

    // Verificar que la rúbrica existe y está activa
    const queryVerificar = 'SELECT id FROM rubrica_evaluacion WHERE id = ? AND activo = 1';
    
    conexion.query(queryVerificar, [rubrica_id], (error, results) => {
        if (error) {
            console.error('Error al verificar rúbrica:', error);
            return res.json({ 
                success: false, 
                message: 'Error al verificar rúbrica' 
            });
        }

        if (results.length === 0) {
            return res.json({ 
                success: false, 
                message: 'La rúbrica no existe o no está activa' 
            });
        }

        // Verificar que no existan evaluaciones duplicadas
        const queryDuplicados = `
            SELECT estudiante_cedula 
            FROM evaluacion_estudiante 
            WHERE rubrica_id = ? 
            AND estudiante_cedula IN (?)
        `;

        conexion.query(queryDuplicados, [rubrica_id, estudiantes], (error, duplicados) => {
            if (error) {
                console.error('Error al verificar duplicados:', error);
                return res.json({ 
                    success: false, 
                    message: 'Error al verificar duplicados' 
                });
            }

            if (duplicados.length > 0) {
                const cedulasDuplicadas = duplicados.map(d => d.estudiante_cedula);
                return res.json({ 
                    success: false, 
                    message: `Ya existen evaluaciones para algunos estudiantes. Cédulas: ${cedulasDuplicadas.join(', ')}` 
                });
            }

            // Insertar las evaluaciones
            const values = estudiantes.map(cedula => [
                rubrica_id,
                cedula,
                observaciones || null
            ]);

            const queryInsertar = `
                INSERT INTO evaluacion_estudiante 
                (rubrica_id, estudiante_cedula, observaciones) 
                VALUES ?
            `;

            conexion.query(queryInsertar, [values], (error, result) => {
                if (error) {
                    console.error('Error al crear evaluaciones:', error);
                    return res.json({ 
                        success: false, 
                        message: 'Error al crear las evaluaciones' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Evaluaciones creadas exitosamente',
                    cantidad: result.affectedRows
                });
            });
        });
    });
});

// API: Obtener carreras activas (duplicado, pero lo mantengo por compatibilidad)
router.get('/api/carreras', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT codigo, nombre, descripcion
        FROM carrera
        WHERE activo = 1
        ORDER BY nombre
    `;

    conexion.query(query, (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras });
    });
});

// API: Obtener secciones por carrera
router.get('/api/carrera/:carreraCodigo/secciones', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { carreraCodigo } = req.params;

    const query = `
        SELECT 
            s.id,
            s.codigo,
            s.horario,
            s.aula,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo
        FROM seccion s
        INNER JOIN materia m ON s.materia_codigo = m.codigo
        WHERE m.carrera_codigo = ? 
        AND s.activo = 1
        ORDER BY m.nombre, s.codigo
    `;

    conexion.query(query, [carreraCodigo], (error, secciones) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.json({ success: false, message: 'Error al obtener secciones' });
        }

        res.json({ success: true, secciones });
    });
});


module.exports = router;