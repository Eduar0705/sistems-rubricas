const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

//Actualizar rubrica
router.post('/updateRubrica', (req, res) => {
    let mensaje;

    const { id, nombre_rubrica, materia_codigo, seccion_id, fecha_evaluacion,
        porcentaje_evaluacion, tipo_evaluacion, competencias, instrucciones, criterios
    } = req.body;

    // Parse criterios si viene como string
    let criteriosParsed = criterios;
    if(typeof criterios === 'string') {
        try {
            criteriosParsed = JSON.parse(criterios);
        } catch(e) {
            mensaje = 'Error al procesar los criterios';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }
    }

    // Validaciones básicas
    if(!id || !nombre_rubrica || !materia_codigo || !seccion_id || !fecha_evaluacion || !porcentaje_evaluacion || !tipo_evaluacion) {
        mensaje = 'Faltan campos requeridos';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    if(!criteriosParsed || criteriosParsed.length === 0) {
        mensaje = 'Debe agregar al menos un criterio';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar que la sesión exista
    if(!req.session || !req.session.cedula) {
        mensaje = 'Sesión no válida';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Iniciar transacción
    connection.beginTransaction((err) => {
        if(err) {
            console.error('Error al iniciar transacción:', err);
            mensaje = 'Error del servidor al iniciar transacción';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // 1. Actualizar la rúbrica principal
        const queryUpdateRubrica = `
            UPDATE rubrica_evaluacion
            SET nombre_rubrica = ?, materia_codigo = ?, seccion_id = ?, fecha_evaluacion = ?,
                porcentaje_evaluacion = ?, tipo_evaluacion = ?, competencias = ?, instrucciones = ?
            WHERE id = ? AND docente_cedula = ?
        `;

        const valuesUpdateRubrica = [
            nombre_rubrica,
            materia_codigo,
            seccion_id,
            fecha_evaluacion,
            porcentaje_evaluacion,
            tipo_evaluacion,
            competencias || null,
            instrucciones || null,
            id,
            req.session.cedula
        ];

        connection.query(queryUpdateRubrica, valuesUpdateRubrica, (error, resultRubrica) => {
            if(error) {
                return connection.rollback(() => {
                    console.error('Error al actualizar rúbrica:', error);
                    mensaje = 'Error al actualizar la rúbrica';
                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                });
            }

            if(resultRubrica.affectedRows === 0) {
                return connection.rollback(() => {
                    mensaje = 'Rúbrica no encontrada o no autorizada';
                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                });
            }

            // 2. Obtener criterios existentes
            const queryGetCriterios = `SELECT id, descripcion, puntaje_maximo, orden FROM criterio_evaluacion WHERE rubrica_id = ?`;
            connection.query(queryGetCriterios, [id], (error, criteriosExistentes) => {
                if(error) {
                    return connection.rollback(() => {
                        console.error('Error al obtener criterios existentes:', error);
                        mensaje = 'Error al obtener criterios existentes';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                // 3. Procesar criterios
                const criteriosMap = new Map();
                criteriosExistentes.forEach(c => criteriosMap.set(c.id, c));

                let operacionesCompletadas = 0;
                const totalOperaciones = criteriosParsed.length + criteriosExistentes.length; // Para updates/inserts y deletes

                // Actualizar/Insertar criterios
                criteriosParsed.forEach((criterio, index) => {
                    if(criterio.id && criteriosMap.has(criterio.id)) {
                        // Actualizar criterio existente
                        const queryUpdateCriterio = `
                            UPDATE criterio_evaluacion
                            SET descripcion = ?, puntaje_maximo = ?, orden = ?
                            WHERE id = ? AND rubrica_id = ?
                        `;
                        connection.query(queryUpdateCriterio, [
                            criterio.descripcion, criterio.puntaje_maximo, criterio.orden || index,
                            criterio.id, id
                        ], (error) => {
                            if(error) {
                                return connection.rollback(() => {
                                    console.error('Error al actualizar criterio:', error);
                                    mensaje = 'Error al actualizar criterios';
                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }
                            operacionesCompletadas++;
                            checkCompletion();
                        });
                    } else {
                        // Insertar nuevo criterio
                        const queryInsertCriterio = `
                            INSERT INTO criterio_evaluacion
                            (rubrica_id, descripcion, puntaje_maximo, orden)
                            VALUES (?, ?, ?, ?)
                        `;
                        connection.query(queryInsertCriterio, [
                            id, criterio.descripcion, criterio.puntaje_maximo, criterio.orden || index
                        ], (error, result) => {
                            if(error) {
                                return connection.rollback(() => {
                                    console.error('Error al insertar criterio:', error);
                                    mensaje = 'Error al insertar criterios';
                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }
                            criterio.id = result.insertId; // Asignar ID para niveles
                            operacionesCompletadas++;
                            checkCompletion();
                        });
                    }
                });

                // Eliminar criterios no incluidos
                criteriosExistentes.forEach(criterioExistente => {
                    const encontrado = criteriosParsed.some(c => c.id == criterioExistente.id);
                    if(!encontrado) {
                        connection.query('DELETE FROM criterio_evaluacion WHERE id = ?', [criterioExistente.id], (error) => {
                            if(error) {
                                return connection.rollback(() => {
                                    console.error('Error al eliminar criterio:', error);
                                    mensaje = 'Error al eliminar criterios';
                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }
                            operacionesCompletadas++;
                            checkCompletion();
                        });
                    } else {
                        operacionesCompletadas++; // Contar como completado si no se elimina
                        checkCompletion();
                    }
                });

                function checkCompletion() {
                    if(operacionesCompletadas >= totalOperaciones) {
                        // Ahora procesar niveles
                        procesarNiveles();
                    }
                }

                function procesarNiveles() {
                    // Obtener niveles existentes
                    const queryGetNiveles = `SELECT id, criterio_id, nombre_nivel, descripcion, puntaje, orden FROM nivel_desempeno WHERE criterio_id IN (SELECT id FROM criterio_evaluacion WHERE rubrica_id = ?)`;
                    connection.query(queryGetNiveles, [id], (error, nivelesExistentes) => {
                        if(error) {
                            return connection.rollback(() => {
                                console.error('Error al obtener niveles existentes:', error);
                                mensaje = 'Error al obtener niveles existentes';
                                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        const nivelesMap = new Map();
                        nivelesExistentes.forEach(n => {
                            const key = `${n.criterio_id}-${n.nombre_nivel}`;
                            nivelesMap.set(key, n);
                        });

                        let operacionesNivelesCompletadas = 0;
                        let totalOperacionesNiveles = 0;

                        criteriosParsed.forEach(criterio => {
                            if(criterio.niveles && criterio.niveles.length > 0) {
                                totalOperacionesNiveles += criterio.niveles.length;
                                criterio.niveles.forEach(nivel => {
                                    const key = `${criterio.id}-${nivel.nombre_nivel}`;
                                    if(nivelesMap.has(key)) {
                                        // Actualizar nivel existente
                                        const queryUpdateNivel = `
                                            UPDATE nivel_desempeno
                                            SET descripcion = ?, puntaje = ?, orden = ?
                                            WHERE id = ?
                                        `;
                                        connection.query(queryUpdateNivel, [
                                            nivel.descripcion, nivel.puntaje, nivel.orden,
                                            nivelesMap.get(key).id
                                        ], (error) => {
                                            if(error) {
                                                return connection.rollback(() => {
                                                    console.error('Error al actualizar nivel:', error);
                                                    mensaje = 'Error al actualizar niveles';
                                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                                });
                                            }
                                            operacionesNivelesCompletadas++;
                                            checkNivelesCompletion();
                                        });
                                    } else {
                                        // Insertar nuevo nivel
                                        const queryInsertNivel = `
                                            INSERT INTO nivel_desempeno
                                            (criterio_id, nombre_nivel, descripcion, puntaje, orden)
                                            VALUES (?, ?, ?, ?, ?)
                                        `;
                                        connection.query(queryInsertNivel, [
                                            criterio.id, nivel.nombre_nivel, nivel.descripcion, nivel.puntaje, nivel.orden
                                        ], (error) => {
                                            if(error) {
                                                return connection.rollback(() => {
                                                    console.error('Error al insertar nivel:', error);
                                                    mensaje = 'Error al insertar niveles';
                                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                                });
                                            }
                                            operacionesNivelesCompletadas++;
                                            checkNivelesCompletion();
                                        });
                                    }
                                });
                            }
                        });

                        // Eliminar niveles no incluidos
                        nivelesExistentes.forEach(nivelExistente => {
                            const criterioEncontrado = criteriosParsed.find(c => c.id == nivelExistente.criterio_id);
                            if(criterioEncontrado) {
                                const nivelEncontrado = criterioEncontrado.niveles?.some(n => n.nombre_nivel === nivelExistente.nombre_nivel);
                                if(!nivelEncontrado) {
                                    totalOperacionesNiveles++;
                                    connection.query('DELETE FROM nivel_desempeno WHERE id = ?', [nivelExistente.id], (error) => {
                                        if(error) {
                                            return connection.rollback(() => {
                                                console.error('Error al eliminar nivel:', error);
                                                mensaje = 'Error al eliminar niveles';
                                                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                            });
                                        }
                                        operacionesNivelesCompletadas++;
                                        checkNivelesCompletion();
                                    });
                                }
                            }
                        });

                        function checkNivelesCompletion() {
                            if(operacionesNivelesCompletadas >= totalOperacionesNiveles) {
                                // Finalizar transacción
                                connection.commit((err) => {
                                    if(err) {
                                        return connection.rollback(() => {
                                            console.error('Error al confirmar transacción:', err);
                                            mensaje = 'Error al confirmar la transacción';
                                            res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                        });
                                    }

                                    console.log('Rúbrica actualizada exitosamente con ID:', id);
                                    mensaje = 'Rúbrica actualizada exitosamente';
                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }
                        }
                    });
                }
            });
        });
    });
});

module.exports = router;