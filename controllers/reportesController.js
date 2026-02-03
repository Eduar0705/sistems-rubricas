const conexion = require('../models/conetion');

// =============================================
// REPORTES DE ADMINISTRADOR
// =============================================
const getAdminReports = (req, res) => {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Consultas comprehensivas para reportes de administrador enfocados en profesores
    const queries = {
        // Estadísticas generales
        totalEstudiantes: "SELECT COUNT(*) AS total FROM usuario_estudiante ue INNER JOIN usuario u ON ue.cedula_usuario = u.cedula WHERE u.activo = 1",
        totalDocentes: "SELECT COUNT(*) AS total FROM usuario_docente ue INNER JOIN usuario u ON ue.cedula_usuario = u.cedula WHERE u.activo = 1",
        totalRubricas: "SELECT COUNT(*) as total FROM rubrica WHERE activo = 1",
        totalEvaluaciones: "SELECT COUNT(*) AS total FROM evaluacion_realizada",
        promedioGeneral: `
            SELECT subquery.sumatoria_notas/subquery.cantidad_estudiantes AS promedio
            FROM (
                SELECT
  				SUM(de.puntaje_obtenido) as sumatoria_notas,
                COUNT(de.puntaje_obtenido) as cantidad_notas,
                COUNT(ins.cedula_estudiante) AS cantidad_estudiantes
                FROM evaluacion e
                INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                INNER JOIN inscripcion_seccion ins ON s.id_materia_plan = ins.id_materia_plan AND s.letra = ins.letra
            	INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND ue.cedula_usuario = er.cedula_evaluado
            	LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                 ) AS subquery;
        `,

        // Top profesores por número de rúbricas creadas
        topProfesoresPorRubricas: `
            SELECT 
                u.cedula,
                CONCAT(u.nombre, ' ', u.apeliido) as nombre_completo,
                ud.especializacion,
                COUNT(r.id) as total_rubricas,
                COUNT(DISTINCT pp.codigo_materia) as materias_distintas
            FROM usuario u 
            INNER JOIN usuario_docente ud ON u.cedula = ud.cedula_usuario
            LEFT JOIN rubrica r ON ud.cedula_usuario = r.cedula_docente AND r.activo = 1
            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica AND ru.estado = "Aprobado"
            INNER JOIN evaluacion e ON e.id = ru.id_eval
            INNER JOIN plan_periodo pp ON e.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            WHERE u.activo = 1
            GROUP BY u.cedula
            ORDER BY total_rubricas DESC
            LIMIT 10;
        `,

        // Top profesores por número de evaluaciones completadas
        topProfesoresPorEvaluaciones: `
        SELECT 
            u.cedula,
            CONCAT(u.nombre, ' ', u.apeliido) AS nombre_completo,
            ud.especializacion,
            COUNT(e.id) AS total_evaluaciones,
            AVG(COALESCE(puntaje_eval, 0)) AS promedio_calificaciones
            FROM evaluacion e
            INNER JOIN permiso_docente pd ON e.id_materia_plan = pd.id_materia_plan AND e.letra = pd.letra_sec
            INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
            INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
            LEFT JOIN 
            (
                SELECT 
                    er.id,
                    er.id_evaluacion,
                    er.cedula_evaluador,
                    SUM(de.puntaje_obtenido) AS puntaje_eval
                FROM evaluacion_realizada er 
                INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                GROUP BY er.id
            ) AS eval_est ON eval_est.id_evaluacion = e.id AND u.cedula = eval_est.cedula_evaluador
            GROUP BY u.cedula
            ORDER BY total_evaluaciones DESC
            LIMIT 10;
        `,

        // Profesores inactivos (sin rúbricas)
        profesoresInactivos: `
            SELECT 
                u.cedula,
                CONCAT(u.nombre, ' ',u.apeliido) as nombre_completo,
                ud.especializacion,
                u.email
            FROM usuario u 
            INNER JOIN usuario_docente ud ON u.cedula = ud.cedula_usuario
            LEFT JOIN rubrica r ON u.cedula = r.cedula_docente AND r.activo = 1
            WHERE u.activo = 1
            GROUP BY u.cedula, u.nombre, u.apeliido, ud.especializacion
            HAVING COUNT(r.id) = 0
            ORDER BY u.nombre, u.apeliido;
        `,

        // Profesores con baja actividad (sin evaluaciones recientes en 30 días)
        profesoresBajaActividad: `
            SELECT 
                u.cedula,
                CONCAT(u.nombre, ' ', u.apeliido) as nombre_completo,
                ud.especializacion,
                MAX(er.fecha_evaluado) as ultima_evaluacion,
                DATEDIFF(NOW(), MAX(er.fecha_evaluado)) as dias_inactivo
            FROM usuario u
            INNER JOIN usuario_docente ud ON u.cedula = ud.cedula_usuario
            LEFT JOIN evaluacion_realizada er ON ud.cedula_usuario = er.cedula_evaluador
            WHERE u.activo = 1
            GROUP BY u.cedula, u.nombre, u.apeliido, ud.especializacion
            HAVING MAX(er.fecha_evaluado) IS NULL OR DATEDIFF(NOW(), MAX(er.fecha_evaluado)) > 30
            ORDER BY dias_inactivo DESC
        `,

        // Tasa de completitud de evaluaciones por profesor
        tasaCompletitudPorProfesor: `
            SELECT 
            u.cedula,
            CONCAT(u.nombre, ' ', u.apeliido) AS nombre_completo,
        COUNT(e.id),
        estud_sec.cantidad_en_seccion,
	    COUNT(e.id)*estud_sec.cantidad_en_seccion AS total_asignadas,
	    (COUNT(eval_est.id)/(COUNT(e.id)*estud_sec.cantidad_en_seccion))*100 AS porcentaje_completitud,
        COUNT(eval_est.id) AS completadas
            FROM evaluacion e
	    INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
	    INNER JOIN
	(
		SELECT 
			COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
			ins.id_materia_plan,
			ins.letra
		FROM inscripcion_seccion ins
		GROUP BY ins.id_materia_plan, ins.letra
	) AS estud_sec on s.id_materia_plan = estud_sec.id_materia_plan AND s.letra = estud_sec.letra
            INNER JOIN permiso_docente pd ON estud_sec.id_materia_plan = pd.id_materia_plan AND estud_sec.letra = pd.letra_sec
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
            ) AS eval_est ON eval_est.id_evaluacion = e.id
            GROUP BY u.cedula
            ORDER BY total_asignadas DESC
            LIMIT 15;
        `,

        // Actividad mensual (últimos 2 meses) PROBAR
        actividadMensual: `
            SELECT 
                DATE_FORMAT(er.fecha_evaluado, '%Y-%m') as mes,
                COUNT(DISTINCT r.cedula_docente) as profesores_activos,
                COUNT(er.id) as total_evaluaciones,
                COUNT(DISTINCT r.id) as rubricas_usadas
            FROM evaluacion_realizada er
            RIGHT JOIN evaluacion e ON er.id_evaluacion = e.id
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval AND ru.estado = "Aprobado"
            INNER JOIN rubrica r ON ru.id_rubrica = r.id
            WHERE er.fecha_evaluado >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
            GROUP BY DATE_FORMAT(er.fecha_evaluado, '%Y-%m')
            ORDER BY mes ASC
        `,

        // Rendimiento por carrera REVISAR
        rendimientoCarrera: `
        SELECT 
            c.nombre,
            AVG(puntaje_eval) AS promedio
        FROM carrera c
        INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
        INNER JOIN seccion s ON s.id_materia_plan = pp.id
        INNER JOIN evaluacion e ON s.id_materia_plan = e.id_materia_plan AND s.letra = e.letra
        LEFT JOIN
        (
        	SELECT 
                    er.id,
                    er.id_evaluacion,
                    SUM(de.puntaje_obtenido) AS puntaje_eval
            FROM evaluacion_realizada er
            INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
            GROUP BY er.id
            ) AS eval_est ON eval_est.id_evaluacion = e.id
           GROUP BY c.codigo
           ORDER BY promedio DESC
        `,

        // Distribución de notas
        distribucionNotas: `
            SELECT 
                CASE 
                    WHEN puntaje_total/5 >= 18 THEN 'Sobresaliente (18-20)'
                    WHEN puntaje_total/5 >= 15 THEN 'Notable (15-17)'
                    WHEN puntaje_total/5 >= 10 THEN 'Aprobado (10-14)'
                    ELSE 'Reprobado (0-9)'
                END as rango,
                COUNT(eval_estud.id) as cantidad
            FROM
            (
                SELECT 
                    er.id,
                    er.id_evaluacion,
                    SUM(de.puntaje_obtenido) as puntaje_total
                FROM
                evaluacion_realizada er
                INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                GROUP BY er.id
            ) AS eval_estud
            GROUP BY rango
            ORDER BY 
                CASE rango
                    WHEN 'Sobresaliente (18-20)' THEN 1
                    WHEN 'Notable (15-17)' THEN 2
                    WHEN 'Aprobado (10-14)' THEN 3
                    ELSE 4
                END;
        `,

        // Uso de rúbricas por materia
        usoRubricasPorMateria: `
            SELECT 
                m.nombre as materia,
                COUNT(DISTINCT ru.id_rubrica) as total_rubricas,
                COUNT(DISTINCT r.cedula_docente) as profesores_distintos,
                COUNT(DISTINCT e.id) as total_evaluaciones
            FROM materia m
            INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
            INNER JOIN seccion s ON pp.id = s.id_materia_plan
            INNER JOIN inscripcion_seccion ins ON s.id_materia_plan = ins.id_materia_plan
            INNER JOIN evaluacion e ON ins.id_materia_plan = e.id_materia_plan
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval AND ru.estado = "Aprobado"
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            GROUP BY m.codigo, m.nombre
            HAVING COUNT(DISTINCT r.id) > 0
            ORDER BY total_rubricas DESC
            LIMIT 10
        `
    };

    // Ejecutar todas las consultas
    const promises = Object.entries(queries).map(([key, query]) => {
        return new Promise((resolve, reject) => {
            conexion.query(query, (err, results) => {
                if (err) return reject(err);
                resolve({ key, results });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const data = results.reduce((acc, item) => {
                acc[item.key] = item.results;
                return acc;
            }, {});

            // Procesar datos para la vista
            const stats = {
                // Estadísticas generales
                totalEstudiantes: data.totalEstudiantes[0].total,
                totalDocentes: data.totalDocentes[0].total,
                totalRubricas: data.totalRubricas[0].total,
                totalEvaluaciones: data.totalEvaluaciones[0].total,
                promedioGeneral: parseFloat(data.promedioGeneral[0].promedio || 0).toFixed(1),

                // Rankings de profesores
                topProfesoresPorRubricas: data.topProfesoresPorRubricas,
                topProfesoresPorEvaluaciones: data.topProfesoresPorEvaluaciones.map(p => ({
                    ...p,
                    promedio_calificaciones: parseFloat(p.promedio_calificaciones || 0).toFixed(1)
                })),

                // Profesores inactivos
                profesoresInactivos: data.profesoresInactivos,
                profesoresBajaActividad: data.profesoresBajaActividad,

                // Tasas de completitud
                tasaCompletitudPorProfesor: data.tasaCompletitudPorProfesor,

                // Tendencias
                actividadMensual: data.actividadMensual,

                // Otros reportes
                rendimientoCarrera: data.rendimientoCarrera,
                distribucionNotas: data.distribucionNotas,
                usoRubricasPorMateria: data.usoRubricasPorMateria
            };

            res.render("admin/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Admin',
                currentPage: 'reportes',
                stats
            });
        })
        .catch(err => {
            console.error("Error al obtener reportes de administrador:", err);
            res.render("admin/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Admin',
                currentPage: 'reportes',
                stats: null,
                error: "Error al cargar los reportes"
            });
        });
};


// =============================================
// REPORTES DE DOCENTE - OPTIMIZADO
// =============================================
const getTeacherReports = (req, res) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }

    const docenteCedula = req.session.cedula;

    // Queries optimizadas con mejor performance
    const queries = {
        // Estadísticas básicas - optimizadas
        totalEvaluaciones: `
            SELECT 
                COUNT(e.id) AS total
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
            INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
            INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
            WHERE ud.cedula_usuario = ?
        `,

        totalEstudiantes: `
            SELECT 
                COUNT(DISTINCT ins.cedula_estudiante) AS total
            FROM inscripcion_seccion ins
            INNER JOIN seccion s ON ins.id_materia_plan = s.id_materia_plan AND ins.letra = s.letra
            INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
            INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
            WHERE ud.cedula_usuario = ?
        `,

        promedioGeneral: `
        SELECT 
            CASE 
                WHEN subquery.cantidad_evaluaciones > 0 
                THEN ROUND(subquery.sumatoria_notas / subquery.cantidad_evaluaciones, 2)
                ELSE 0 
            END AS promedio
        FROM (
            SELECT
                SUM(COALESCE(de.puntaje_obtenido,0)) as sumatoria_notas,
                COUNT(e.id) AS cantidad_evaluaciones
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
            INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
            INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
            INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND ue.cedula_usuario = er.cedula_evaluado
            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
            WHERE pd.docente_cedula = ?
        ) AS subquery;
        `,
        tasaAprobacion: `
                SELECT 
					ROUND((SUM(CASE WHEN nota_estudiante >= 10 THEN 1 ELSE 0 END)) / COUNT(*) * 100, 1) AS tasa                
                FROM (
                    SELECT
                        SUM(COALESCE(de.puntaje_obtenido,0)) AS nota_estudiante
                    FROM evaluacion e
                    INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                    INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
                    INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                    INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                    LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND ue.cedula_usuario = er.cedula_evaluado
                    LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                    WHERE pd.docente_cedula = ?
                    GROUP BY ue.cedula_usuario
                    ) AS subquery;
        `,

        pendientes: `
            SELECT
                COUNT(ins.cedula_estudiante) AS total
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
            INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
            INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
            INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND ue.cedula_usuario = er.cedula_evaluado
            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
            WHERE pd.docente_cedula = ? AND er.id IS NULL;
        `,

        // Secciones del docente - optimizada
        secciones: `
            SELECT
                DISTINCT
                s.id_materia_plan AS id,
                s.letra AS codigo,
                pp.codigo_periodo AS lapso_academico,
                m.codigo AS materia_codigo,
                c.nombre AS carrera
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
            INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
            INNER JOIN plan_periodo pp ON pd.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            WHERE pd.docente_cedula = ?;
        `,

        // Lista detallada de estudiantes - optimizada con índices
        estudiantesDetalle: `
            SELECT
        cedula,
        nombre_completo,
        email,
        seccion,
        materia,
        carrera,
        total_evaluaciones,
        promedio,
        ultima_evaluacion,
        CASE 
        	WHEN promedio >= 18 THEN 'Sobresaliente'
            WHEN promedio >= 15 THEN 'Notable'
            WHEN promedio >= 10 THEN 'Aprobado'
            ELSE 'En Riesgo'
        END as estado
	FROM
    (        	SELECT
					ins.cedula_estudiante AS cedula,
                    CONCAT(u.nombre, ' ', u.apeliido) AS nombre_completo,
                    u.email,
                    s.letra AS seccion,
                    m.nombre AS materia,
                    c.nombre AS carrera,
                    COUNT(e.id) AS total_evaluaciones, 
                    ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS promedio,
                    MAX(er.fecha_evaluado) AS ultima_evaluacion
                FROM evaluacion e
                INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                INNER JOIN materia m ON pp.codigo_materia = m.codigo
                INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
            	INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                INNER JOIN usuario u ON ue.cedula_usuario = u.cedula AND u.activo = 1
                LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
            	LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                WHERE pd.docente_cedula = ?
                GROUP BY ins.cedula_estudiante, ins.id_materia_plan, ins.letra
                ORDER BY promedio DESC
     ) AS subquery;
        `,

        // Actividades recientes - limitada y optimizada
        actividadesRecientes: `
            SELECT
					er.fecha_evaluado AS fecha_evaluacion,
                    CONCAT(u.nombre, ' ', u.apeliido) AS estudiante,
                    r.nombre_rubrica AS rubrica,
                    m.nombre AS materia,
                    ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS calificacion
                FROM rubrica r
                INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica AND ru.estado = "Aprobado"
                INNER JOIN evaluacion e ON ru.id_eval = e.id
                INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                INNER JOIN materia m ON pp.codigo_materia = m.codigo
                INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
            	INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
                LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
            	LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                WHERE pd.docente_cedula = ? AND r.activo = 1 AND u.activo = 1
                GROUP BY er.id, er.fecha_evaluado, ins.cedula_estudiante, ins.id_materia_plan, ins.letra
                ORDER BY fecha_evaluacion DESC
                LIMIT 20;
        `,

        // Distribución de calificaciones - optimizada
        distribucionCalificaciones: `
                    SELECT
                COUNT(*) AS cantidad,
                CASE 
                    WHEN promedio >= 18 THEN 'Sobresaliente'
                    WHEN promedio >= 15 THEN 'Notable'
                    WHEN promedio >= 10 THEN 'Aprobado'
                    ELSE 'Reprobado'
                END as rango
            FROM
            (        	SELECT
                            ins.cedula_estudiante AS cedula,
                            ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS promedio
                        FROM evaluacion e
                        INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                        INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                        INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                        LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND ue.cedula_usuario = er.cedula_evaluado
                        LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                        WHERE pd.docente_cedula = ?
                        GROUP BY ins.cedula_estudiante, ins.id_materia_plan, ins.letra
                        ORDER BY promedio DESC
            ) AS subquery
            GROUP BY rango;
        `,

        // Estudiantes en riesgo - optimizada
        estudiantesRiesgo: `
        SELECT
                    cedula,
                    nombre_completo,
                    seccion,
                    materia,
                    evaluaciones,
                    promedio
                FROM
                (        	SELECT
                                ins.cedula_estudiante AS cedula,
                                CONCAT(u.nombre, ' ', u.apeliido) AS nombre_completo,
                                u.email,
                                s.letra AS seccion,
                                m.nombre AS materia,
                                c.nombre AS carrera,
                                COUNT(e.id) AS evaluaciones, 
                                ROUND(AVG(COALESCE(de.puntaje_obtenido,0)),2)/5 AS promedio,
                                MAX(er.fecha_evaluado) AS ultima_evaluacion
                            FROM evaluacion e
                            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN materia m ON pp.codigo_materia = m.codigo
                            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                            INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                            INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                            INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                            INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
                            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
                            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            WHERE pd.docente_cedula = ?
                            GROUP BY ins.cedula_estudiante, ins.id_materia_plan, ins.letra
                            ORDER BY promedio DESC
                ) AS subquery
                WHERE promedio < 10;
        `,

        // Rendimiento por materia - optimizada
        rendimientoMateria: `
        SELECT
                nombre,
                estudiantes,
                evaluaciones,
                promedio,
                ROUND((aprobados / estudiantes ) * 100, 1) AS tasa_aprobacion
        FROM
        (
                SELECT 
                    nombre,
                    COUNT(DISTINCT estudiante.cedula_estudiante) AS estudiantes, 
                    SUM(evaluaciones) AS evaluaciones,
                    ROUND(AVG(COALESCE(puntaje_estudiante,0))/5,2) AS promedio,
                    (SUM(CASE
                        WHEN estudiante.puntaje_estudiante >= 50 THEN 1
                        ELSE 0
                        END
                        )) AS aprobados
                FROM
                    (
                        SELECT
                            u.nombre AS usuario_nombre,
                            ins.cedula_estudiante,
                            m.nombre,
                            m.codigo AS materia,
                            COUNT(e.id) AS evaluaciones,
                            AVG(COALESCE(eval_est.puntaje_eval,0)) AS puntaje_estudiante
                        FROM evaluacion e
                        INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                        INNER JOIN materia m ON pp.codigo_materia = m.codigo
                        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                        INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                        INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                        INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                        INNER JOIN usuario u ON ue.cedula_usuario = u.cedula AND u.activo = 1
                    LEFT JOIN 
                        (
                            SELECT 
                                er.id,
                                er.id_evaluacion,
                                er.cedula_evaluado,
                                SUM(COALESCE(de.puntaje_obtenido,0)) AS puntaje_eval
                            FROM evaluacion_realizada er 
                            INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            GROUP BY er.id
                        ) AS eval_est ON eval_est.id_evaluacion = e.id AND u.cedula = eval_est.cedula_evaluado
                        WHERE pd.docente_cedula = ?
                        GROUP BY ins.cedula_estudiante, ins.id_materia_plan, ins.letra
                ) AS estudiante
                GROUP BY estudiante.materia, estudiante.nombre
                ORDER BY promedio
        ) AS materia;
        `,

        // Comparativa por sección - optimizada
        comparativaSecciones: `
                SELECT 
                    seccion,
                    materia,
                    COUNT(DISTINCT estudiante.cedula_estudiante) AS estudiantes, 
                    ROUND(AVG(COALESCE(puntaje_estudiante,0))/5,2) AS promedio
                FROM
                    (
                        SELECT
                            s.letra AS seccion,
                        	s.id_materia_plan,
                            ins.cedula_estudiante,
                            m.nombre AS materia,
                            m.codigo AS codigo_materia,
                            AVG(COALESCE(eval_est.puntaje_eval,0)) AS puntaje_estudiante
                        FROM evaluacion e
                        INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                        INNER JOIN materia m ON pp.codigo_materia = m.codigo
                        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                        INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                        INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                        INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
                        INNER JOIN usuario u ON ue.cedula_usuario = u.cedula AND u.activo = 1
                    LEFT JOIN 
                        (
                            SELECT 
                                er.id,
                                er.id_evaluacion,
                                er.cedula_evaluado,
                                SUM(COALESCE(de.puntaje_obtenido,0)) AS puntaje_eval
                            FROM evaluacion_realizada er 
                            INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            GROUP BY er.id
                        ) AS eval_est ON eval_est.id_evaluacion = e.id AND u.cedula = eval_est.cedula_evaluado
                        WHERE pd.docente_cedula = ?
                        GROUP BY ins.cedula_estudiante, ins.id_materia_plan, ins.letra
                ) AS estudiante
                GROUP BY estudiante.id_materia_plan, estudiante.seccion
                ORDER BY promedio;
        `,

        // Mejores estudiantes - optimizada
        mejoresEstudiantes: `
                SELECT
                    cedula,
                    nombre_completo,
                    total_evaluaciones,
                    promedio
                FROM
                (        	SELECT
                                ins.cedula_estudiante AS cedula,
                                CONCAT(u.nombre, ' ', u.apeliido) AS nombre_completo,
                                COUNT(e.id) AS total_evaluaciones, 
                                ROUND(AVG(COALESCE(de.puntaje_obtenido,0)),2)/5 AS promedio
                            FROM evaluacion e
                            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                            INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                            INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                            INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
                            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
                            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            WHERE pd.docente_cedula = ?
                            GROUP BY ins.cedula_estudiante
                            ORDER BY promedio DESC
                ) AS subquery
                LIMIT 10;
        `,

        // Mejores rúbricas - optimizada
        mejoresRubricas: `
            SELECT
                rubrica,
                materia,
                promedio,
                total_evaluaciones,
                ROUND((SUM(CASE 
                        WHEN promedio >= 15 THEN 1 
                        ELSE 0
                        END) / COUNT(*)) * 100, 1) AS porcentaje_excelencia
            FROM
            (               
                            SELECT
                                r.nombre_rubrica AS rubrica,
                                m.nombre AS materia,
                                ROUND(AVG(COALESCE(de.puntaje_obtenido,0))/5,2) AS promedio,
                                COUNT(e.id) AS total_evaluaciones
                            FROM rubrica r
                            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica AND ru.estado = "Aprobado"
                            INNER JOIN evaluacion e ON ru.id_eval = e.id
                            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN materia m ON pp.codigo_materia = m.codigo
                            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                            INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                            INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                            INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
                            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
                            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            WHERE pd.docente_cedula = ? AND r.activo = 1 AND u.activo = 1
                            GROUP BY e.id, r.id
                            ORDER BY fecha_evaluacion DESC
                            LIMIT 20
                ) AS rubrica_usada;
        `,

        // Progreso temporal - optimizada (últimos 6 meses)
        progresoTemporal: `
                        SELECT
                            evaluaciones.*
                        FROM
                        (
							SELECT
                                DATE_FORMAT(er.fecha_evaluado, '%Y-%m') AS mes,
                                COUNT(e.id) AS evaluaciones, 
                                ROUND(AVG(COALESCE(de.puntaje_obtenido,0)),2)/5 AS promedio
                            FROM evaluacion e
                            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
                            INNER JOIN inscripcion_seccion ins ON pd.id_materia_plan = ins.id_materia_plan AND pd.letra_sec = ins.letra
                            INNER JOIN usuario_estudiante ue ON ue.cedula_usuario = ins.cedula_estudiante
                            INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
                            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion AND u.cedula = er.cedula_evaluado
                            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            WHERE pd.docente_cedula = ?
                            ORDER BY promedio DESC
                        ) AS evaluaciones
                        GROUP BY mes
                        ORDER BY mes ASC;
        `
    };

    // Ejecutar todas las consultas con mejor manejo de errores
    const promises = Object.entries(queries).map(([key, query]) => {
        return new Promise((resolve, reject) => {
            conexion.query(query, [docenteCedula], (err, results) => {
                if (err) {
                    console.error(`❌ Error en query ${key}:`, err.message);
                    return reject({ key, error: err });
                }
                resolve({ key, results });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const data = results.reduce((acc, item) => {
                acc[item.key] = item.results;
                return acc;
            }, {});

            const stats = {
                // Estadísticas generales
                totalEvaluaciones: data.totalEvaluaciones[0]?.total || 0,
                totalEstudiantes: data.totalEstudiantes[0]?.total || 0,
                promedioGeneral: parseFloat(data.promedioGeneral[0]?.promedio || 0).toFixed(1),
                tasaAprobacion: parseFloat(data.tasaAprobacion[0]?.tasa || 0).toFixed(1),
                pendientes: data.pendientes[0]?.total || 0,

                // Secciones
                secciones: data.secciones || [],

                // Estudiantes
                estudiantesDetalle: data.estudiantesDetalle || [],
                estudiantesRiesgo: data.estudiantesRiesgo.map(e => ({
                    cedula: e.cedula,
                    nombre: e.nombre_completo,
                    seccion: e.seccion,
                    materia: e.materia,
                    promedio: parseFloat(e.promedio).toFixed(2),
                    evaluaciones: e.evaluaciones
                })),
                mejoresEstudiantes: data.mejoresEstudiantes.map(e => ({
                    cedula: e.cedula,
                    nombre: e.nombre_completo,
                    promedio: parseFloat(e.promedio).toFixed(2),
                    evaluaciones: e.total_evaluaciones
                })),

                // Actividades
                actividadesRecientes: data.actividadesRecientes || [],

                // Distribuciones y comparativas
                distribucionCalificaciones: data.distribucionCalificaciones || [],
                rendimientoMateria: data.rendimientoMateria.map(m => ({
                    nombre: m.nombre,
                    estudiantes: m.estudiantes,
                    evaluaciones: m.evaluaciones,
                    promedio: parseFloat(m.promedio).toFixed(2),
                    tasaAprobacion: parseFloat(m.tasa_aprobacion).toFixed(1)
                })),
                comparativaSecciones: data.comparativaSecciones || [],

                // Rúbricas
                mejoresRubricas: data.mejoresRubricas.map(r => ({
                    rubrica: r.rubrica,
                    materia: r.materia,
                    promedio: parseFloat(r.promedio).toFixed(2),
                    evaluaciones: r.total_evaluaciones,
                    excelencia: parseFloat(r.porcentaje_excelencia).toFixed(1)
                })),

                // Progreso temporal
                progresoTemporal: data.progresoTemporal.map(p => ({
                    mes: p.mes,
                    promedio: parseFloat(p.promedio).toFixed(2),
                    evaluaciones: p.evaluaciones
                }))
            };

            console.log(`✅ Reportes generados para docente ${docenteCedula}`);

            res.render("teacher/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Docente',
                currentPage: 'reportes',
                stats
            });
        })
        .catch(err => {
            console.error("❌ Error al obtener reportes de docente:", err);
            res.render("teacher/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Docente',
                currentPage: 'reportes',
                stats: null,
                error: "Error al cargar los reportes. Por favor, intenta de nuevo."
            });
        });
};

module.exports = {
    getAdminReports,
    getTeacherReports
};
