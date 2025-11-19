const conexion = require('../models/conetion');

const getCalificaciones = (req, res) => {
    if (!req.session || !req.session.login) {
        return res.redirect('/login');
    }

    const estudianteCedula = req.session.cedula; // Assuming cedula is stored in session

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
            console.error('Error fetching grades:', err);
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

        // Process results to group by subject
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
                    total_evaluado: 0 // Percentage of the course that has been evaluated so far
                });
            }

            const materia = materiasMap.get(row.materia_codigo);

            if (row.rubrica_id) {
                const maxPuntaje = parseFloat(row.puntaje_maximo_rubrica) || 0;
                const puntajeObtenido = parseFloat(row.puntaje_total) || 0;
                const porcentajeRubrica = parseFloat(row.porcentaje_evaluacion) || 0;
                
                let calificacionRubrica = 0;
                if (maxPuntaje > 0 && row.puntaje_total !== null) {
                    // Calculate weighted score: (Score / Max) * Weight
                    // Assuming the final grade is on a scale of 0-20 or 0-100 based on the sum of weights.
                    // If weights sum to 100%, this gives the final score out of 100.
                    // If weights sum to 20 (common in some systems), it gives score out of 20.
                    // Let's assume weights sum to 100 for percentage calculation.
                    
                    // However, usually grades are 0-20 in Venezuela (implied by cedula/names).
                    // Let's check if percentages are like 10, 20 (sum to 100) or weights.
                    // In the dump: `porcentaje_evaluacion` is 10.00, 20.00.
                    // So likely sum to 100.
                    
                    // Contribution to final grade (0-20 scale):
                    // (Score / Max) * (Weight / 100) * 20 ??
                    // Or maybe the final grade is just sum of (Score / Max * Weight).
                    // Let's stick to a 0-100 scale for the progress bar and display.
                    
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

        // Calculate stats
        let totalMaterias = materias.length;
        let materiasAprobadas = materias.filter(m => m.calificacion_final >= 10).length; // Assuming 10 is passing on 0-20 scale, or 50 on 0-100
        // Let's assume 0-20 scale for now as it's common in the region suggested by the data.
        // If the sum of percentages is 100, then `calificacion_final` is out of 100.
        // Let's convert to 0-20 scale if needed or keep as is.
        // In the view, grades are like "9.2", "8.5". This looks like 0-10 or 0-20 scale.
        // If `porcentaje_evaluacion` sums to 100 (e.g. 20% + 30%...), then `calificacion_final` will be 0-100.
        // To get 0-20, we divide by 5.
        // Let's normalize to 0-20 for display if the sum of weights is > 20.
        
        materias.forEach(m => {
            // Heuristic: if total weight > 20, assume it's out of 100 and convert to 20.
            if (m.total_evaluado > 20) {
                m.calificacion_final_20 = (m.calificacion_final / 100) * 20;
                m.scale = 100;
            } else {
                m.calificacion_final_20 = m.calificacion_final;
                m.scale = 20;
            }
            
            // Format for display
            m.promedio = m.calificacion_final_20.toFixed(1);
        });

        let promedioGeneral = 0;
        if (totalMaterias > 0) {
            promedioGeneral = (materias.reduce((acc, m) => acc + parseFloat(m.promedio), 0) / totalMaterias).toFixed(1);
        }

        let porcentajeCompletado = 0;
        if (totalMaterias > 0) {
            // Average of (porcentaje_acumulado / total_evaluado) ?
            // Or just average of percentage completed per subject
            // Let's use average of (porcentaje_acumulado) if we assume 100% is the goal
             porcentajeCompletado = (materias.reduce((acc, m) => acc + m.porcentaje_acumulado, 0) / (totalMaterias * 100) * 100).toFixed(1);
             // Simplified: just average of accumulated percentage
             porcentajeCompletado = (materias.reduce((acc, m) => acc + m.porcentaje_acumulado, 0) / totalMaterias).toFixed(1);
        }

        res.render('studen/calificaciones', {
            datos: req.session,
            currentPage: 'calificaciones',
            materias: materias,
            stats: {
                promedioGeneral,
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
