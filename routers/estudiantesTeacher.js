const express = require('express')
const router = express.Router()
const modelo = require('../models/conetion')

router.get('/teacher/students', async function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    try {
        const docenteCedula = req.session.cedula;
        const esAdmin = req.session.id_rol === 1;

        let query;
        let queryParams = [];

        if (esAdmin) {
            // Admin puede ver todos los estudiantes
            query = `
                SELECT
                    e.cedula,
                    e.nombre,
                    e.apellido,
                    e.email,
                    e.telefono,
                    e.fecha_nacimiento,
                    e.activo,
                    c.codigo as carrera_codigo,
                    c.nombre as carrera_nombre,
                    c.duracion_semestres,
                    GROUP_CONCAT(DISTINCT s.codigo ORDER BY s.codigo SEPARATOR ', ') as seccion,
                    COUNT(ev.id) as total_evaluaciones,
                    COALESCE(AVG(ev.puntaje_total), 0) as promedio_puntaje,
                    MAX(ev.fecha_evaluacion) as ultima_evaluacion
                FROM sistems_rubricas.estudiante e
                LEFT JOIN sistems_rubricas.carrera c ON e.carrera_codigo = c.codigo
                LEFT JOIN sistems_rubricas.inscripcion_seccion i ON e.cedula = i.estudiante_cedula
                LEFT JOIN sistems_rubricas.seccion s ON i.seccion_id = s.id AND s.activo = 1
                LEFT JOIN sistems_rubricas.evaluacion_estudiante ev ON e.cedula = ev.estudiante_cedula
                WHERE e.activo = 1
                GROUP BY
                    e.cedula, e.nombre, e.apellido, e.email, e.telefono,
                    e.fecha_nacimiento, e.activo, c.codigo, c.nombre, c.duracion_semestres
                ORDER BY e.apellido, e.nombre
            `;
        } else {
            // Docente solo ve estudiantes de secciones a las que tiene permiso
            query = `
                SELECT
                    e.cedula,
                    e.nombre,
                    e.apellido,
                    e.email,
                    e.telefono,
                    e.fecha_nacimiento,
                    e.activo,
                    c.codigo as carrera_codigo,
                    c.nombre as carrera_nombre,
                    c.duracion_semestres,
                    GROUP_CONCAT(DISTINCT s.codigo ORDER BY s.codigo SEPARATOR ', ') as seccion,
                    COUNT(ev.id) as total_evaluaciones,
                    COALESCE(AVG(ev.puntaje_total), 0) as promedio_puntaje,
                    MAX(ev.fecha_evaluacion) as ultima_evaluacion
                FROM sistems_rubricas.estudiante e
                INNER JOIN sistems_rubricas.inscripcion_seccion i ON e.cedula = i.estudiante_cedula
                INNER JOIN sistems_rubricas.seccion s ON i.seccion_id = s.id AND s.activo = 1
                INNER JOIN sistems_rubricas.permisos p ON s.id = p.seccion_id
                LEFT JOIN sistems_rubricas.carrera c ON e.carrera_codigo = c.codigo
                LEFT JOIN sistems_rubricas.evaluacion_estudiante ev ON e.cedula = ev.estudiante_cedula
                WHERE e.activo = 1
                AND p.docente_cedula = ?
                AND p.activo = 1
                GROUP BY
                    e.cedula, e.nombre, e.apellido, e.email, e.telefono,
                    e.fecha_nacimiento, e.activo, c.codigo, c.nombre, c.duracion_semestres
                ORDER BY e.apellido, e.nombre
            `;
            queryParams = [docenteCedula];
        }

        modelo.query(query, queryParams, function(error, estudiantes) {
            if (error) {
                console.error('Error al obtener estudiantes:', error);
                return res.status(500).send(`
                    <h1>Error de Base de Datos</h1>
                    <p>No se pudo cargar la información de estudiantes: ${error.message}</p>
                `);
            }

            res.render("teacher/estudiantes", {
                datos: req.session,
                title: 'SGR - Estudiantes',
                estudiantes: estudiantes
            });
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).send(`
            <h1>Error del Servidor</h1>
            <p>Ha ocurrido un error inesperado: ${error.message}</p>
        `);
    }
});

// Ruta para obtener datos individuales del estudiante
router.get('/teacher/students/:cedula', async function(req, res){
    if(!req.session.login){
        return res.status(401).json({error: 'No autorizado'});
    }

    try {
        const query = `
            SELECT
                e.cedula,
                e.nombre,
                e.apellido,
                e.email,
                e.telefono,
                e.fecha_nacimiento,
                e.activo as estudiante_activo,
                c.codigo as carrera_codigo,
                c.nombre as carrera_nombre,
                GROUP_CONCAT(DISTINCT s.codigo ORDER BY s.codigo SEPARATOR ', ') as seccion,
                COUNT(ev.id) as total_evaluaciones,
                COALESCE(AVG(ev.puntaje_total), 0) as promedio_puntaje,
                MAX(ev.fecha_evaluacion) as ultima_evaluacion
            FROM sistems_rubricas.estudiante e
            LEFT JOIN sistems_rubricas.carrera c ON e.carrera_codigo = c.codigo
            LEFT JOIN sistems_rubricas.inscripcion_seccion i ON e.cedula = i.estudiante_cedula
            LEFT JOIN sistems_rubricas.seccion s ON i.seccion_id = s.id AND s.activo = 1
            LEFT JOIN sistems_rubricas.evaluacion_estudiante ev ON e.cedula = ev.estudiante_cedula
            WHERE e.cedula = ?
            GROUP BY
                e.cedula, e.nombre, e.apellido, e.email, e.telefono,
                e.fecha_nacimiento, e.activo, c.codigo, c.nombre
        `;

        modelo.query(query, [req.params.cedula], function(error, resultados) {
            if (error) {
                console.error('Error:', error);
                return res.status(500).json({error: 'Error del servidor'});
            }
            
            if (resultados.length === 0) {
                return res.status(404).json({error: 'Estudiante no encontrado'});
            }

            res.json(resultados[0]);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Error del servidor'});
    }
});

module.exports = router;
