const conexion = require('../models/conetion');

const getCalificaciones = (req, res) => {
    if (!req.session || !req.session.login) {
        return res.redirect('/login');
    }

    const estudianteCedula = req.session.cedula;

    const query = `
        SELECT 
            m.nombre AS materia_nombre,
            m.codigo AS materia_codigo,
            s.codigo AS seccion_codigo,
            re.id AS rubrica_id,
            re.nombre_rubrica,
            re.porcentaje_evaluacion,
            ee.puntaje_total,
            ee.observaciones,
            ee.fecha_evaluacion,
            (SELECT SUM(ce.puntaje_maximo) FROM criterio_evaluacion ce WHERE ce.rubrica_id = re.id) AS puntaje_maximo_rubrica
        FROM 
            inscripcion_seccion ins
        JOIN 
            seccion s ON ins.seccion_id = s.id
        JOIN 
            materia m ON s.materia_codigo = m.codigo
        LEFT JOIN 
            rubrica_evaluacion re ON s.id = re.seccion_id AND re.activo = 1
        LEFT JOIN 
            evaluacion_estudiante ee ON re.id = ee.rubrica_id AND ee.estudiante_cedula = ins.estudiante_cedula
        WHERE 
            ins.estudiante_cedula = ?
        ORDER BY 
            m.nombre, re.id
    `;

    conexion.query(query, [estudianteCedula], (err, results) => {
        if (err) {
            console.error('Error al obtener calificaciones:', err);
            return res.render('studen/calificaciones', { 
                datos: req.session, 
                currentPage: 'calificaciones',
                materias: [],
                stats: {
                    promedioGeneral: 0,
                    materiasAprobadas: 0,
                    totalMaterias: 0,
                    porcentajeCompletado: 0
                },
                error: 'Error al cargar las calificaciones'
            });
        }

        // Procesar resultados para agrupar por materia
        const materiasMap = new Map();

        results.forEach(row => {
            if (!materiasMap.has(row.materia_codigo)) {
                materiasMap.set(row.materia_codigo, {
                    nombre: row.materia_nombre,
                    codigo: row.materia_codigo,
                    seccion: row.seccion_codigo,
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
                    // Calcular calificación ponderada
                    calificacionRubrica = (puntajeObtenido / maxPuntaje) * porcentajeRubrica;
                    materia.calificacion_final += calificacionRubrica;
                }

                materia.rubricas.push({
                    nombre: row.nombre_rubrica,
                    porcentaje: porcentajeRubrica,
                    puntaje_obtenido: row.puntaje_total !== null ? puntajeObtenido : null,
                    puntaje_maximo: maxPuntaje,
                    observaciones: row.observaciones,
                    fecha: row.fecha_evaluacion
                });
                
                materia.total_evaluado += porcentajeRubrica;
                if (row.puntaje_total !== null) {
                    materia.porcentaje_acumulado += porcentajeRubrica;
                }
            }
        });

        const materias = Array.from(materiasMap.values());

        // Calcular estadísticas
        let totalMaterias = materias.length;
        let materiasAprobadas = materias.filter(m => m.calificacion_final >= 10).length;
 
        materias.forEach(m => {
            // Convertir escala según el peso total
            if (m.total_evaluado > 20) {
                m.calificacion_final_20 = (m.calificacion_final / 100) * 20;
                m.scale = 100;
            } else {
                m.calificacion_final_20 = m.calificacion_final;
                m.calificacion_final = (m.calificacion_final / 20) * 100;
                m.scale = 20;
            }
            
            m.promedio = m.calificacion_final.toFixed(1);
            m.promedioDisplay = `${m.calificacion_final.toFixed(1)/10}/100 (${m.calificacion_final_20.toFixed(1)/10}/20)`;
        });

        let promedioGeneral = 0;
        
        if (totalMaterias > 0) {
            const sum100 = materias.reduce((acc, m) => acc + parseFloat(m.calificacion_final), 0);
            const sum20 = materias.reduce((acc, m) => acc + parseFloat(m.calificacion_final_20), 0);
            
            promedioGeneral = ((sum20 / totalMaterias)/10).toFixed(1);
        }

        let porcentajeCompletado = 0;
        if (totalMaterias > 0) {
             porcentajeCompletado = (materias.reduce((acc, m) => acc + m.porcentaje_acumulado, 0) / totalMaterias).toFixed(1);
        }

        res.render('studen/calificaciones', {
            datos: req.session,
            currentPage: 'calificaciones',
            materias: materias,
            stats: {
                promedioGeneral: promedioGeneral,
                materiasAprobadas,
                totalMaterias,
                porcentajeCompletado
            }
        });
    });
};

module.exports = {
    getCalificaciones
};
