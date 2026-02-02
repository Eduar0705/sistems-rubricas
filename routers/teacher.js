const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/teacher", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const cedula = req.session.cedula;

    // Consulta para contar rúbricas del docente
    const queryRubricas = `
        SELECT COUNT(*) as total_rubricas
        FROM rubrica
        WHERE cedula_docente = ? AND activo = 1
    `;

    // Consulta para contar estudiantes asociados al docente (a través de secciones donde imparte)
    const queryEstudiantes = `
        SELECT COUNT(DISTINCT u.cedula) as total_estudiantes
        FROM usuario u
        INNER JOIN usuario_estudiante ue ON u.cedula = ue.cedula_usuario
        INNER JOIN inscripcion_seccion ins ON ue.cedula_usuario = ins.cedula_estudiante
        INNER JOIN seccion s ON ins.id_materia_plan = s.id_materia_plan AND ins.letra = s.letra
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
        WHERE pd.docente_cedula = ? AND u.activo = 1
    `;

    // Consulta para contar evaluaciones completadas del docente
    const queryEvaluaciones = `
        SELECT COUNT(*) as total_evaluaciones
        FROM evaluacion_realizada er
        INNER JOIN usuario_estudiante ue ON er.cedula_evaluado = ue.cedula_usuario
        INNER JOIN evaluacion e ON er.id_evaluacion = e.id
        INNER JOIN rubrica_uso ru ON e.id = ru.id_eval
        INNER JOIN rubrica r ON ru.id_rubrica = r.id
        WHERE er.cedula_evaluador = ? AND r.activo = 1
    `;

    // Consulta para obtener rúbricas recientes del docente
    const queryRubricasRecientes = `
        SELECT id, nombre_rubrica, fecha_actualizacion
        FROM rubrica
        WHERE cedula_docente = ? AND activo = 1
        ORDER BY fecha_actualizacion DESC
        LIMIT 3
    `;

    // Consulta para obtener actividad reciente (últimos estudiantes evaluados del docente)
    const queryActividadReciente = `
        SELECT 
            er.id,
            er.fecha_evaluado,
            SUM(de.puntaje_obtenido) AS puntaje_total,
            u.nombre AS estudiante_nombre,
            u.apeliido AS estudiante_apellido,
            r.nombre_rubrica,
            m.nombre AS materia_nombre
        FROM evaluacion_realizada er
        INNER JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id
        INNER JOIN usuario u ON er.cedula_evaluado = u.cedula
        INNER JOIN evaluacion e ON er.id_evaluacion = e.id
        INNER JOIN seccion s ON s.id_materia_plan = e.id_materia_plan AND s.letra = e.letra
        INNER JOIN inscripcion_seccion ins ON s.id_materia_plan = ins.id_materia_plan AND s.letra = ins.letra
        INNER JOIN plan_periodo pp ON e.id_materia_plan = pp.id 
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON ru.id_rubrica = r.id
        WHERE r.cedula_docente = ? 
          AND r.activo = 1
          AND u.activo = 1
        ORDER BY er.fecha_evaluado DESC
        LIMIT 4
    `;

    // Ejecutar consultas en paralelo
    const queries = [
        new Promise((resolve, reject) => {
            conexion.query(queryRubricas, [cedula], (error, results) => {
                if (error) reject(error);
                else resolve(results[0].total_rubricas || 0);
            });
        }),
        new Promise((resolve, reject) => {
            conexion.query(queryEstudiantes, [cedula], (error, results) => {
                if (error) reject(error);
                else resolve(results[0].total_estudiantes || 0);
            });
        }),
        new Promise((resolve, reject) => {
            conexion.query(queryEvaluaciones, [cedula], (error, results) => {
                if (error) reject(error);
                else resolve(results[0].total_evaluaciones || 0);
            });
        }),
        new Promise((resolve, reject) => {
            conexion.query(queryRubricasRecientes, [cedula], (error, results) => {
                if (error) reject(error);
                else resolve(results || []);
            });
        }),
        new Promise((resolve, reject) => {
            conexion.query(queryActividadReciente, [cedula], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const actividadFormateada = results.map(ev => {
                        const iniciales = (ev.estudiante_nombre.charAt(0) + ev.estudiante_apellido.charAt(0)).toUpperCase();
                        const fecha = ev.fecha_evaluacion ? 
                            new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }) : 'Sin fecha';

                        return {
                            ...ev,
                            iniciales,
                            fecha_formateada: fecha
                        };
                    });

                    resolve(actividadFormateada);
                }
            });
        })
    ];

    Promise.all(queries)
        .then(([totalRubricas, totalEstudiantes, totalEvaluaciones, rubricasRecientes, actividadReciente]) => {
            res.render("home/teacher", {
                datos: req.session,
                totalRubricas: totalRubricas,
                totalEstudiantes: totalEstudiantes,
                totalEvaluaciones: totalEvaluaciones,
                rubricasRecientes: rubricasRecientes,
                actividadReciente: actividadReciente,
                title: 'Sistema de Gestion de Rubricas',
                currentPage: 'home'
            });
        })
        .catch(error => {
            console.error('Error al obtener estadísticas:', error);
            // En caso de error, mostrar valores por defecto
            res.render("home/teacher", {
                datos: req.session,
                totalRubricas: 0,
                totalEstudiantes: 0,
                totalEvaluaciones: 0,
                rubricasRecientes: [],
                actividadReciente: []
            });
        });
});

module.exports = router;