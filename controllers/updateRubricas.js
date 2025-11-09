const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// Actualizar rubrica
router.post('/updateRubrica', (req, res) => {
    console.log('📝 POST /updateRubrica recibido');
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
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
            console.error('Error al parsear criterios:', e);
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

    // Validar permisos por rol
    if(req.session.id_rol === 3) {
        mensaje = 'No tienes permisos para editar rúbricas';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    console.log('✅ Validaciones pasadas, iniciando transacción...');

    // Iniciar transacción
    connection.beginTransaction((err) => {
        if(err) {
            console.error('Error al iniciar transacción:', err);
            mensaje = 'Error del servidor al iniciar transacción';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // 1. Actualizar la rúbrica principal
        let queryUpdateRubrica;
        let valuesUpdateRubrica;

        if(req.session.id_rol === 1) {
            // Administrador puede editar cualquier rúbrica
            queryUpdateRubrica = `
                UPDATE rubrica_evaluacion
                SET nombre_rubrica = ?, materia_codigo = ?, seccion_id = ?, fecha_evaluacion = ?,
                    porcentaje_evaluacion = ?, tipo_evaluacion = ?, competencias = ?, instrucciones = ?
                WHERE id = ?
            `;

            valuesUpdateRubrica = [
                nombre_rubrica,
                materia_codigo,
                seccion_id,
                fecha_evaluacion,
                porcentaje_evaluacion,
                tipo_evaluacion,
                competencias || null,
                instrucciones || null,
                id
            ];
        } else {
            // Docente solo puede editar sus propias rúbricas
            queryUpdateRubrica = `
                UPDATE rubrica_evaluacion
                SET nombre_rubrica = ?, materia_codigo = ?, seccion_id = ?, fecha_evaluacion = ?,
                    porcentaje_evaluacion = ?, tipo_evaluacion = ?, competencias = ?, instrucciones = ?
                WHERE id = ? AND docente_cedula = ?
            `;

            valuesUpdateRubrica = [
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
        }

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

            console.log('✅ Rúbrica principal actualizada');

            // 2. Obtener criterios existentes
            const queryGetCriterios = `SELECT id FROM criterio_evaluacion WHERE rubrica_id = ?`;
            connection.query(queryGetCriterios, [id], (error, criteriosExistentes) => {
                if(error) {
                    return connection.rollback(() => {
                        console.error('Error al obtener criterios:', error);
                        mensaje = 'Error al obtener criterios existentes';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                procesarCriterios(criteriosExistentes);
            });
        });

        // 3. Procesar criterios
        function procesarCriterios(criteriosExistentes) {
            const criteriosExistentesIds = criteriosExistentes.map(c => c.id);
            const criteriosParsedIds = criteriosParsed.filter(c => c.id).map(c => parseInt(c.id));
            const criteriosAEliminar = criteriosExistentesIds.filter(id => !criteriosParsedIds.includes(id));
            
            let operacionesPendientes = criteriosParsed.length + criteriosAEliminar.length;
            let operacionesCompletadas = 0;
            let errorOcurrido = false;

            if(operacionesPendientes === 0) {
                procesarNiveles();
                return;
            }

            function verificarCompletado() {
                operacionesCompletadas++;
                console.log(`Criterios: ${operacionesCompletadas}/${operacionesPendientes}`);
                if(operacionesCompletadas >= operacionesPendientes && !errorOcurrido) {
                    procesarNiveles();
                }
            }

            function manejarError(error, msg) {
                if(!errorOcurrido) {
                    errorOcurrido = true;
                    return connection.rollback(() => {
                        console.error(msg, error);
                        mensaje = msg;
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }
            }

            // Eliminar criterios y sus niveles
            criteriosAEliminar.forEach(criterioId => {
                connection.query('DELETE FROM nivel_desempeno WHERE criterio_id = ?', [criterioId], (error) => {
                    if(error) return manejarError(error, 'Error al eliminar niveles');
                    
                    connection.query('DELETE FROM criterio_evaluacion WHERE id = ?', [criterioId], (error) => {
                        if(error) return manejarError(error, 'Error al eliminar criterio');
                        verificarCompletado();
                    });
                });
            });

            // Actualizar o insertar criterios
            criteriosParsed.forEach((criterio, index) => {
                const criterioId = criterio.id ? parseInt(criterio.id) : null;
                
                if(criterioId && criteriosExistentesIds.includes(criterioId)) {
                    // Actualizar
                    const query = `UPDATE criterio_evaluacion SET descripcion = ?, puntaje_maximo = ?, orden = ? WHERE id = ?`;
                    connection.query(query, [criterio.descripcion, criterio.puntaje_maximo, criterio.orden || index + 1, criterioId], (error) => {
                        if(error) return manejarError(error, 'Error al actualizar criterio');
                        verificarCompletado();
                    });
                } else {
                    // Insertar
                    const query = `INSERT INTO criterio_evaluacion (rubrica_id, descripcion, puntaje_maximo, orden) VALUES (?, ?, ?, ?)`;
                    connection.query(query, [id, criterio.descripcion, criterio.puntaje_maximo, criterio.orden || index + 1], (error, result) => {
                        if(error) return manejarError(error, 'Error al insertar criterio');
                        criterio.id = result.insertId;
                        verificarCompletado();
                    });
                }
            });
        }

        // 4. Procesar niveles
        function procesarNiveles() {
            console.log('🔄 Procesando niveles...');
            
            const queryGetNiveles = `
                SELECT nd.id, nd.criterio_id, nd.nombre_nivel 
                FROM nivel_desempeno nd
                INNER JOIN criterio_evaluacion ce ON nd.criterio_id = ce.id
                WHERE ce.rubrica_id = ?
            `;
            
            connection.query(queryGetNiveles, [id], (error, nivelesExistentes) => {
                if(error) {
                    return connection.rollback(() => {
                        console.error('Error al obtener niveles:', error);
                        mensaje = 'Error al obtener niveles existentes';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                const nivelesMap = new Map();
                nivelesExistentes.forEach(n => {
                    nivelesMap.set(`${n.criterio_id}-${n.nombre_nivel}`, n);
                });

                const nivelesAProcesar = [];
                criteriosParsed.forEach(criterio => {
                    if(criterio.niveles && Array.isArray(criterio.niveles)) {
                        criterio.niveles.forEach(nivel => {
                            nivelesAProcesar.push({
                                criterio_id: criterio.id,
                                ...nivel
                            });
                        });
                    }
                });

                const nivelesAEliminar = [];
                nivelesExistentes.forEach(nivelExistente => {
                    const encontrado = nivelesAProcesar.some(n => 
                        n.criterio_id == nivelExistente.criterio_id && 
                        n.nombre_nivel === nivelExistente.nombre_nivel
                    );
                    if(!encontrado) {
                        nivelesAEliminar.push(nivelExistente.id);
                    }
                });

                let operacionesPendientes = nivelesAProcesar.length + nivelesAEliminar.length;
                let operacionesCompletadas = 0;
                let errorOcurrido = false;

                if(operacionesPendientes === 0) {
                    finalizarTransaccion();
                    return;
                }

                function verificarCompletado() {
                    operacionesCompletadas++;
                    console.log(`Niveles: ${operacionesCompletadas}/${operacionesPendientes}`);
                    if(operacionesCompletadas >= operacionesPendientes && !errorOcurrido) {
                        finalizarTransaccion();
                    }
                }

                function manejarError(error, msg) {
                    if(!errorOcurrido) {
                        errorOcurrido = true;
                        return connection.rollback(() => {
                            console.error(msg, error);
                            mensaje = msg;
                            res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }
                }

                // Eliminar niveles
                nivelesAEliminar.forEach(nivelId => {
                    connection.query('DELETE FROM nivel_desempeno WHERE id = ?', [nivelId], (error) => {
                        if(error) return manejarError(error, 'Error al eliminar nivel');
                        verificarCompletado();
                    });
                });

                // Insertar o actualizar niveles
                nivelesAProcesar.forEach((nivel, index) => {
                    const key = `${nivel.criterio_id}-${nivel.nombre_nivel}`;
                    
                    if(nivelesMap.has(key)) {
                        // Actualizar
                        const nivelExistente = nivelesMap.get(key);
                        const query = `UPDATE nivel_desempeno SET descripcion = ?, puntaje = ?, orden = ? WHERE id = ?`;
                        connection.query(query, [nivel.descripcion, nivel.puntaje, nivel.orden || index + 1, nivelExistente.id], (error) => {
                            if(error) return manejarError(error, 'Error al actualizar nivel');
                            verificarCompletado();
                        });
                    } else {
                        // Insertar
                        const query = `INSERT INTO nivel_desempeno (criterio_id, nombre_nivel, descripcion, puntaje, orden) VALUES (?, ?, ?, ?, ?)`;
                        connection.query(query, [nivel.criterio_id, nivel.nombre_nivel, nivel.descripcion, nivel.puntaje, nivel.orden || index + 1], (error) => {
                            if(error) return manejarError(error, 'Error al insertar nivel');
                            verificarCompletado();
                        });
                    }
                });
            });
        }

        // 5. Finalizar transacción
        function finalizarTransaccion() {
            connection.commit((err) => {
                if(err) {
                    return connection.rollback(() => {
                        console.error('Error al confirmar transacción:', err);
                        mensaje = 'Error al confirmar la transacción';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                console.log('✅ Rúbrica actualizada exitosamente con ID:', id);
                mensaje = 'Rúbrica actualizada exitosamente';
                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            });
        }
    });
});

module.exports = router;
