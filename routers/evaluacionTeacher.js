const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// Ruta principal de evaluaciones
router.get("/teacher/evaluacion", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const docenteCedula = req.session.cedula;
    const esAdmin = req.session.id_rol === 1;

    let query;
    let queryParams = [];

    if (esAdmin) {
        // Admin puede ver todas las evaluaciones
        query = `
            SELECT
                ee.id,
                ee.puntaje_total,
                ee.fecha_evaluacion,
                ee.observaciones,
                e.cedula as estudiante_cedula,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                r.nombre_rubrica,
                r.porcentaje_evaluacion,
                m.nombre as materia_nombre,
                c.nombre as carrera_nombre,
                s.codigo as seccion_codigo,
                s.horario as seccion_horario,
                s.aula as seccion_aula,
                CASE
                    WHEN ee.puntaje_total IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            WHERE e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1
            ORDER BY c.nombre, s.codigo, ee.fecha_evaluacion DESC
        `;
    } else {
        // Docente solo ve evaluaciones de secciones donde tiene permisos
        query = `
            SELECT
                ee.id,
                ee.puntaje_total,
                ee.fecha_evaluacion,
                ee.observaciones,
                e.cedula as estudiante_cedula,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                r.nombre_rubrica,
                r.porcentaje_evaluacion,
                m.nombre as materia_nombre,
                c.nombre as carrera_nombre,
                s.codigo as seccion_codigo,
                s.horario as seccion_horario,
                s.aula as seccion_aula,
                CASE
                    WHEN ee.puntaje_total IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            INNER JOIN permisos p ON p.seccion_id = s.id
            WHERE e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1
            AND p.docente_cedula = ?
            AND p.activo = 1
            ORDER BY c.nombre, s.codigo, ee.fecha_evaluacion DESC
        `;
        queryParams = [docenteCedula];
    }

    conexion.query(query, queryParams, (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.render("teacher/evaluaciones", {
                datos: req.session, 
                title: 'SGR - Evaluaciones', 
                currentPage: 'evaluaciones',
                evaluaciones: [],
                error: 'Error al cargar las evaluaciones'
            });
        }

        const evaluacionesFormateadas = evaluaciones.map(ev => {
            const iniciales = (ev.estudiante_nombre.charAt(0) + ev.estudiante_apellido.charAt(0)).toUpperCase();
            const fecha = ev.fecha_evaluacion ? 
                new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : 'Pendiente';
            
            return {
                ...ev,
                iniciales,
                fecha_formateada: fecha,
                calificacion: ev.puntaje_total ? 
                    `${parseFloat(ev.puntaje_total).toFixed(1)}/${ev.porcentaje_evaluacion}` : 
                    '-/-'
            };
        });

        res.render("teacher/evaluaciones", {
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

// API: Obtener rúbricas activas
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
            s.codigo as seccion_codigo
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        WHERE r.activo = 1
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

// ============================
// APIs específicas para DOCENTE con permisos
// ============================

// Carreras visibles para el docente (según permisos de seccion)
router.get('/api/teacher/carreras', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;

    const query = `
        SELECT DISTINCT
            c.codigo,
            c.nombre,
            c.descripcion
        FROM permisos p
        INNER JOIN seccion s ON p.seccion_id = s.id AND s.activo = 1
        INNER JOIN materia m ON s.materia_codigo = m.codigo AND m.activo = 1
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo AND c.activo = 1
        WHERE p.docente_cedula = ?
          AND p.activo = 1
        ORDER BY c.nombre
    `;

    conexion.query(query, [docenteCedula], (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras (docente):', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras });
    });
});

// Materias de una carrera donde el docente tiene permisos
router.get('/api/teacher/carrera/:carreraCodigo/materias', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { carreraCodigo } = req.params;

    const query = `
        SELECT DISTINCT
            m.codigo,
            m.nombre,
            m.semestre,
            m.creditos
        FROM permisos p
        INNER JOIN seccion s ON p.seccion_id = s.id AND s.activo = 1
        INNER JOIN materia m ON s.materia_codigo = m.codigo AND m.activo = 1
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo AND c.activo = 1
        WHERE c.codigo = ?
          AND p.docente_cedula = ?
          AND p.activo = 1
        ORDER BY m.semestre, m.nombre
    `;

    conexion.query(query, [carreraCodigo, docenteCedula], (error, materias) => {
        if (error) {
            console.error('Error al obtener materias (docente):', error);
            return res.json({ success: false, message: 'Error al obtener materias' });
        }

        res.json({ success: true, materias });
    });
});

// Secciones de una materia donde el docente tiene permisos
router.get('/api/teacher/materia/:materiaCodigo/secciones', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { materiaCodigo } = req.params;

    const query = `
        SELECT DISTINCT
            s.id,
            s.codigo,
            s.horario,
            s.aula,
            s.capacidad_maxima
        FROM permisos p
        INNER JOIN seccion s ON p.seccion_id = s.id AND s.activo = 1
        INNER JOIN materia m ON s.materia_codigo = m.codigo AND m.activo = 1
        WHERE m.codigo = ?
          AND p.docente_cedula = ?
          AND p.activo = 1
        ORDER BY s.codigo
    `;

    conexion.query(query, [materiaCodigo, docenteCedula], (error, secciones) => {
        if (error) {
            console.error('Error al obtener secciones (docente):', error);
            return res.json({ success: false, message: 'Error al obtener secciones' });
        }

        res.json({ success: true, secciones });
    });
});

// Estudiantes de una sección donde el docente tiene permisos
router.get('/api/teacher/seccion/:seccionId/estudiantes', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { seccionId } = req.params;

    const query = `
        SELECT 
            e.cedula,
            e.nombre,
            e.apellido,
            e.email
        FROM estudiante e
        INNER JOIN inscripcion_seccion ins ON e.cedula = ins.estudiante_cedula
        INNER JOIN seccion s ON ins.seccion_id = s.id
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.activo = 1
        WHERE ins.seccion_id = ? 
          AND e.activo = 1 
          AND ins.estado = 'Inscrito'
          AND p.docente_cedula = ?
        ORDER BY e.apellido, e.nombre
    `;

    conexion.query(query, [seccionId, docenteCedula], (error, estudiantes) => {
        if (error) {
            console.error('Error al obtener estudiantes (docente):', error);
            return res.json({ success: false, message: 'Error al obtener estudiantes' });
        }
    });
});

// Rúbricas activas solo en secciones donde el docente tiene permisos
router.get('/api/teacher/rubricas/activas', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;

    const query = `
        SELECT DISTINCT
            r.id,
            r.nombre_rubrica,
            r.tipo_evaluacion,
            r.porcentaje_evaluacion,
            r.modalidad,
            r.cantidad_personas,
            r.seccion_id,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            s.codigo as seccion_codigo
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.activo = 1
        WHERE r.activo = 1
          AND m.activo = 1
          AND s.activo = 1
          AND p.docente_cedula = ?
        ORDER BY r.nombre_rubrica
    `;

    conexion.query(query, [docenteCedula], (error, rubricas) => {
        if (error) {
            console.error('Error al obtener rúbricas (docente):', error);
            return res.json({ success: false, message: 'Error al obtener rúbricas' });
        }

        res.json({ success: true, rubricas });
    });
});

// Crear evaluaciones solo para rúbricas/secciones donde el docente tiene permisos
router.post('/api/teacher/evaluaciones/crear', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { rubrica_id, estudiantes, observaciones } = req.body;

    if (!rubrica_id || !estudiantes || estudiantes.length === 0) {
        return res.json({
            success: false,
            message: 'Datos incompletos'
        });
    }

    const queryVerificar = `
        SELECT r.id
        FROM rubrica_evaluacion r
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.activo = 1
        WHERE r.id = ?
          AND r.activo = 1
          AND p.docente_cedula = ?
    `;

    conexion.query(queryVerificar, [rubrica_id, docenteCedula], (error, results) => {
        if (error) {
            console.error('Error al verificar rúbrica (docente):', error);
            return res.json({
                success: false,
                message: 'Error al verificar rúbrica'
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'La rúbrica no existe, no está activa o no pertenece a una sección asignada al docente'
            });
        }

        const queryDuplicados = `
            SELECT estudiante_cedula 
            FROM evaluacion_estudiante 
            WHERE rubrica_id = ? 
            AND estudiante_cedula IN (?)
        `;

        conexion.query(queryDuplicados, [rubrica_id, estudiantes], (error, duplicados) => {
            if (error) {
                console.error('Error al verificar duplicados (docente):', error);
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
                    console.error('Error al crear evaluaciones (docente):', error);
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

module.exports = router;