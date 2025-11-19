const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// Ruta POST para guardar la rúbrica
router.post('/envioRubricaTeacher', (req, res) => {
    let mensaje;

    const { nombre_rubrica, materia_codigo, seccion_id, fecha_evaluacion,
        porcentaje_evaluacion, tipo_evaluacion, competencias, instrucciones, criterios
    } = req.body;

    // Parse criterios si viene como string
    let criteriosParsed = criterios;
    if(typeof criterios === 'string') {
        try {
            criteriosParsed = JSON.parse(criterios);
        } catch(e) {
            mensaje = 'Error al procesar los criterios';
            return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }
    }

    // Validaciones básicas
    if(!nombre_rubrica || !materia_codigo || !seccion_id || !fecha_evaluacion || !porcentaje_evaluacion || !tipo_evaluacion) {
        mensaje = 'Faltan campos requeridos';
        return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    if(!criteriosParsed || criteriosParsed.length === 0) {
        mensaje = 'Debe agregar al menos un criterio';
        return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
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
            return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // 1. Insertar la rúbrica principal
        const queryRubrica = `
            INSERT INTO rubrica_evaluacion
            (nombre_rubrica, docente_cedula, materia_codigo, seccion_id, fecha_evaluacion,
            porcentaje_evaluacion, tipo_evaluacion, competencias, instrucciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valuesRubrica = [
            nombre_rubrica,
            req.session.cedula,
            materia_codigo,
            seccion_id,
            fecha_evaluacion,
            porcentaje_evaluacion,
            tipo_evaluacion,
            competencias || null,
            instrucciones || null
        ];

        connection.query(queryRubrica, valuesRubrica, (error, resultRubrica) => {
            if(error) {
                return connection.rollback(() => {
                    console.error('Error al insertar rúbrica:', error);
                    mensaje = 'Error al guardar la rúbrica';
                    res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                });
            }

            const rubricaId = resultRubrica.insertId;
            let criteriosCompletados = 0;
            const totalCriterios = criteriosParsed.length;
            let hayError = false;

            // 2. Insertar criterios y niveles
            criteriosParsed.forEach((criterio) => {
                if(hayError) return;

                const queryCriterio = `
                    INSERT INTO criterio_evaluacion
                    (rubrica_id, descripcion, puntaje_maximo, orden)
                    VALUES (?, ?, ?, ?)
                `;

                const valuesCriterio = [
                    rubricaId,
                    criterio.descripcion,
                    criterio.puntaje_maximo,
                    criterio.orden
                ];

                connection.query(queryCriterio, valuesCriterio, (error, resultCriterio) => {
                    if(error) {
                        hayError = true;
                        return connection.rollback(() => {
                            console.error('Error al insertar criterio:', error);
                            mensaje = 'Error al guardar los criterios';
                            res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    const criterioId = resultCriterio.insertId;

                    // 3. Insertar niveles de desempeño
                    if(criterio.niveles && criterio.niveles.length > 0) {
                        let nivelesCompletados = 0;
                        const totalNiveles = criterio.niveles.length;

                        criterio.niveles.forEach((nivel) => {
                            if(hayError) return;

                            const queryNivel = `
                                INSERT INTO nivel_desempeno
                                (criterio_id, nombre_nivel, descripcion, puntaje, orden)
                                VALUES (?, ?, ?, ?, ?)
                            `;

                            const valuesNivel = [
                                criterioId,
                                nivel.nombre_nivel,
                                nivel.descripcion,
                                nivel.puntaje,
                                nivel.orden
                            ];

                            connection.query(queryNivel, valuesNivel, (error) => {
                                if(error) {
                                    hayError = true;
                                    return connection.rollback(() => {
                                        console.error('Error al insertar nivel:', error);
                                        mensaje = 'Error al guardar los niveles de desempeño';
                                        res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                                    });
                                }

                                nivelesCompletados++;

                                // Verificar si todos los niveles de este criterio fueron insertados
                                if(nivelesCompletados === totalNiveles) {
                                    criteriosCompletados++;

                                    // Verificar si todos los criterios fueron completados
                                    if(criteriosCompletados === totalCriterios && !hayError) {
                                        finalizarTransaccion();
                                    }
                                }
                            });
                        });
                    } else {
                        // Si no hay niveles, contar el criterio como completado
                        criteriosCompletados++;

                        if(criteriosCompletados === totalCriterios && !hayError) {
                            finalizarTransaccion();
                        }
                    }
                });
            });

            // Función para finalizar la transacción
            function finalizarTransaccion() {
                // Crear notificación para el admin con referencia a la rúbrica
                const mensajeNotificacion = `El docente ${req.session.nombre || req.session.username || 'Un docente'} ha creado una nueva rúbrica`;
                const queryNotificacion = `INSERT INTO notificaciones (mensaje, tipo, usuario_destino, rubrica_id) VALUES (?, 'info', 'admin', ?)`;
                
                connection.query(queryNotificacion, [mensajeNotificacion, rubricaId], (errNotif) => {
                    if (errNotif) {
                        // Si falla la notificación, no detenemos el proceso principal, solo lo logueamos
                        console.error('Error al crear notificación:', errNotif);
                    }

                    connection.commit((err) => {
                        if(err) {
                            return connection.rollback(() => {
                                console.error('Error al confirmar transacción:', err);
                                mensaje = 'Error al confirmar la transacción';
                                res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        console.log('Rúbrica creada exitosamente con ID:', rubricaId);
                        mensaje = 'Rúbrica creada exitosamente';
                        res.redirect('/teacher/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                });
            }
        });
    });
});

module.exports = router;
