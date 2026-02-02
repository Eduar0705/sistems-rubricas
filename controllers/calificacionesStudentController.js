const conexion = require('../models/conetion');
//PENDIENTE DE CAMBIAR LA CONSULTA
const getCalificaciones = (req, res) => {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const estudianteCedula = req.session.cedula;

    const query = `
        SELECT 
            m.nombre AS materia_nombre,
            m.codigo AS materia_codigo,
            s.codigo AS seccion_codigo,
            s.lapso_academico,
            re.id AS rubrica_id,
            re.nombre_rubrica,
            re.porcentaje_evaluacion,
            ee.puntaje_total,
            ee.observaciones,
            ee.fecha_evaluacion,
            (SELECT SUM(ce.puntaje_maximo) FROM criterio_evaluacion ce WHERE ce.rubrica_id = re.id) AS puntaje_maximo_rubrica
        FROM 
            seccion s
        JOIN 
            materia m ON s.materia_codigo = m.codigo
        JOIN (
            SELECT seccion_id FROM inscripcion_seccion WHERE estudiante_cedula = ?
            UNION
            SELECT re.seccion_id 
            FROM evaluacion_estudiante ee 
            JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id 
            WHERE ee.estudiante_cedula = ?
        ) student_sections ON s.id = student_sections.seccion_id
        LEFT JOIN 
            rubrica_evaluacion re ON s.id = re.seccion_id AND re.activo = 1
        LEFT JOIN 
            evaluacion_estudiante ee ON re.id = ee.rubrica_id AND ee.estudiante_cedula = ?
        ORDER BY 
            s.lapso_academico DESC, m.nombre, re.id
    `;

    conexion.query(query, [estudianteCedula, estudianteCedula, estudianteCedula], (err, results) => {
        if (err) {
            console.error('Error al obtener calificaciones:', err);
            return res.render('studen/calificaciones', {
                datos: req.session,
                currentPage: 'calificaciones',
                lapsos: [],
                stats: {
                    promedioGeneral: 0,
                    materiasAprobadas: 0,
                    totalMaterias: 0,
                    porcentajeCompletado: 0
                },
                error: 'Error al cargar las calificaciones'
            });
        }

        const lapsosMap = new Map();
        const allMaterias = [];

        results.forEach(row => {
            const lapsoKey = row.lapso_academico || 'Sin Periodo';

            if (!lapsosMap.has(lapsoKey)) {
                lapsosMap.set(lapsoKey, new Map());
            }

            const materiasMap = lapsosMap.get(lapsoKey);

            if (!materiasMap.has(row.materia_codigo)) {
                materiasMap.set(row.materia_codigo, {
                    nombre: row.materia_nombre,
                    codigo: row.materia_codigo,
                    seccion: row.seccion_codigo,
                    uc: 3,
                    nota_referencial: 10,
                    rubricas: [],
                    calificacion_final: 0,
                    porcentaje_acumulado: 0,
                    total_evaluado: 0
                });
            }

            const materia = materiasMap.get(row.materia_codigo);

            if (row.rubrica_id) {
                const maxPuntaje = parseFloat(row.puntaje_maximo_rubrica) || 0;
                const puntajeObtenido = parseFloat(row.puntaje_total) || 0;
                const porcentajeRubrica = parseFloat(row.porcentaje_evaluacion) || 0;

                let calificacionRubrica = 0;
                if (maxPuntaje > 0 && row.puntaje_total !== null) {
                    calificacionRubrica = (puntajeObtenido / maxPuntaje) * porcentajeRubrica;
                    materia.calificacion_final += calificacionRubrica;
                }

                materia.total_evaluado += porcentajeRubrica;
                if (row.puntaje_total !== null) {
                    materia.porcentaje_acumulado += porcentajeRubrica;
                }
            }
        });

        const lapsos = [];
        for (const [lapsoNombre, materiasMap] of lapsosMap.entries()) {
            const materiasDelLapso = Array.from(materiasMap.values());

            materiasDelLapso.forEach(m => {
                m.nota_20 = (m.calificacion_final / 100) * 20;
                m.nota_100 = m.calificacion_final;

                m.nota_display = Math.round(m.nota_20);

                allMaterias.push(m);
            });

            lapsos.push({
                nombre: lapsoNombre,
                materias: materiasDelLapso
            });
        }

        lapsos.sort((a, b) => b.nombre.localeCompare(a.nombre));

        let totalMaterias = allMaterias.length;
        let materiasAprobadas = allMaterias.filter(m => m.nota_20 >= 10).length;

        let promedioGeneral = 0;
        if (totalMaterias > 0) {
            const sum20 = allMaterias.reduce((acc, m) => acc + m.nota_20, 0);
            promedioGeneral = (sum20 / totalMaterias).toFixed(1);
        }

        let porcentajeCompletado = 0;
        if (totalMaterias > 0) {
            porcentajeCompletado = (allMaterias.reduce((acc, m) => acc + m.porcentaje_acumulado, 0) / totalMaterias).toFixed(1);
        }

        res.render('studen/calificaciones', {
            datos: req.session,
            currentPage: 'calificaciones',
            lapsos: lapsos,
            stats: {
                promedioGeneral,
                materiasAprobadas,
                totalMaterias,
                porcentajeCompletado
            },
            error: null
        });
    });
};

module.exports = {
    getCalificaciones
};
