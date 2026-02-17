const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/home", function (req, res) {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Contar los profesores
    let countProf = `SELECT 
                        COUNT(*) AS totalProfesores 
                    FROM usuario_docente ud
                    INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                    WHERE u.activo = 1`;
    conexion.query(countProf, (err, profesResult) => {
        if (err) {
            console.log('Error al contar profesores: ', err);
            profesResult = [{ totalProfesores: 0 }];
        }

        // Contar las Rúbricas
        let countRubricas = 'SELECT COUNT(*) AS totalRubricas FROM rubrica WHERE activo = 1';
        conexion.query(countRubricas, (err, rubricasResult) => {
            if (err) {
                console.log('Error al contar rúbricas: ', err);
                rubricasResult = [{ totalRubricas: 0 }];
            }

            // **NUEVA CONSULTA: Contar evaluaciones pendientes**
            let countEvaluacionesPendientes = `
            SELECT 
            SUM(CASE WHEN eval_est.id IS NULL THEN 1 ELSE 0 END) AS totalEvaluacionesPendientes
            FROM evaluacion e
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval
            INNER JOIN rubrica r ON ru.id_rubrica = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            INNER JOIN
                (
                        SELECT 
                            COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
                            ins.id_seccion
                        FROM inscripcion_seccion ins
                        GROUP BY ins.id_seccion
                    ) AS estud_sec on s.id = estud_sec.id_seccion
            INNER JOIN permiso_docente pd ON estud_sec.id_seccion = pd.id_seccion
            INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
            INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                    LEFT JOIN 
                    (
                        SELECT 
                            er.id,
                            er.id_evaluacion,
                            SUM(de.puntaje_obtenido) AS puntaje_eval
                        FROM evaluacion_realizada er 
                        INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                        GROUP BY er.id
                    ) AS eval_est ON eval_est.id_evaluacion = e.id;
            `;

            conexion.query(countEvaluacionesPendientes, (err, evaluacionesResult) => {
                if (err) {
                    console.log('Error al contar evaluaciones pendientes: ', err);
                    evaluacionesResult = [{ totalEvaluacionesPendientes: 0 }];
                }

                // Obtener rúbricas recientes (máximo 5)
                let recentRubricasQuery = `
                    SELECT 
                        r.id, 
                        r.nombre_rubrica, 
                        r.fecha_creacion,
                        r.instrucciones AS descripcion,
                        m.nombre AS materia_nombre,
                        GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion
                    FROM rubrica r
                    INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                    INNER JOIN evaluacion e ON e.id = ru.id_eval
                    INNER JOIN seccion s ON e.id_seccion = s.id
                    INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                    INNER JOIN materia m ON pp.codigo_materia = m.codigo
                    LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
                    LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
                    WHERE r.activo = 1
                    GROUP BY r.id
                    ORDER BY r.fecha_actualizacion DESC
                    LIMIT 4;
                `;

                conexion.query(recentRubricasQuery, (err, recentRubricasResult) => {
                    if (err) {
                        console.log('Error al obtener rúbricas recientes: ', err);
                        recentRubricasResult = [];
                    }

                    const rubricasRecientes = recentRubricasResult.map(rubrica => {
                        const fechaReferencia = rubrica.fecha_actualizacion || rubrica.fecha_creacion;
                        return {
                            id: rubrica.id,
                            nombre: rubrica.nombre_rubrica,
                            tipo: rubrica.tipo_evaluacion,
                            descripcion: rubrica.descripcion,
                            materia: rubrica.materia_nombre,
                            tiempo_transcurrido: calcularTiempoTranscurrido(fechaReferencia)
                        };
                    });

                    // Obtener actividad reciente (últimas evaluaciones completadas por profesores)
                    let recentActivityQuery = `
                        SELECT
                            er.id,
                            er.fecha_evaluado AS fecha_evaluacion,
                            u.nombre AS estudiante_nombre,
                            u.apeliido AS estudiante_apellido,
                            r.nombre_rubrica,
                            m.nombre AS materia_nombre,
                            uh.nombre AS docente_nombre,
                            uh.apeliido AS docente_apellido,
                            ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS puntaje_total
                        FROM rubrica r
                        INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                        INNER JOIN evaluacion e ON ru.id_eval = e.id
                        INNER JOIN seccion s ON e.id_seccion = s.id
                        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                        INNER JOIN materia m ON pp.codigo_materia = m.codigo
                        INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
                        INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
                        INNER JOIN usuario uh ON uh.cedula = pd.docente_cedula
                        INNER JOIN inscripcion_seccion ins ON pd.id_seccion = ins.id_seccion
                        INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                        INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
                        LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
                        LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                        AND r.activo = 1
                        AND u.activo = 1
                        AND er.id IS NOT NULL
                        GROUP BY er.id, er.fecha_evaluado, ins.cedula_estudiante, ins.id_seccion
                        ORDER BY fecha_evaluado DESC
                        LIMIT 4;
                    `;

                    conexion.query(recentActivityQuery, (err, activityResult) => {
                        if (err) {
                            console.log('Error al obtener actividad reciente: ', err);
                            activityResult = [];
                        }

                        const actividadReciente = activityResult.map(actividad => {
                            return {
                                id: actividad.id,
                                estudiante_nombre: actividad.estudiante_nombre,
                                estudiante_apellido: actividad.estudiante_apellido,
                                rubrica_nombre: actividad.nombre_rubrica,
                                materia_nombre: actividad.materia_nombre,
                                docente_nombre: actividad.docente_nombre,
                                docente_apellido: actividad.docente_apellido,
                                puntaje_total: actividad.puntaje_total,
                                tiempo_transcurrido: calcularTiempoTranscurrido(actividad.fecha_evaluacion)
                            };
                        });

                        const totalProfesores = profesResult[0].totalProfesores;
                        const totalRubricas = rubricasResult[0].totalRubricas;
                        const totalEvaluacionesPendientes = evaluacionesResult[0].totalEvaluacionesPendientes;

                        // Renderizar con todos los datos obtenidos
                        res.render("home/index", {
                            datos: req.session,
                            title: 'Sistema de Gestión de Rúbricas',
                            totalProfesores: totalProfesores,
                            totalRubricas: totalRubricas,
                            totalEvaluacionesPendientes: totalEvaluacionesPendientes,
                            rubricasRecientes: rubricasRecientes,
                            actividadReciente: actividadReciente,
                            currentPage: 'home'
                        });
                    });
                });
            });
        });
    });
});

// Función para calcular el tiempo transcurrido
function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const fechaRubrica = new Date(fecha);
    const diferencia = ahora - fechaRubrica;

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30);

    if (meses > 0) {
        return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
    } else if (semanas > 0) {
        return semanas === 1 ? 'hace 1 semana' : `hace ${semanas} semanas`;
    } else if (dias > 0) {
        return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
    } else if (horas > 0) {
        return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
    } else if (minutos > 0) {
        return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`;
    } else {
        return 'hace unos segundos';
    }
}

module.exports = router;