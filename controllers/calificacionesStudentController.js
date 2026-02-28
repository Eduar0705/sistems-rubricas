const conexion = require('../models/conetion');
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
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
            pp.codigo_periodo AS lapso_academico,
            r.id AS rubrica_id,
            r.nombre_rubrica,
            e.ponderacion AS porcentaje_evaluacion,
            SUM(DISTINCT de.puntaje_obtenido) AS puntaje_total,
            er.observaciones,
            er.fecha_evaluado AS fecha_evaluacion,
            (SELECT SUM(cr.puntaje_maximo) FROM criterio_rubrica cr WHERE cr.rubrica_id = r.id) AS puntaje_maximo_rubrica
        FROM 
            evaluacion e 
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval
            INNER JOIN rubrica r ON ru.id_rubrica = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN plan_periodo pp ON pp.id = s.id_materia_plan
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN inscripcion_seccion ins ON s.id = ins.id_seccion
            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
            LEFT JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
            WHERE ins.cedula_estudiante = ?
        GROUP BY
            m.codigo
        ORDER BY 
            lapso_academico DESC, m.nombre, er.id;
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
