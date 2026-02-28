const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');


// =====================================================================
// 🔹 FUNCIONES AUXILIARES
// =====================================================================
function sendError(res, msg, err) {
    if (err) console.error(msg, err);
    return res.json({ success: false, message: msg });
}

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}


// =====================================================================
// 🔹 GET — Obtener datos completos de una evaluación
// =====================================================================
router.get('/api/evaluacion/:id/detalles', async (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        return res.status(401).json({ success: false, message: 'Por favor, inicia sesión para acceder a esta página.' });
    }

    const evaluacionId = req.params.id;
    const estudianteCedula = req.session.cedula;

    try {
        // =====================
        // 1. Obtener evaluación
        // =====================
        const evalSQL = `
            SELECT
                er.id,
                r.id as rubrica_id,
                er.cedula_evaluado as estudiante_cedula,
                er.observaciones,
                SUM(DISTINCT de.puntaje_obtenido) as puntaje_total,
                er.fecha_evaluado as fecha_evaluacion,
                r.nombre_rubrica,
                GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                tr.nombre as tipo_rubrica,
                SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion,
                r.instrucciones,
                e.competencias,
                m.nombre as materia_nombre,
                m.codigo as materia_codigo,
                CONCAT(ud.nombre, ' ', ud.apeliido) as profesor
            FROM evaluacion_realizada er
            INNER JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id  
            RIGHT JOIN evaluacion e ON er.id_evaluacion = e.id  
            INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            INNER JOIN tipo_rubrica tr ON r.id_tipo = tr.id
            INNER JOIN criterio_rubrica cr ON cr.rubrica_id = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN usuario ud ON ud.cedula = er.cedula_evaluador
            LEFT JOIN estrategia_empleada eemp ON er.id_evaluacion = eemp.id_eval
            LEFT JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
            WHERE er.cedula_evaluado = ? AND er.id_evaluacion = ?
            GROUP BY e.id
            ORDER BY er.fecha_evaluado DESC;
        `;

        const evalData = await query(evalSQL, [estudianteCedula, evaluacionId]);
        if (evalData.length === 0) return sendError(res, 'Evaluación no encontrada');

        const evaluacion = evalData[0];


        // =====================
        // 2. Obtener estudiante
        // =====================
        const estSQL = `
            SELECT 
                u.cedula,
                u.nombre,
                u.apeliido as apellido,
                u.email,
                c.nombre AS carrera
            FROM usuario u
            INNER JOIN usuario_estudiante ue ON u.cedula = ue.cedula_usuario
            INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
            WHERE u.cedula = ?
        `;

        const estudiantes = await query(estSQL, [evaluacion.estudiante_cedula]);
        if (estudiantes.length === 0) return sendError(res, 'Estudiante no encontrado');

        const estudiante = estudiantes[0];


        // =====================
        // 3. Obtener criterios
        // =====================
        const criteriosSQL = `
            SELECT id, descripcion, puntaje_maximo, orden
            FROM criterio_rubrica
            WHERE rubrica_id = ?
            ORDER BY orden
        `;

        const criterios = await query(criteriosSQL, [evaluacion.rubrica_id]);
        if (criterios.length === 0) return sendError(res, 'No hay criterios configurados');


        // =====================
        // 4. Obtener niveles
        // =====================
        const criteriosIds = criterios.map(c => c.id);

        const nivelesSQL = `
            SELECT
                criterio_id, nombre_nivel,
                descripcion, puntaje_maximo AS puntaje, orden
            FROM nivel_desempeno
            WHERE criterio_id IN (?)
            ORDER BY criterio_id, orden
        `;

        const niveles = await query(nivelesSQL, [criteriosIds]);


        // =====================
        // 5. Obtener detalles guardados
        // =====================
        const detallesSQL = `
            SELECT
                de.id_criterio_detalle,
                de.orden_detalle AS nivel_seleccionado,
                de.puntaje_obtenido
            FROM detalle_evaluacion de 
            INNER JOIN evaluacion_realizada er ON de.evaluacion_r_id = er.id
            INNER JOIN evaluacion e ON er.id_evaluacion = e.id
            WHERE e.id = ? AND er.cedula_evaluado = ?
        `;

        const detalles = await query(detallesSQL, [evaluacionId, estudianteCedula]); 
        
        const detallesMap = {};
        detalles.forEach(d => {
            detallesMap[d.id_criterio_detalle] = {
                nivel_seleccionado: d.nivel_seleccionado,
                puntaje_obtenido: d.puntaje_obtenido
            };
        });

        // =====================
        // 6. Unir criterios + niveles + selección
        // =====================
        const criteriosFinal = criterios.map(c => {
            const nivelesCriterio = niveles
                .filter(n => n.criterio_id === c.id)
                .map(n => ({
                    id: n.orden,
                    nombre: n.nombre_nivel,
                    descripcion: n.descripcion,
                    puntaje: detallesMap[c.id]?.nivel_seleccionado === n.orden ? detallesMap[c.id]?.puntaje_obtenido : n.puntaje,
                    puntaje_maximo: n.puntaje,
                    orden: n.orden,
                    seleccionado: detallesMap[c.id]?.nivel_seleccionado === n.orden
                }));

            return {
                id: c.id,
                nombre: c.descripcion,
                descripcion: c.descripcion,
                puntaje_maximo: c.puntaje_maximo,
                orden: c.orden,
                niveles: nivelesCriterio
            };
        });


        // =====================
        // 7. Respuesta final
        // =====================
        return res.json({
            success: true,
            evaluacion: {
                id: evaluacion.id,
                rubrica_id: evaluacion.rubrica_id,
                estudiante_cedula: evaluacion.estudiante_cedula,
                observaciones: evaluacion.observaciones,
                puntaje_total: evaluacion.puntaje_total,
                fecha_evaluacion: evaluacion.fecha_evaluacion
            },
            estudiante,
            rubrica: {
                nombre_rubrica: evaluacion.nombre_rubrica,
                tipo_evaluacion: evaluacion.tipo_evaluacion,
                porcentaje_evaluacion: evaluacion.porcentaje_evaluacion,
                instrucciones: evaluacion.instrucciones,
                competencias: evaluacion.competencias,
                materia: evaluacion.materia_nombre,
                materia_codigo: evaluacion.materia_codigo
            },
            criterios: criteriosFinal
        });

    } catch (err) {
        return sendError(res, 'Error al obtener la evaluación', err);
    }
});




// =====================================================================
// 🔹 POST — Guardar evaluación
// =====================================================================
router.post('/api/evaluacion/:id/:cedulaEstudiante/guardar', (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        return res.status(401).json({ success: false, message: 'Por favor, inicia sesión para acceder a esta página.' });
    }

    const evaluacionId = req.params.id;
    const cedulaEstudiante = req.params.cedulaEstudiante;
    const { observaciones, puntaje_total, detalles } = req.body;

    if (!detalles || detalles.length === 0) {
        return sendError(res, 'No se recibieron los detalles de evaluación');
    }

    // Obtener una conexión del pool
    conexion.getConnection((err, conn) => {
        if (err) {
            return sendError(res, 'Error al conectar con la base de datos', err);
        }

        // Iniciar transacción en la conexión obtenida
        conn.beginTransaction(async err => {
            if (err) {
                conn.release();
                return sendError(res, 'Error al iniciar transacción', err);
            }

            try {
                let eval_r_id = null;
                
                // ========================
                // 1. Verificar si ya existe la evaluación
                // ========================
                const existeEvaluacion = await new Promise((resolve, reject) => {
                    conn.query(`
                        SELECT id FROM evaluacion_realizada 
                        WHERE id_evaluacion = ? AND cedula_evaluado = ?
                    `, [evaluacionId, cedulaEstudiante], (err, results) => {
                        if (err) reject(err);
                        else resolve(results.length > 0 ? results[0].id : null);
                    });
                });

                if (existeEvaluacion) {
                    // ========================
                    // 2. ACTUALIZAR evaluación existente
                    // ========================
                    eval_r_id = existeEvaluacion;
                    
                    await new Promise((resolve, reject) => {
                        conn.query(`
                            UPDATE evaluacion_realizada 
                            SET observaciones = ?, cedula_evaluador = ?, fecha_evaluado = NOW()
                            WHERE id = ?
                        `, [observaciones, req.session.cedula, eval_r_id], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                    
                    console.log('Evaluación actualizada, ID:', eval_r_id);
                    
                    // ========================
                    // 3. Borrar detalles previos
                    // ========================
                    await new Promise((resolve, reject) => {
                        conn.query(`DELETE FROM detalle_evaluacion WHERE evaluacion_r_id = ?`, [eval_r_id], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                    
                } else {
                    // ========================
                    // 2. INSERTAR nueva evaluación
                    // ========================
                    await new Promise((resolve, reject) => {
                        conn.query(`
                            INSERT INTO evaluacion_realizada (observaciones, cedula_evaluador, id_evaluacion, cedula_evaluado, fecha_evaluado) 
                            VALUES (?, ?, ?, ?, NOW())
                        `, [observaciones, req.session.cedula, evaluacionId, cedulaEstudiante], (err, result) => {
                            if (err) reject(err);
                            else {
                                eval_r_id = result.insertId;
                                resolve(result);
                            }
                        });
                    });
                    
                    console.log('Nueva evaluación insertada, ID:', eval_r_id);
                }

                // ========================
                // 4. Insertar nuevos detalles
                // ========================
                const values = detalles.map(d => [
                    eval_r_id,
                    d.criterio_id,
                    d.nivel_id,
                    d.puntaje_obtenido
                ]);

                await new Promise((resolve, reject) => {
                    conn.query(`
                        INSERT INTO detalle_evaluacion 
                        (evaluacion_r_id, id_criterio_detalle, orden_detalle, puntaje_obtenido)
                        VALUES ?
                    `, [values], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                // ========================
                // 5. Confirmar transacción
                // ========================
                conn.commit(err => {
                    if (err) {
                        return conn.rollback(() => {
                            conn.release();
                            sendError(res, 'Error al finalizar el guardado', err);
                        });
                    }

                    conn.release();
                    return res.json({
                        success: true,
                        message: existeEvaluacion ? 'Evaluación actualizada correctamente' : 'Evaluación guardada correctamente',
                        puntaje_total,
                        actualizado: existeEvaluacion ? true : false
                    });
                });

            } catch (error) {
                conn.rollback(() => {
                    conn.release();
                    sendError(res, 'Error al guardar evaluación', error);
                });
            }
        });
    });
});


module.exports = router;
