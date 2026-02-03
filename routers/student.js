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
        SELECT 
            COUNT(DISTINCT e.id) as total
        FROM evaluacion e
        INNER JOIN seccion s ON s.id_materia_plan = e.id_materia_plan AND s.letra = e.letra
        INNER JOIN inscripcion_seccion ins ON ins.id_materia_plan = s.id_materia_plan AND ins.letra = s.letra
        INNER JOIN plan_periodo pp ON ins.id_materia_plan = pp.id
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id AND ru.estado = "Aprobado"
        INNER JOIN rubrica r ON ru.id_rubrica = r.id
        WHERE ins.cedula_estudiante = ?
        AND r.activo = 1;
    `;

    // Consulta para evaluaciones completadas (con puntaje)
    const queryEvaluacionesCompletadas = `
        SELECT COUNT(DISTINCT er.id) as total
        FROM evaluacion_realizada er
        WHERE er.cedula_evaluado = ?;
    `;

    // Consulta para evaluaciones pendientes (sin puntaje)
    const queryEvaluacionesPendientes = `
        SELECT 
            COUNT(DISTINCT e.id) as total
        FROM evaluacion e
        LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
        INNER JOIN seccion s ON s.id_materia_plan = e.id_materia_plan AND s.letra = e.letra
        INNER JOIN inscripcion_seccion ins ON ins.id_materia_plan = s.id_materia_plan AND ins.letra = s.letra
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON ru.id_rubrica = r.id
        WHERE ins.cedula_estudiante = ? 
        AND e.fecha_evaluacion < CURDATE()
        AND r.activo = 1
        AND er.id_evaluacion IS NULL
    `;

    // Consulta para evaluadas recientemente (últimas 3 con puntaje)
    const queryEvaluacionesRecientes = `
        SELECT 
            r.nombre_rubrica,
            m.nombre as materia,
            SUM(de.puntaje_obtenido) as puntaje_total,
            er.fecha_evaluado as fecha_evaluacion,
            tr.nombre AS tipo_evaluacion
        FROM evaluacion e
        INNER JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
        INNER JOIN rubrica_uso ru ON ru.id_eval = er.id_evaluacion
        INNER JOIN rubrica r ON ru.id_rubrica = r.id
        INNER JOIN plan_periodo pp ON e.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
        INNER JOIN tipo_rubrica tr ON tr.id = r.id_tipo
        WHERE er.cedula_evaluado = ? 
        GROUP BY e.id
        ORDER BY er.fecha_evaluado DESC
        LIMIT 3
    `;

    // Consulta para próximas evaluaciones
    const queryProximasEvaluaciones = `
        SELECT 
            r.nombre_rubrica,
            m.nombre as materia,
            e.fecha_evaluacion,
            tr.nombre as tipo_evaluacion,
            SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion
        FROM evaluacion e
        INNER JOIN seccion s ON s.id_materia_plan = e.id_materia_plan AND s.letra = e.letra
        INNER JOIN inscripcion_seccion ins ON ins.id_materia_plan = s.id_materia_plan AND ins.letra = s.letra
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON ru.id_rubrica = r.id
        INNER JOIN criterio_rubrica cr ON r.id = cr.rubrica_id
        INNER JOIN plan_periodo pp ON e.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN tipo_rubrica tr ON tr.id = r.id_tipo
        WHERE ins.cedula_estudiante = ? 
        AND e.fecha_evaluacion > CURDATE()
        AND r.activo = 1
        GROUP BY e.id
        ORDER BY e.fecha_evaluacion ASC
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
