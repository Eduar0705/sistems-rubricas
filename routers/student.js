const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/student", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const cedula = req.session.cedula;

    // Consulta para obtener las rúbricas activas del estudiante
    const queryRubricasActivas = `
        SELECT COUNT(DISTINCT r.id) as total
        FROM rubrica_evaluacion r
        INNER JOIN evaluacion_estudiante ee ON r.id = ee.rubrica_id
        WHERE ee.estudiante_cedula = ? 
        AND r.activo = 1
        AND r.fecha_evaluacion >= CURDATE()
    `;

    // Consulta para evaluaciones completadas (con puntaje)
    const queryEvaluacionesCompletadas = `
        SELECT COUNT(*) as total
        FROM evaluacion_estudiante
        WHERE estudiante_cedula = ? 
        AND puntaje_total IS NOT NULL
    `;

    // Consulta para evaluaciones pendientes (sin puntaje)
    const queryEvaluacionesPendientes = `
        SELECT COUNT(*) as total
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
        WHERE ee.estudiante_cedula = ? 
        AND ee.puntaje_total IS NULL
        AND r.activo = 1
    `;

    // Consulta para evaluaciones recientes (últimas 3 con puntaje)
    const queryEvaluacionesRecientes = `
        SELECT 
            r.nombre_rubrica,
            m.nombre as materia,
            CAST(ee.puntaje_total AS DECIMAL(10, 2)) as puntaje_total,
            ee.fecha_evaluacion,
            r.tipo_evaluacion
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        WHERE ee.estudiante_cedula = ? 
        AND ee.puntaje_total IS NOT NULL
        ORDER BY ee.fecha_evaluacion DESC
        LIMIT 3
    `;

    // Consulta para próximas evaluaciones
    const queryProximasEvaluaciones = `
        SELECT 
            r.nombre_rubrica,
            m.nombre as materia,
            r.fecha_evaluacion,
            r.tipo_evaluacion,
            r.porcentaje_evaluacion
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        WHERE ee.estudiante_cedula = ? 
        AND r.fecha_evaluacion >= CURDATE()
        AND r.activo = 1
        ORDER BY r.fecha_evaluacion ASC
        LIMIT 5
    `;

    // Ejecutar todas las consultas
    conexion.query(queryRubricasActivas, [cedula], (err1, rubricasActivas) => {
        if (err1) {
            console.error('Error en rubricasActivas:', err1);
            return res.status(500).send('Error al obtener datos');
        }

        conexion.query(queryEvaluacionesCompletadas, [cedula], (err2, completadas) => {
            if (err2) {
                console.error('Error en completadas:', err2);
                return res.status(500).send('Error al obtener datos');
            }

            conexion.query(queryEvaluacionesPendientes, [cedula], (err3, pendientes) => {
                if (err3) {
                    console.error('Error en pendientes:', err3);
                    return res.status(500).send('Error al obtener datos');
                }

                conexion.query(queryEvaluacionesRecientes, [cedula], (err4, recientes) => {
                    if (err4) {
                        console.error('Error en recientes:', err4);
                        return res.status(500).send('Error al obtener datos');
                    }

                    conexion.query(queryProximasEvaluaciones, [cedula], (err5, proximas) => {
                        if (err5) {
                            console.error('Error en proximas:', err5);
                            return res.status(500).send('Error al obtener datos');
                        }

                        // Preparar datos para la vista
                        const datosVista = {
                            datos: req.session,
                            currentPage: 'student',
                            stats: {
                                rubricasActivas: rubricasActivas[0].total,
                                evaluacionesCompletadas: completadas[0].total,
                                evaluacionesPendientes: pendientes[0].total
                            },
                            evaluacionesRecientes: recientes,
                            proximasEvaluaciones: proximas
                        };

                        res.render("home/studens", datosVista);
                    });
                });
            });
        });
    });
});

module.exports = router;
