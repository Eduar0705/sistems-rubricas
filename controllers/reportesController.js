const conexion = require('../models/conetion');

// =============================================
// ADMIN REPORTS
// =============================================
const getAdminReports = (req, res) => {
    if (!req.session.login) {
        return res.redirect('/login');
    }

    // Queries for Admin Stats
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

    // Execute all queries
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

            // Process data for view
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
            console.error("Error getting admin reports:", err);
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
// TEACHER REPORTS
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
                pendientes: data.pendientes[0].total
            };

            res.render("teacher/reportes", {
                datos: req.session,
                title: 'SGR - Reportes Docente',
                currentPage: 'reportes',
                stats
            });
        })
        .catch(err => {
            console.error("Error getting teacher reports:", err);
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
