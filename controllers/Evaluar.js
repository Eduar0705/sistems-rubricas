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
    const evaluacionId = req.params.id;

    try {
        // =====================
        // 1. Obtener evaluación
        // =====================
        const evalSQL = `
            SELECT 
                ee.id,
                ee.rubrica_id,
                ee.estudiante_cedula,
                ee.observaciones,
                ee.puntaje_total,
                ee.fecha_evaluacion,
                re.nombre_rubrica,
                re.tipo_evaluacion,
                re.porcentaje_evaluacion,
                re.instrucciones,
                re.competencias,
                m.nombre AS materia_nombre,
                m.codigo AS materia_codigo
            FROM evaluacion_estudiante ee
            INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
            INNER JOIN materia m ON re.materia_codigo = m.codigo
            WHERE ee.id = ?
        `;

        const evalData = await query(evalSQL, [evaluacionId]);
        if (evalData.length === 0) return sendError(res, 'Evaluación no encontrada');

        const evaluacion = evalData[0];


        // =====================
        // 2. Obtener estudiante
        // =====================
        const estSQL = `
            SELECT 
                e.cedula,
                e.nombre,
                e.apellido,
                e.email,
                c.nombre AS carrera
            FROM estudiante e
            INNER JOIN carrera c ON e.carrera_codigo = c.codigo
            WHERE e.cedula = ?
        `;

        const estudiantes = await query(estSQL, [evaluacion.estudiante_cedula]);
        if (estudiantes.length === 0) return sendError(res, 'Estudiante no encontrado');

        const estudiante = estudiantes[0];


        // =====================
        // 3. Obtener criterios
        // =====================
        const criteriosSQL = `
            SELECT id, descripcion, puntaje_maximo, orden
            FROM criterio_evaluacion
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
                id, criterio_id, nombre_nivel,
                descripcion, puntaje, orden
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
                criterio_id,
                nivel_seleccionado,
                puntaje_obtenido
            FROM detalle_evaluacion
            WHERE evaluacion_id = ?
        `;

        const detalles = await query(detallesSQL, [evaluacionId]);

        const detallesMap = {};
        detalles.forEach(d => {
            detallesMap[d.criterio_id] = {
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
                    id: n.id,
                    nombre: n.nombre_nivel,
                    descripcion: n.descripcion,
                    puntaje: n.puntaje,
                    orden: n.orden,
                    seleccionado: detallesMap[c.id]?.nivel_seleccionado === n.id
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
router.post('/api/evaluacion/:id/guardar', (req, res) => {
    const evaluacionId = req.params.id;
    const { observaciones, puntaje_total, detalles } = req.body;

    if (!detalles || detalles.length === 0) {
        return sendError(res, 'No se recibieron los detalles de evaluación');
    }

    conexion.beginTransaction(async err => {
        if (err) return sendError(res, 'Error al iniciar transacción', err);

        try {
            // ========================
            // 1. Actualizar evaluación
            // ========================
            await query(`
                UPDATE evaluacion_estudiante 
                SET observaciones = ?, puntaje_total = ?
                WHERE id = ?
            `, [observaciones, puntaje_total, evaluacionId]);


            // ========================
            // 2. Borrar detalles previos
            // ========================
            await query(`DELETE FROM detalle_evaluacion WHERE evaluacion_id = ?`, [evaluacionId]);


            // ========================
            // 3. Insertar nuevos
            // ========================
            const values = detalles.map(d => [
                evaluacionId,
                d.criterio_id,
                d.nivel_id,
                d.puntaje_obtenido
            ]);

            await query(`
                INSERT INTO detalle_evaluacion 
                (evaluacion_id, criterio_id, nivel_seleccionado, puntaje_obtenido)
                VALUES ?
            `, [values]);


            conexion.commit(err => {
                if (err) {
                    return conexion.rollback(() =>
                        sendError(res, 'Error al finalizar el guardado', err)
                    );
                }

                return res.json({
                    success: true,
                    message: 'Evaluación guardada correctamente',
                    puntaje_total
                });
            });

        } catch (error) {
            conexion.rollback(() => sendError(res, 'Error al guardar evaluación', error));
        }
    });
});


module.exports = router;
