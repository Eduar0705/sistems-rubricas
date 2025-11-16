const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// ============================================================
// ACTUALIZAR RÚBRICA
// ============================================================

router.post('/updateRubrica', (req, res) => {
    console.log('📝 POST /updateRubrica recibido');
    
    let mensaje;

    // Validar sesión
    if(!req.session || !req.session.cedula) {
        mensaje = 'Sesión no válida. Por favor, inicie sesión nuevamente.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const { 
        id, 
        nombre_rubrica, 
        materia_codigo, 
        seccion_id, 
        fecha_evaluacion,
        porcentaje_evaluacion, 
        tipo_evaluacion, 
        competencias, 
        instrucciones, 
        criterios
    } = req.body;

    console.log('Datos recibidos:', { id, nombre_rubrica, materia_codigo, seccion_id });
    console.log('Criterios recibidos:', criterios);

    // Parse criterios si viene como string
    let criteriosParsed = criterios;
    if(typeof criterios === 'string') {
        try {
            criteriosParsed = JSON.parse(criterios);
        } catch(e) {
            console.error('Error al parsear criterios:', e);
            mensaje = 'Error: Formato de criterios inválido';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }
    }

    // ============================================================
    // VALIDACIONES DEL SERVIDOR
    // ============================================================

    // Validar campos requeridos
    if(!id || !nombre_rubrica || !materia_codigo || !seccion_id || !fecha_evaluacion || 
       !porcentaje_evaluacion || !tipo_evaluacion) {
        mensaje = 'Error: Todos los campos obligatorios deben estar completos';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar porcentaje (mínimo 5%)
    const porcentaje = parseFloat(porcentaje_evaluacion);
    if(isNaN(porcentaje) || porcentaje < 5 || porcentaje > 100) {
        mensaje = 'Error: El porcentaje debe estar entre 5% y 100%';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar criterios
    if(!criteriosParsed || !Array.isArray(criteriosParsed) || criteriosParsed.length === 0) {
        mensaje = 'Error: Debe agregar al menos un criterio de evaluación';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar estructura de criterios y niveles
    let sumaPuntajes = 0;
    for(let i = 0; i < criteriosParsed.length; i++) {
        const criterio = criteriosParsed[i];
        
        if(!criterio.descripcion || criterio.descripcion.trim() === '') {
            mensaje = `Error: El criterio ${i + 1} necesita una descripción`;
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }
        
        const puntajeCriterio = parseFloat(criterio.puntaje_maximo);
        if(isNaN(puntajeCriterio) || puntajeCriterio < 1) {
            mensaje = `Error: El criterio ${i + 1} debe tener un puntaje mínimo de 1 punto`;
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }
        
        sumaPuntajes += puntajeCriterio;
        
        if(!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            mensaje = `Error: El criterio ${i + 1} debe tener al menos un nivel de desempeño`;
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }
        
        for(let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];
            
            if(!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                mensaje = `Error: El nivel ${j + 1} del criterio ${i + 1} necesita un nombre`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }
            
            if(!nivel.descripcion || nivel.descripcion.trim() === '') {
                mensaje = `Error: El nivel "${nivel.nombre_nivel}" necesita una descripción`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }
            
            const puntajeNivel = parseFloat(nivel.puntaje);
            if(isNaN(puntajeNivel) || puntajeNivel < 0.25) {
                mensaje = `Error: El nivel "${nivel.nombre_nivel}" debe tener un puntaje mínimo de 0.25 puntos`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }
            
            if(puntajeNivel > puntajeCriterio) {
                mensaje = `Error: El puntaje del nivel "${nivel.nombre_nivel}" (${puntajeNivel}) excede el puntaje máximo del criterio (${puntajeCriterio})`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }
        }
    }

    if(sumaPuntajes > porcentaje) {
        mensaje = `Error: La suma de puntajes de los criterios (${sumaPuntajes.toFixed(2)}) excede el porcentaje de evaluación (${porcentaje}%)`;
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // ============================================================
    // VERIFICAR PERMISOS SEGÚN EL ROL
    // ============================================================
    
    const esAdmin = req.session.id_rol === 1;
    
    let queryVerificar;
    let paramsVerificar;
    
    if(esAdmin) {
        // Admin puede editar cualquier rúbrica
        queryVerificar = `SELECT id FROM rubrica_evaluacion WHERE id = ? AND activo = TRUE`;
        paramsVerificar = [id];
    } else {
        // Docente solo puede editar sus propias rúbricas
        queryVerificar = `
            SELECT r.id 
            FROM rubrica_evaluacion r
            INNER JOIN permisos p ON p.materia_codigo = r.materia_codigo 
                AND p.seccion_id = r.seccion_id
            WHERE r.id = ? 
            AND r.docente_cedula = ?
            AND p.docente_cedula = ?
            AND r.activo = TRUE
            AND p.activo = TRUE
        `;
        paramsVerificar = [id, req.session.cedula, req.session.cedula];
    }

    connection.query(queryVerificar, paramsVerificar, (error, results) => {
        if(error) {
            console.error('Error al verificar permisos:', error);
            mensaje = 'Error al verificar permisos';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        if(results.length === 0) {
            mensaje = 'Error: No tiene permisos para editar esta rúbrica o la rúbrica no existe';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        actualizarRubrica();
    });

    // ============================================================
    // FUNCIÓN PARA ACTUALIZAR LA RÚBRICA
    // ============================================================

    function actualizarRubrica() {
        const totalCriterios = criteriosParsed.length;

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
                WHERE id = ?
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
                id
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
                        mensaje = 'Rúbrica no encontrada';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                console.log('✅ Rúbrica principal actualizada');

                // 2. Eliminar todos los criterios y niveles existentes
                const queryDeleteNiveles = `
                    DELETE nd FROM nivel_desempeno nd
                    INNER JOIN criterio_evaluacion ce ON nd.criterio_id = ce.id
                    WHERE ce.rubrica_id = ?
                `;

                connection.query(queryDeleteNiveles, [id], (error) => {
                    if(error) {
                        return connection.rollback(() => {
                            console.error('Error al eliminar niveles:', error);
                            mensaje = 'Error al eliminar niveles existentes';
                            res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    console.log('✅ Niveles eliminados');

                    const queryDeleteCriterios = `DELETE FROM criterio_evaluacion WHERE rubrica_id = ?`;

                    connection.query(queryDeleteCriterios, [id], (error) => {
                        if(error) {
                            return connection.rollback(() => {
                                console.error('Error al eliminar criterios:', error);
                                mensaje = 'Error al eliminar criterios existentes';
                                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        console.log('✅ Criterios eliminados');

                        // 3. Insertar nuevos criterios y niveles
                        let criteriosCompletados = 0;
                        const totalCriterios = criteriosParsed.length;
                        let hayError = false;

                        criteriosParsed.forEach((criterio, indexCriterio) => {
                            if(hayError) return;

                            const queryCriterio = `
                                INSERT INTO criterio_evaluacion
                                (rubrica_id, descripcion, puntaje_maximo, orden)
                                VALUES (?, ?, ?, ?)
                            `;

                            const valuesCriterio = [
                                id,
                                criterio.descripcion.trim(),
                                parseFloat(criterio.puntaje_maximo),
                                parseInt(criterio.orden) || (indexCriterio + 1)
                            ];

                            connection.query(queryCriterio, valuesCriterio, (error, resultCriterio) => {
                                if(hayError) return;

                                if(error) {
                                    hayError = true;
                                    return connection.rollback(() => {
                                        console.error('Error al insertar criterio:', error);
                                        mensaje = `Error al guardar el criterio: ${criterio.descripcion}`;
                                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                    });
                                }

                                const criterioId = resultCriterio.insertId;
                                console.log('✅ Criterio insertado con ID:', criterioId);

                                if(criterio.niveles && criterio.niveles.length > 0) {
                                    let nivelesCompletados = 0;
                                    const totalNiveles = criterio.niveles.length;

                                    criterio.niveles.forEach((nivel, indexNivel) => {
                                        if(hayError) return;

                                        const queryNivel = `
                                            INSERT INTO nivel_desempeno
                                            (criterio_id, nombre_nivel, descripcion, puntaje, orden)
                                            VALUES (?, ?, ?, ?, ?)
                                        `;

                                        const valuesNivel = [
                                            criterioId,
                                            nivel.nombre_nivel.trim(),
                                            nivel.descripcion.trim(),
                                            parseFloat(nivel.puntaje),
                                            parseInt(nivel.orden) || (indexNivel + 1)
                                        ];

                                        connection.query(queryNivel, valuesNivel, (error) => {
                                            if(hayError) return;

                                            if(error) {
                                                hayError = true;
                                                return connection.rollback(() => {
                                                    console.error('Error al insertar nivel:', error);
                                                    mensaje = `Error al guardar el nivel: ${nivel.nombre_nivel}`;
                                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                                });
                                            }

                                            console.log('✅ Nivel insertado:', nivel.nombre_nivel);
                                            nivelesCompletados++;

                                            if(nivelesCompletados === totalNiveles) {
                                                criteriosCompletados++;
                                                console.log(`Criterio ${criteriosCompletados}/${totalCriterios} completado`);

                                                if(criteriosCompletados === totalCriterios && !hayError) {
                                                    finalizarTransaccion();
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    criteriosCompletados++;

                                    if(criteriosCompletados === totalCriterios && !hayError) {
                                        finalizarTransaccion();
                                    }
                                }
                            });
                        });
                    });
                });
            });

            // ============================================================
            // FUNCIÓN PARA FINALIZAR LA TRANSACCIÓN
            // ============================================================

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
                    console.log('   - Rol del usuario:', esAdmin ? 'Admin' : 'Docente');
                    console.log('   - Criterios:', totalCriterios);
                    console.log('   - Puntajes:', sumaPuntajes.toFixed(2));

                    mensaje = '¡Rúbrica actualizada exitosamente!';
                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                });
            }
        });
    }
});

module.exports = router;