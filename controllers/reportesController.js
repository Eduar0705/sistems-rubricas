const conexion = require('../models/conetion');

// =============================================
// REPORTES DE ADMINISTRADOR
// =============================================
const getAdminReports = (req, res) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }

    // Consultas para estadísticas de administrador
    const queries = {
        totalEstudiantes: "SELECT COUNT(*) as total FROM estudiante WHERE activo = 1",
        totalDocentes: "SELECT COUNT(*) as total FROM docente WHERE activo = 1",
        totalRubricas: "SELECT COUNT(*) as total FROM rubrica_evaluacion WHERE activo = 1",
        promedioGeneral: `
            SELECT AVG(puntaje_total) as promedio 
            FROM evaluacion_estudiante 
            WHERE puntaje_total IS NOT NULL
        `,
        rendimientoCarrera: `
            SELECT c.nombre, AVG(ee.puntaje_total) as promedio
            FROM evaluacion_estudiante ee
            JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            JOIN carrera c ON e.carrera_codigo = c.codigo
            WHERE ee.puntaje_total IS NOT NULL
            GROUP BY c.nombre
        `,
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
                totalEstudiantes: data.totalEstudiantes[0].total,
                totalDocentes: data.totalDocentes[0].total,
                totalRubricas: data.totalRubricas[0].total,
                promedioGeneral: parseFloat(data.promedioGeneral[0].promedio || 0).toFixed(1),
                rendimientoCarrera: data.rendimientoCarrera,
                distribucionNotas: data.distribucionNotas
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
// REPORTES DE DOCENTE
// =============================================
const getTeacherReports = (req, res) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }

    const docenteCedula = req.session.cedula;

    const queries = {
        totalEvaluaciones: `
            SELECT COUNT(*) as total 
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            WHERE re.docente_cedula = ?
        `,
        promedioDocente: `
            SELECT AVG(ee.puntaje_total) as promedio
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
        `,
        rendimientoMateria: `
            SELECT m.nombre, AVG(ee.puntaje_total) as promedio
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            JOIN materia m ON re.materia_codigo = m.codigo
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
            GROUP BY m.nombre
        `,
        tasaAprobacion: `
            SELECT 
                (SUM(CASE WHEN ee.puntaje_total >= 10 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as tasa
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
        `,
        pendientes: `
            SELECT COUNT(*) as total
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NULL
        `,
        mejoresEstudiantes: `
            SELECT 
                e.cedula,
                CONCAT(e.nombre, ' ', e.apellido) as nombre_completo,
                AVG(ee.puntaje_total) as promedio,
                COUNT(ee.id) as total_evaluaciones
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
            GROUP BY e.cedula, e.nombre, e.apellido
            ORDER BY promedio DESC
            LIMIT 10
        `,
        peoresEstudiantes: `
            SELECT 
                e.cedula,
                CONCAT(e.nombre, ' ', e.apellido) as nombre_completo,
                AVG(ee.puntaje_total) as promedio,
                COUNT(ee.id) as total_evaluaciones
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
            GROUP BY e.cedula, e.nombre, e.apellido
            HAVING COUNT(ee.id) >= 2
            ORDER BY promedio ASC
            LIMIT 10
        `,
        mejoresRubricas: `
            SELECT 
                re.nombre_rubrica as rubrica,
                m.nombre as materia,
                AVG(ee.puntaje_total) as promedio,
                COUNT(ee.id) as total_evaluaciones,
                (SUM(CASE WHEN ee.puntaje_total >= 15 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as porcentaje_excelencia
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            JOIN materia m ON re.materia_codigo = m.codigo
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
            GROUP BY re.id, re.nombre_rubrica, m.nombre
            HAVING COUNT(ee.id) >= 3
            ORDER BY promedio DESC
            LIMIT 5
        `,
        peoresRubricas: `
            SELECT 
                re.nombre_rubrica as rubrica,
                m.nombre as materia,
                AVG(ee.puntaje_total) as promedio,
                COUNT(ee.id) as total_evaluaciones,
                (SUM(CASE WHEN ee.puntaje_total < 10 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as porcentaje_reprobados
            FROM evaluacion_estudiante ee
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            JOIN materia m ON re.materia_codigo = m.codigo
            WHERE re.docente_cedula = ? AND ee.puntaje_total IS NOT NULL
            GROUP BY re.id, re.nombre_rubrica, m.nombre
            HAVING COUNT(ee.id) >= 3
            ORDER BY promedio ASC
            LIMIT 5
        `
    };

    const promises = Object.entries(queries).map(([key, query]) => {
        return new Promise((resolve, reject) => {
            conexion.query(query, [docenteCedula], (err, results) => {
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

            const stats = {
                totalEvaluaciones: data.totalEvaluaciones[0].total,
                promedioGeneral: parseFloat(data.promedioDocente[0].promedio || 0).toFixed(1),
                rendimientoMateria: data.rendimientoMateria,
                tasaAprobacion: parseFloat(data.tasaAprobacion[0].tasa || 0).toFixed(1),
                pendientes: data.pendientes[0].total,
                mejoresEstudiantes: data.mejoresEstudiantes.map(e => ({
                    cedula: e.cedula,
                    nombre: e.nombre_completo,
                    promedio: parseFloat(e.promedio).toFixed(2),
                    evaluaciones: e.total_evaluaciones
                })),
                peoresEstudiantes: data.peoresEstudiantes.map(e => ({
                    cedula: e.cedula,
                    nombre: e.nombre_completo,
                    promedio: parseFloat(e.promedio).toFixed(2),
                    evaluaciones: e.total_evaluaciones
                })),
                mejoresRubricas: data.mejoresRubricas.map(r => ({
                    rubrica: r.rubrica,
                    materia: r.materia,
                    promedio: parseFloat(r.promedio).toFixed(2),
                    evaluaciones: r.total_evaluaciones,
                    excelencia: parseFloat(r.porcentaje_excelencia).toFixed(1)
                })),
                peoresRubricas: data.peoresRubricas.map(r => ({
                    rubrica: r.rubrica,
                    materia: r.materia,
                    promedio: parseFloat(r.promedio).toFixed(2),
                    evaluaciones: r.total_evaluaciones,
                    reprobados: parseFloat(r.porcentaje_reprobados).toFixed(1)
                }))
            };

            res.render("teacher/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Docente',
                currentPage: 'reportes',
                stats
            });
        })
        .catch(err => {
            console.error("Error al obtener reportes de docente:", err);
            res.render("teacher/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Docente',
                currentPage: 'reportes',
                stats: null,
                error: "Error al cargar los reportes"
            });
        });
};

module.exports = {
    getAdminReports,
    getTeacherReports
};
