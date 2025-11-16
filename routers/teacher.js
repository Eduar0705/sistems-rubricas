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
        FROM rubrica_evaluacion
        WHERE docente_cedula = ? AND activo = TRUE
    `;

    // Consulta para contar estudiantes asociados al docente (a través de secciones donde imparte)
    const queryEstudiantes = `
        SELECT COUNT(DISTINCT e.cedula) as total_estudiantes
        FROM estudiante e
        INNER JOIN inscripcion_seccion i ON e.cedula = i.estudiante_cedula
        INNER JOIN seccion s ON i.seccion_id = s.id
        WHERE s.id IN (
            SELECT DISTINCT seccion_id
            FROM rubrica_evaluacion
            WHERE docente_cedula = ? AND activo = TRUE
        ) AND e.activo = 1
    `;

    // Consulta para contar evaluaciones completadas del docente
    const queryEvaluaciones = `
        SELECT COUNT(*) as total_evaluaciones
        FROM evaluacion_estudiante ev
        INNER JOIN rubrica_evaluacion r ON ev.rubrica_id = r.id
        WHERE r.docente_cedula = ? AND r.activo = TRUE
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
        })
    ];

    Promise.all(queries)
        .then(([totalRubricas, totalEstudiantes, totalEvaluaciones]) => {
            res.render("home/teacher", {
                datos: req.session,
                totalRubricas: totalRubricas,
                totalEstudiantes: totalEstudiantes,
                totalEvaluaciones: totalEvaluaciones,
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
                totalEvaluaciones: 0
            });
        });
});

module.exports = router;