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
			cedula,
            nombre,
            apellido,
            email,
            fecha_nacimiento,
            activo,
            carrera_codigo,
            carrera_nombre,
            duracion_semestres,
            seccion,
            total_evaluaciones,
            promedio_puntaje,
            ultima_evaluacion
	FROM
    (        	SELECT
					ins.cedula_estudiante AS cedula,
                    u.nombre AS nombre,
     				u.apeliido AS apellido,
                    u.email,
     				u.fecha_creacion AS fecha_nacimiento,
     				u.activo,
     				ue.codigo_carrera AS carrera_codigo,
     				c.nombre AS carrera_nombre,
     				COUNT(DISTINCT num_semestre) AS duracion_semestres,
                    CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion,
                    COUNT(e.id) AS total_evaluaciones, 
                    ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS promedio_puntaje,
                    IFNULL(MAX(er.fecha_evaluado), 'Sin registros.') AS ultima_evaluacion
                FROM evaluacion e
                INNER JOIN seccion s ON e.id_seccion = s.id
                INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                INNER JOIN materia m ON pp.codigo_materia = m.codigo
                INNER JOIN inscripcion_seccion ins ON s.id = ins.id_seccion
            	INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                INNER JOIN usuario u ON ue.cedula_usuario = u.cedula AND u.activo = 1
                LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
            	LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                GROUP BY ins.cedula_estudiante, ins.id_seccion
                ORDER BY promedio_puntaje DESC
     ) AS subquery;
            `;
        } else {
            // Docente solo ve estudiantes de secciones a las que tiene permiso
            query = `
        SELECT
			cedula,
            nombre,
            apellido,
            email,
            fecha_nacimiento,
            activo,
            carrera_codigo,
            carrera_nombre,
            duracion_semestres,
            seccion,
            total_evaluaciones,
            promedio_puntaje,
            ultima_evaluacion
	FROM
    (        	SELECT
					ins.cedula_estudiante AS cedula,
                    u.nombre AS nombre,
     				u.apeliido AS apellido,
                    u.email,
     				u.fecha_creacion AS fecha_nacimiento,
     				u.activo,
     				ue.codigo_carrera AS carrera_codigo,
     				c.nombre AS carrera_nombre,
     				COUNT(DISTINCT num_semestre) AS duracion_semestres,
                    CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion,
                    COUNT(e.id) AS total_evaluaciones, 
                    ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS promedio_puntaje,
                    IFNULL(MAX(er.fecha_evaluado), 'Sin registros.') AS ultima_evaluacion
                FROM evaluacion e
                INNER JOIN seccion s ON e.id_seccion = s.id
                INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                INNER JOIN materia m ON pp.codigo_materia = m.codigo
                INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
                INNER JOIN inscripcion_seccion ins ON pd.id_seccion = ins.id_seccion
            	INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                INNER JOIN usuario u ON ue.cedula_usuario = u.cedula AND u.activo = 1
                LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
            	LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                WHERE pd.docente_cedula = ?
                GROUP BY ins.cedula_estudiante, ins.id_seccion
                ORDER BY promedio_puntaje DESC
     ) AS subquery;
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
                estudiantes: estudiantes,
                currentPage: 'student'
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
                	ins.cedula_estudiante AS cedula,
                    u.nombre AS nombre,
     				u.apeliido AS apellido,
                    u.email,
     				u.fecha_creacion AS fecha_nacimiento,
     				u.activo AS estudiante_activo,
     				ue.codigo_carrera AS carrera_codigo,
     				c.nombre AS carrera_nombre,
     				COUNT(DISTINCT num_semestre) AS duracion_semestres,
                    CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion,
                    COUNT(e.id) AS total_evaluaciones, 
                    ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS promedio_puntaje,
                    IFNULL(MAX(er.fecha_evaluado), 'Sin registros.') AS ultima_evaluacion
           FROM evaluacion e
                INNER JOIN seccion s ON e.id_seccion = s.id
                INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                INNER JOIN inscripcion_seccion ins ON s.id = ins.id_seccion
            	INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                INNER JOIN usuario u ON ue.cedula_usuario = u.cedula AND u.activo = 1
                LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
            	LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id AND u.cedula = er.cedula_evaluado
            WHERE u.cedula = ?
            GROUP BY
                cedula, nombre, apellido, carrera_codigo;
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
