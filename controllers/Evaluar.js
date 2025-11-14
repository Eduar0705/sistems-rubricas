const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// =============================================
// GET - Obtener detalles de evaluación para modal
// =============================================
router.get('/api/evaluacion/:id/detalles', (req, res) => {
    const evaluacionId = req.params.id;

    // Consulta para obtener información de la evaluación
    const queryEvaluacion = `
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
            m.nombre as materia_nombre,
            m.codigo as materia_codigo
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
        INNER JOIN materia m ON re.materia_codigo = m.codigo
        WHERE ee.id = ?
    `;

    conexion.query(queryEvaluacion, [evaluacionId], (err, resultEvaluacion) => {
        if (err) {
            console.error('Error al obtener evaluación:', err);
            return res.json({ 
                success: false, 
                message: 'Error al obtener la evaluación' 
            });
        }

        if (resultEvaluacion.length === 0) {
            return res.json({ 
                success: false, 
                message: 'Evaluación no encontrada' 
            });
        }

        const evaluacion = resultEvaluacion[0];

        // Consulta para obtener información del estudiante
        const queryEstudiante = `
            SELECT 
                e.cedula,
                e.nombre,
                e.apellido,
                e.email,
                c.nombre as carrera
            FROM estudiante e
            INNER JOIN carrera c ON e.carrera_codigo = c.codigo
            WHERE e.cedula = ?
        `;

        conexion.query(queryEstudiante, [evaluacion.estudiante_cedula], (err, resultEstudiante) => {
            if (err) {
                console.error('Error al obtener estudiante:', err);
                return res.json({ 
                    success: false, 
                    message: 'Error al obtener información del estudiante' 
                });
            }

            if (resultEstudiante.length === 0) {
                return res.json({ 
                    success: false, 
                    message: 'Estudiante no encontrado' 
                });
            }

            const estudiante = resultEstudiante[0];

            // Consulta para obtener criterios con sus niveles de desempeño
            const queryCriterios = `
                SELECT 
                    ce.id,
                    ce.descripcion,
                    ce.puntaje_maximo,
                    ce.orden
                FROM criterio_evaluacion ce
                WHERE ce.rubrica_id = ?
                ORDER BY ce.orden ASC
            `;

            conexion.query(queryCriterios, [evaluacion.rubrica_id], (err, resultCriterios) => {
                if (err) {
                    console.error('Error al obtener criterios:', err);
                    return res.json({ 
                        success: false, 
                        message: 'Error al obtener criterios de evaluación' 
                    });
                }

                // Obtener niveles de desempeño para cada criterio
                const criteriosIds = resultCriterios.map(c => c.id);
                
                if (criteriosIds.length === 0) {
                    return res.json({ 
                        success: false, 
                        message: 'No hay criterios de evaluación configurados' 
                    });
                }

                const queryNiveles = `
                    SELECT 
                        nd.id,
                        nd.criterio_id,
                        nd.nombre_nivel,
                        nd.descripcion,
                        nd.puntaje,
                        nd.orden
                    FROM nivel_desempeno nd
                    WHERE nd.criterio_id IN (?)
                    ORDER BY nd.criterio_id ASC, nd.orden ASC
                `;

                conexion.query(queryNiveles, [criteriosIds], (err, resultNiveles) => {
                    if (err) {
                        console.error('Error al obtener niveles:', err);
                        return res.json({ 
                            success: false, 
                            message: 'Error al obtener niveles de desempeño' 
                        });
                    }

                    // Agrupar niveles por criterio
                    const criteriosConNiveles = resultCriterios.map(criterio => {
                        const niveles = resultNiveles.filter(
                            nivel => nivel.criterio_id === criterio.id
                        );

                        return {
                            id: criterio.id,
                            descripcion: criterio.descripcion,
                            puntaje_maximo: criterio.puntaje_maximo,
                            orden: criterio.orden,
                            niveles: niveles
                        };
                    });

                    // Preparar respuesta
                    const response = {
                        success: true,
                        evaluacion: {
                            id: evaluacion.id,
                            rubrica_id: evaluacion.rubrica_id,
                            estudiante_cedula: evaluacion.estudiante_cedula,
                            observaciones: evaluacion.observaciones,
                            puntaje_total: evaluacion.puntaje_total,
                            fecha_evaluacion: evaluacion.fecha_evaluacion
                        },
                        estudiante: {
                            cedula: estudiante.cedula,
                            nombre: estudiante.nombre,
                            apellido: estudiante.apellido,
                            email: estudiante.email,
                            carrera: estudiante.carrera
                        },
                        rubrica: {
                            nombre_rubrica: evaluacion.nombre_rubrica,
                            tipo_evaluacion: evaluacion.tipo_evaluacion,
                            porcentaje_evaluacion: evaluacion.porcentaje_evaluacion,
                            instrucciones: evaluacion.instrucciones,
                            competencias: evaluacion.competencias,
                            materia: evaluacion.materia_nombre,
                            materia_codigo: evaluacion.materia_codigo
                        },
                        criterios: criteriosConNiveles
                    };

                    res.json(response);
                });
            });
        });
    });
});

// =============================================
// POST - Guardar evaluación
// =============================================
router.post('/api/evaluacion/:id/guardar', (req, res) => {
    const evaluacionId = req.params.id;
    const { observaciones, puntaje_total, detalles } = req.body;

    // Validar que vengan los datos necesarios
    if (!detalles || detalles.length === 0) {
        return res.json({ 
            success: false, 
            message: 'No se recibieron los detalles de la evaluación' 
        });
    }

    // Iniciar transacción
    conexion.beginTransaction((err) => {
        if (err) {
            console.error('Error al iniciar transacción:', err);
            return res.json({ 
                success: false, 
                message: 'Error al procesar la evaluación' 
            });
        }

        // Actualizar la evaluación principal
        const queryUpdateEvaluacion = `
            UPDATE evaluacion_estudiante 
            SET observaciones = ?, 
                puntaje_total = ?
            WHERE id = ?
        `;

        conexion.query(queryUpdateEvaluacion, [observaciones, puntaje_total, evaluacionId], (err) => {
            if (err) {
                console.error('Error al actualizar evaluación:', err);
                return conexion.rollback(() => {
                    res.json({ 
                        success: false, 
                        message: 'Error al guardar la evaluación' 
                    });
                });
            }

            // Eliminar detalles anteriores (por si se está re-evaluando)
            const queryDeleteDetalles = `
                DELETE FROM detalle_evaluacion 
                WHERE evaluacion_id = ?
            `;

            conexion.query(queryDeleteDetalles, [evaluacionId], (err) => {
                if (err) {
                    console.error('Error al eliminar detalles anteriores:', err);
                    return conexion.rollback(() => {
                        res.json({ 
                            success: false, 
                            message: 'Error al procesar los detalles' 
                        });
                    });
                }

                // Insertar nuevos detalles
                const queryInsertDetalle = `
                    INSERT INTO detalle_evaluacion 
                    (evaluacion_id, criterio_id, nivel_seleccionado, puntaje_obtenido) 
                    VALUES ?
                `;

                const detallesValues = detalles.map(detalle => [
                    evaluacionId,
                    detalle.criterio_id,
                    detalle.nivel_id,
                    detalle.puntaje_obtenido
                ]);

                conexion.query(queryInsertDetalle, [detallesValues], (err) => {
                    if (err) {
                        console.error('Error al insertar detalles:', err);
                        return conexion.rollback(() => {
                            res.json({ 
                                success: false, 
                                message: 'Error al guardar los detalles de evaluación' 
                            });
                        });
                    }

                    // Confirmar transacción
                    conexion.commit((err) => {
                        if (err) {
                            console.error('Error al confirmar transacción:', err);
                            return conexion.rollback(() => {
                                res.json({ 
                                    success: false, 
                                    message: 'Error al finalizar el guardado' 
                                });
                            });
                        }

                        res.json({
                            success: true,
                            message: 'Evaluación guardada correctamente',
                            puntaje_total: puntaje_total
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;