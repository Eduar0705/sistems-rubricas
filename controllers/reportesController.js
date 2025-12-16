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
        totalEstudiantes: "SELECT COUNT(*) as total FROM estudiante WHERE activo = 1",
        totalDocentes: "SELECT COUNT(*) as total FROM docente WHERE activo = 1",
        totalRubricas: "SELECT COUNT(*) as total FROM rubrica_evaluacion WHERE activo = 1",
        totalEvaluaciones: "SELECT COUNT(*) as total FROM evaluacion_estudiante WHERE puntaje_total IS NOT NULL",
        promedioGeneral: `
            SELECT AVG(puntaje_total) as promedio 
            FROM evaluacion_estudiante 
            WHERE puntaje_total IS NOT NULL
        `,

        // Top profesores por número de rúbricas creadas
        topProfesoresPorRubricas: `
            SELECT 
                d.cedula,
                CONCAT(d.nombre, ' ', d.apellido) as nombre_completo,
                d.especializacion,
                COUNT(r.id) as total_rubricas,
                COUNT(DISTINCT r.materia_codigo) as materias_distintas
            FROM docente d
            LEFT JOIN rubrica_evaluacion r ON d.cedula = r.docente_cedula AND r.activo = TRUE
            WHERE d.activo = 1
            GROUP BY d.cedula, d.nombre, d.apellido, d.especializacion
            ORDER BY total_rubricas DESC
            LIMIT 10
        `,

        // Top profesores por número de evaluaciones completadas
        topProfesoresPorEvaluaciones: `
            SELECT 
                d.cedula,
                CONCAT(d.nombre, ' ', d.apellido) as nombre_completo,
                d.especializacion,
                COUNT(ee.id) as total_evaluaciones,
                AVG(ee.puntaje_total) as promedio_calificaciones
            FROM docente d
            INNER JOIN rubrica_evaluacion r ON d.cedula = r.docente_cedula
            INNER JOIN evaluacion_estudiante ee ON r.id = ee.rubrica_id
            WHERE d.activo = 1 AND r.activo = TRUE AND ee.puntaje_total IS NOT NULL
            GROUP BY d.cedula, d.nombre, d.apellido, d.especializacion
            ORDER BY total_evaluaciones DESC
            LIMIT 10
        `,

        // Profesores inactivos (sin rúbricas)
        profesoresInactivos: `
            SELECT 
                d.cedula,
                CONCAT(d.nombre, ' ', d.apellido) as nombre_completo,
                d.especializacion,
                d.email
            FROM docente d
            LEFT JOIN rubrica_evaluacion r ON d.cedula = r.docente_cedula AND r.activo = TRUE
            WHERE d.activo = 1
            GROUP BY d.cedula, d.nombre, d.apellido, d.especializacion, d.email
            HAVING COUNT(r.id) = 0
            ORDER BY d.nombre, d.apellido
        `,

        // Profesores con baja actividad (sin evaluaciones recientes en 30 días)
        profesoresBajaActividad: `
            SELECT 
                d.cedula,
                CONCAT(d.nombre, ' ', d.apellido) as nombre_completo,
                d.especializacion,
                MAX(ee.fecha_evaluacion) as ultima_evaluacion,
                DATEDIFF(NOW(), MAX(ee.fecha_evaluacion)) as dias_inactivo
            FROM docente d
            INNER JOIN rubrica_evaluacion r ON d.cedula = r.docente_cedula
            LEFT JOIN evaluacion_estudiante ee ON r.id = ee.rubrica_id AND ee.puntaje_total IS NOT NULL
            WHERE d.activo = 1 AND r.activo = TRUE
            GROUP BY d.cedula, d.nombre, d.apellido, d.especializacion
            HAVING MAX(ee.fecha_evaluacion) IS NULL OR DATEDIFF(NOW(), MAX(ee.fecha_evaluacion)) > 30
            ORDER BY dias_inactivo DESC
        `,

        // Tasa de completitud de evaluaciones por profesor
        tasaCompletitudPorProfesor: `
            SELECT 
                d.cedula,
                CONCAT(d.nombre, ' ', d.apellido) as nombre_completo,
                COUNT(ee.id) as total_asignadas,
                SUM(CASE WHEN ee.puntaje_total IS NOT NULL THEN 1 ELSE 0 END) as completadas,
                ROUND((SUM(CASE WHEN ee.puntaje_total IS NOT NULL THEN 1 ELSE 0 END) / COUNT(ee.id)) * 100, 1) as porcentaje_completitud
            FROM docente d
            INNER JOIN rubrica_evaluacion r ON d.cedula = r.docente_cedula
            INNER JOIN evaluacion_estudiante ee ON r.id = ee.rubrica_id
            WHERE d.activo = 1 AND r.activo = TRUE
            GROUP BY d.cedula, d.nombre, d.apellido
            HAVING COUNT(ee.id) > 0
            ORDER BY porcentaje_completitud DESC
            LIMIT 15
        `,

        // Actividad mensual (últimos 6 meses)
        actividadMensual: `
            SELECT 
                DATE_FORMAT(ee.fecha_evaluacion, '%Y-%m') as mes,
                COUNT(DISTINCT r.docente_cedula) as profesores_activos,
                COUNT(ee.id) as total_evaluaciones,
                COUNT(DISTINCT r.id) as rubricas_usadas
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            WHERE ee.puntaje_total IS NOT NULL 
              AND ee.fecha_evaluacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(ee.fecha_evaluacion, '%Y-%m')
            ORDER BY mes ASC
        `,

        // Rendimiento por carrera
        rendimientoCarrera: `
            SELECT c.nombre, AVG(ee.puntaje_total) as promedio
            FROM evaluacion_estudiante ee
            JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            JOIN carrera c ON e.carrera_codigo = c.codigo
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY c.nombre
            ORDER BY promedio DESC
        `,

        // Distribución de notas
        distribucionNotas: `
            SELECT 
                CASE 
                    WHEN puntaje_total >= 18 THEN 'Sobresaliente (18-20)'
                    WHEN puntaje_total >= 15 THEN 'Notable (15-17)'
                    WHEN puntaje_total >= 10 THEN 'Aprobado (10-14)'
                    ELSE 'Reprobado (0-9)'
                END as rango,
                COUNT(*) as cantidad
            FROM evaluacion_estudiante
            WHERE puntaje_total IS NOT NULL
            GROUP BY rango
            ORDER BY 
                CASE rango
                    WHEN 'Sobresaliente (18-20)' THEN 1
                    WHEN 'Notable (15-17)' THEN 2
                    WHEN 'Aprobado (10-14)' THEN 3
                    ELSE 4
                END
        `,

        // Uso de rúbricas por materia
        usoRubricasPorMateria: `
            SELECT 
                m.nombre as materia,
                COUNT(DISTINCT r.id) as total_rubricas,
                COUNT(DISTINCT r.docente_cedula) as profesores_distintos,
                COUNT(ee.id) as total_evaluaciones
            FROM materia m
            LEFT JOIN rubrica_evaluacion r ON m.codigo = r.materia_codigo AND r.activo = TRUE
            LEFT JOIN evaluacion_estudiante ee ON r.id = ee.rubrica_id AND ee.puntaje_total IS NOT NULL
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
            SELECT COUNT(DISTINCT ee.id) as total 
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
        `,

        totalEstudiantes: `
            SELECT COUNT(DISTINCT ee.estudiante_cedula) as total
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
        `,

        promedioGeneral: `
            SELECT ROUND(AVG(ee.puntaje_total), 2) as promedio
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
        `,

        tasaAprobacion: `
            SELECT 
                ROUND((SUM(CASE WHEN ee.puntaje_total >= 10 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as tasa
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
        `,

        pendientes: `
            SELECT COUNT(*) as total
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NULL
        `,

        // Secciones del docente - optimizada
        secciones: `
            SELECT DISTINCT 
                s.id,
                s.codigo,
                s.lapso_academico,
                m.nombre as materia,
                m.codigo as materia_codigo,
                c.nombre as carrera,
                (
                    SELECT COUNT(DISTINCT ee2.estudiante_cedula)
                    FROM evaluacion_estudiante ee2
                    INNER JOIN rubrica_evaluacion re2 ON ee2.rubrica_id = re2.id
                    WHERE re2.seccion_id = s.id 
                        AND re2.materia_codigo = m.codigo
                        AND re2.activo = 1
                ) as total_estudiantes
            FROM permisos p
            INNER JOIN seccion s ON p.seccion_id = s.id
            INNER JOIN materia m ON p.materia_codigo = m.codigo
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            WHERE p.docente_cedula = ? AND p.activo = 1
            ORDER BY s.lapso_academico DESC, m.nombre
        `,

        // Lista detallada de estudiantes - optimizada con índices
        estudiantesDetalle: `
            SELECT 
                e.cedula,
                CONCAT(e.nombre, ' ', e.apellido) as nombre_completo,
                e.email,
                s.codigo as seccion,
                m.nombre as materia,
                c.nombre as carrera,
                COUNT(ee.id) as total_evaluaciones,
                ROUND(AVG(ee.puntaje_total), 2) as promedio,
                MAX(ee.fecha_evaluacion) as ultima_evaluacion,
                CASE 
                    WHEN AVG(ee.puntaje_total) >= 18 THEN 'Excelente'
                    WHEN AVG(ee.puntaje_total) >= 15 THEN 'Bueno'
                    WHEN AVG(ee.puntaje_total) >= 10 THEN 'Regular'
                    ELSE 'En Riesgo'
                END as estado
            FROM estudiante e
            INNER JOIN evaluacion_estudiante ee ON e.cedula = ee.estudiante_cedula
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN seccion s ON re.seccion_id = s.id
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            INNER JOIN carrera c ON e.carrera_codigo = c.codigo
            INNER JOIN permisos p ON s.id = p.seccion_id 
                AND m.codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY e.cedula, e.nombre, e.apellido, e.email, s.codigo, m.nombre, c.nombre
            ORDER BY promedio DESC
        `,

        // Actividades recientes - limitada y optimizada
        actividadesRecientes: `
            SELECT 
                ee.fecha_evaluacion,
                CONCAT(e.nombre, ' ', e.apellido) as estudiante,
                re.nombre_rubrica as rubrica,
                m.nombre as materia,
                ee.puntaje_total as calificacion
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND m.codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            ORDER BY ee.fecha_evaluacion DESC
            LIMIT 20
        `,

        // Distribución de calificaciones - optimizada
        distribucionCalificaciones: `
            SELECT 
                CASE 
                    WHEN ee.puntaje_total >= 18 THEN 'Sobresaliente (18-20)'
                    WHEN ee.puntaje_total >= 15 THEN 'Notable (15-17)'
                    WHEN ee.puntaje_total >= 10 THEN 'Aprobado (10-14)'
                    ELSE 'Reprobado (0-9)'
                END as rango,
                COUNT(*) as cantidad
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY rango
            ORDER BY 
                CASE rango
                    WHEN 'Sobresaliente (18-20)' THEN 1
                    WHEN 'Notable (15-17)' THEN 2
                    WHEN 'Aprobado (10-14)' THEN 3
                    ELSE 4
                END
        `,

        // Estudiantes en riesgo - optimizada
        estudiantesRiesgo: `
            SELECT 
                e.cedula,
                CONCAT(e.nombre, ' ', e.apellido) as nombre_completo,
                s.codigo as seccion,
                m.nombre as materia,
                ROUND(AVG(ee.puntaje_total), 2) as promedio,
                COUNT(ee.id) as evaluaciones
            FROM estudiante e
            INNER JOIN evaluacion_estudiante ee ON e.cedula = ee.estudiante_cedula
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN seccion s ON re.seccion_id = s.id
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            INNER JOIN permisos p ON s.id = p.seccion_id 
                AND m.codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY e.cedula, e.nombre, e.apellido, s.codigo, m.nombre
            HAVING AVG(ee.puntaje_total) < 10
            ORDER BY promedio ASC
        `,

        // Rendimiento por materia - optimizada
        rendimientoMateria: `
            SELECT 
                m.nombre,
                COUNT(DISTINCT ee.estudiante_cedula) as estudiantes,
                COUNT(ee.id) as evaluaciones,
                ROUND(AVG(ee.puntaje_total), 2) as promedio,
                ROUND((SUM(CASE WHEN ee.puntaje_total >= 10 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as tasa_aprobacion
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND m.codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY m.codigo, m.nombre
            ORDER BY promedio DESC
        `,

        // Comparativa por sección - optimizada
        comparativaSecciones: `
            SELECT 
                s.codigo as seccion,
                m.nombre as materia,
                COUNT(DISTINCT ee.estudiante_cedula) as estudiantes,
                ROUND(AVG(ee.puntaje_total), 2) as promedio
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN seccion s ON re.seccion_id = s.id
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            INNER JOIN permisos p ON s.id = p.seccion_id 
                AND m.codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY s.id, s.codigo, m.nombre
            ORDER BY promedio DESC
        `,

        // Mejores estudiantes - optimizada
        mejoresEstudiantes: `
            SELECT 
                e.cedula,
                CONCAT(e.nombre, ' ', e.apellido) as nombre_completo,
                ROUND(AVG(ee.puntaje_total), 2) as promedio,
                COUNT(ee.id) as total_evaluaciones
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY e.cedula, e.nombre, e.apellido
            HAVING COUNT(ee.id) >= 2
            ORDER BY promedio DESC
            LIMIT 10
        `,

        // Mejores rúbricas - optimizada
        mejoresRubricas: `
            SELECT 
                re.nombre_rubrica as rubrica,
                m.nombre as materia,
                ROUND(AVG(ee.puntaje_total), 2) as promedio,
                COUNT(ee.id) as total_evaluaciones,
                ROUND((SUM(CASE WHEN ee.puntaje_total >= 15 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as porcentaje_excelencia
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND m.codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY re.id, re.nombre_rubrica, m.nombre
            HAVING COUNT(ee.id) >= 3
            ORDER BY promedio DESC
            LIMIT 5
        `,

        // Progreso temporal - optimizada (últimos 6 meses)
        progresoTemporal: `
            SELECT 
                DATE_FORMAT(ee.fecha_evaluacion, '%Y-%m') as mes,
                ROUND(AVG(ee.puntaje_total), 2) as promedio,
                COUNT(ee.id) as evaluaciones
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id AND re.activo = 1
            INNER JOIN permisos p ON re.seccion_id = p.seccion_id 
                AND re.materia_codigo = p.materia_codigo
                AND p.docente_cedula = ?
                AND p.activo = 1
            WHERE ee.puntaje_total IS NOT NULL
                AND ee.fecha_evaluacion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(ee.fecha_evaluacion, '%Y-%m')
            ORDER BY mes ASC
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
