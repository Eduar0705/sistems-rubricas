const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

router.get('/teacher/rubricas', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT
            r.id,
            r.nombre_rubrica,
            r.fecha_evaluacion,
            r.fecha_creacion,
            r.porcentaje_evaluacion,
            r.tipo_evaluacion,
            r.activo,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            s.codigo as seccion_codigo,
            IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = TRUE AND r.docente_cedula = ?
        ORDER BY r.fecha_creacion DESC
    `;

    connection.query(query, [cedula], (error, rubricas) => {
        if(error) {
            console.error('Error al obtener rúbricas:', error);
            return res.render("teacher/rubricas", {
                datos: req.session,
                title: 'SGR - Rúbricas',
                rubricas: [],
                currentPage: 'rubricas'
            });
        }

        res.render("teacher/rubricas", {
            datos: req.session,
            title: 'SGR - Rúbricas',
            rubricas: rubricas,
            currentPage: 'rubricas'
        });
    });
});

// Ruta API para obtener detalle de rúbrica
router.get("/teacher/rubricas/detalle/:id", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const rubricaId = req.params.id;

    const queryRubrica = `
        SELECT
            r.*,
            m.nombre as materia_nombre,
            s.codigo as seccion_codigo,
            s.lapso_academico,
            c.nombre as carrera_nombre,
            IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo
        WHERE r.id = ?
    `;

    const queryCriterios = `
        SELECT
            c.id,
            c.descripcion,
            c.puntaje_maximo,
            c.orden
        FROM criterio_evaluacion c
        WHERE c.rubrica_id = ?
        ORDER BY c.orden
    `;

    const queryNiveles = `
        SELECT
            n.id,
            n.criterio_id,
            n.nombre_nivel,
            n.descripcion,
            n.puntaje,
            n.orden
        FROM nivel_desempeno n
        INNER JOIN criterio_evaluacion c ON n.criterio_id = c.id
        WHERE c.rubrica_id = ?
        ORDER BY c.orden, n.orden DESC
    `;

    connection.query(queryRubrica, [rubricaId], (error, rubrica) => {
        if(error || rubrica.length === 0) {
            return res.status(404).json({ success: false, message: 'Rúbrica no encontrada' });
        }

        connection.query(queryCriterios, [rubricaId], (error, criterios) => {
            if(error) {
                return res.status(500).json({ success: false, message: 'Error al obtener criterios' });
            }

            connection.query(queryNiveles, [rubricaId], (error, niveles) => {
                if(error) {
                    return res.status(500).json({ success: false, message: 'Error al obtener niveles' });
                }

                const criteriosConNiveles = criterios.map(criterio => ({
                    ...criterio,
                    niveles: niveles.filter(nivel => nivel.criterio_id === criterio.id)
                }));

                res.json({
                    success: true,
                    rubrica: rubrica[0],
                    criterios: criteriosConNiveles
                });
            });
        });
    });
});



// Ruta API para obtener opciones de materia y sección
router.get("/teacher/opciones", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const queryMaterias = 'SELECT codigo, nombre FROM materia WHERE activo = TRUE ORDER BY nombre';
    const querySecciones = `
        SELECT s.id, s.codigo, s.materia_codigo, s.lapso_academico
        FROM seccion s
        WHERE s.activo = TRUE
        ORDER BY s.lapso_academico DESC, s.codigo
    `;

    connection.query(queryMaterias, (error, materias) => {
        if(error) {
            return res.status(500).json({ success: false, message: 'Error al obtener materias' });
        }

        connection.query(querySecciones, (error, secciones) => {
            if(error) {
                return res.status(500).json({ success: false, message: 'Error al obtener secciones' });
            }

            res.json({
                success: true,
                materias: materias,
                secciones: secciones
            });
        });
    });
});

// Ruta para obtener profesores únicos
router.get("/teacher/rubricas/profesores", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT DISTINCT IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
        FROM rubrica_evaluacion r
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = TRUE
        ORDER BY docente_nombre
    `;

    connection.query(query, (error, profesores) => {
        if(error) {
            console.error('Error al obtener profesores:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        res.json({
            success: true,
            profesores: profesores
        });
    });
});

// ============================================================
// OBTENER DATOS PARA EDITAR RÚBRICA (TEACHER)
// ============================================================
router.get('/teacher/rubricas/editar/:id', (req, res) => {
    const { id } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    // Verificar que la rúbrica pertenece al docente
    const queryVerificar = `
        SELECT r.id
        FROM rubrica_evaluacion r
        WHERE r.id = ? AND r.docente_cedula = ? AND r.activo = TRUE
    `;

    connection.query(queryVerificar, [id, cedula], (error, results) => {
        if(error) {
            console.error('Error al verificar rúbrica:', error);
            return res.json({ success: false, message: 'Error al verificar la rúbrica' });
        }

        if(results.length === 0) {
            return res.json({ success: false, message: 'Rúbrica no encontrada o sin permisos' });
        }

        // Obtener datos de la rúbrica
        const queryRubrica = `
            SELECT r.*, m.nombre as materia_nombre, s.codigo as seccion_codigo,
                   IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
            FROM rubrica_evaluacion r
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            LEFT JOIN docente d ON r.docente_cedula = d.cedula
            WHERE r.id = ? AND r.docente_cedula = ? AND r.activo = TRUE
        `;

        connection.query(queryRubrica, [id, cedula], (error, rubricaResult) => {
            if(error) {
                console.error('Error al obtener rúbrica:', error);
                return res.json({ success: false, message: 'Error al obtener la rúbrica' });
            }

            if(rubricaResult.length === 0) {
                return res.json({ success: false, message: 'Rúbrica no encontrada' });
            }

            const rubrica = rubricaResult[0];

            const queryCriterios = `
                SELECT
                    ce.id,
                    ce.descripcion,
                    ce.puntaje_maximo,
                    ce.orden
                FROM criterio_evaluacion ce
                WHERE ce.rubrica_id = ?
                ORDER BY ce.orden
            `;

            connection.query(queryCriterios, [id], (error, criterios) => {
                if(error) {
                    console.error('Error al obtener criterios:', error);
                    return res.json({ success: false, message: 'Error al obtener criterios' });
                }

                const queryNiveles = `
                    SELECT
                        nd.criterio_id,
                        nd.nombre_nivel,
                        nd.descripcion,
                        nd.puntaje,
                        nd.orden
                    FROM nivel_desempeno nd
                    WHERE nd.criterio_id IN (?)
                    ORDER BY nd.criterio_id, nd.orden
                `;

                const criteriosIds = criterios.map(c => c.id);

                if(criteriosIds.length === 0) {
                    return res.json({
                        success: true,
                        rubrica: rubrica,
                        criterios: []
                    });
                }

                connection.query(queryNiveles, [criteriosIds], (error, niveles) => {
                    if(error) {
                        console.error('Error al obtener niveles:', error);
                        return res.json({ success: false, message: 'Error al obtener niveles' });
                    }

                    const criteriosConNiveles = criterios.map(criterio => ({
                        ...criterio,
                        niveles: niveles.filter(n => n.criterio_id === criterio.id)
                    }));

                    res.json({
                        success: true,
                        rubrica: rubrica,
                        criterios: criteriosConNiveles
                    });
                });
            });
        });
    });
});

// ============================================================
// APIs PARA CARGA JERÁRQUICA (TEACHER)
// ============================================================

// Obtener carreras por permisos del docente
router.get('/teacher/carreras', (req, res) => {
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT DISTINCT c.codigo, c.nombre, c.duracion_semestres
        FROM carrera c
        INNER JOIN permisos p ON c.codigo = p.carrera_codigo
        WHERE c.activo = TRUE
        AND p.docente_cedula = ?
        AND p.activo = TRUE
        ORDER BY c.nombre
    `;

    connection.query(query, [cedula], (error, carreras) => {
        if(error) {
            console.error('Error:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras: carreras });
    });
});

// Obtener semestres por carrera y permisos
router.get("/teacher/semestres/:carrera", (req, res) => {
    const { carrera } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT DISTINCT m.semestre
        FROM materia m
        INNER JOIN seccion s ON m.codigo = s.materia_codigo
        INNER JOIN permisos p ON p.carrera_codigo = m.carrera_codigo
            AND p.semestre = m.semestre
            AND p.materia_codigo = m.codigo
            AND p.seccion_id = s.id
        WHERE m.carrera_codigo = ?
        AND m.activo = TRUE
        AND s.activo = TRUE
        AND p.docente_cedula = ?
        AND p.activo = TRUE
        ORDER BY m.semestre
    `;

    connection.query(query, [carrera, cedula], (error, results) => {
        if(error) {
            console.error('Error al obtener semestres:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        res.json(results.map(r => r.semestre));
    });
});

// Obtener materias por carrera, semestre y permisos
router.get("/teacher/materias/:carrera/:semestre", (req, res) => {
    const { carrera, semestre } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT DISTINCT m.codigo, m.nombre, m.semestre, m.creditos
        FROM materia m
        INNER JOIN seccion s ON m.codigo = s.materia_codigo
        INNER JOIN permisos p ON p.carrera_codigo = m.carrera_codigo
            AND p.semestre = m.semestre
            AND p.materia_codigo = m.codigo
            AND p.seccion_id = s.id
        WHERE m.carrera_codigo = ?
        AND m.semestre = ?
        AND m.activo = TRUE
        AND s.activo = TRUE
        AND p.docente_cedula = ?
        AND p.activo = TRUE
        ORDER BY m.nombre
    `;

    connection.query(query, [carrera, semestre, cedula], (error, results) => {
        if(error) {
            console.error('Error al obtener materias:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// Obtener secciones por materia y permisos
router.get("/teacher/secciones/:materia", (req, res) => {
    const { materia } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT
            s.id,
            s.codigo,
            s.lapso_academico,
            s.horario,
            s.aula,
            s.capacidad_maxima
        FROM seccion s
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.materia_codigo = s.materia_codigo
        WHERE s.materia_codigo = ?
        AND p.docente_cedula = ?
        AND s.activo = TRUE
        AND p.activo = TRUE
        ORDER BY s.lapso_academico DESC, s.codigo
    `;

    connection.query(query, [materia, cedula], (error, results) => {
        if(error) {
            console.error('Error al obtener secciones:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});

module.exports = router;
