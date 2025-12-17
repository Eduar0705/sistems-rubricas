const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// ============================================================
// RUTA: VERIFICAR SI UNA RÚBRICA TIENE EVALUACIONES
// ============================================================

router.get('/rubricas/tiene-evaluaciones/:id', (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        return res.status(401).json({ success: false, message: 'Por favor, inicia sesión para acceder a esta página.' });
    }

    const rubricaId = req.params.id;

    if (!rubricaId) {
        return res.json({ success: false, message: 'ID de rúbrica no proporcionado' });
    }

    const query = `
        SELECT COUNT(*) as count 
        FROM evaluacion_estudiante
        WHERE rubrica_id = ?
    `;

    connection.query(query, [rubricaId], (error, results) => {
        if (error) {
            console.error('Error al verificar evaluaciones:', error);
            return res.json({ success: false, error: error.message });
        }

        const tieneEvaluaciones = results[0].count > 0;
        res.json({
            success: true,
            tieneEvaluaciones,
            cantidadEvaluaciones: results[0].count
        });
    });
});

// ============================================================
// RUTA: ACTUALIZAR RÚBRICA (POST)
// ============================================================

router.post('/updateRubrica', (req, res) => {
    console.log('📝 POST /updateRubrica recibido');

    let mensaje;

    // ============================================================
    // 1. VALIDAR SESIÓN
    // ============================================================

    if (!req.session || !req.session.cedula) {
        mensaje = 'Sesión no válida. Por favor, inicie sesión nuevamente.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // ============================================================
    // 2. EXTRAER Y PARSEAR DATOS
    // ============================================================

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
        criterios,
        solo_basico // Indica si solo se editan campos básicos
    } = req.body;

    console.log('📊 Datos recibidos:', {
        id,
        nombre_rubrica,
        materia_codigo,
        seccion_id,
        solo_basico: solo_basico || 'false'
    });

    // Parse criterios si viene como string
    let criteriosParsed = null;
    if (criterios) {
        if (typeof criterios === 'string') {
            try {
                criteriosParsed = JSON.parse(criterios);
            } catch (e) {
                console.error('❌ Error al parsear criterios:', e);
                mensaje = 'Error: Formato de criterios inválido';
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }
        } else {
            criteriosParsed = criterios;
        }
    }

    console.log('📋 Criterios recibidos:', criteriosParsed ? criteriosParsed.length : 0);

    // ============================================================
    // 3. VALIDACIONES BÁSICAS
    // ============================================================

    if (!id || !nombre_rubrica || !materia_codigo || !seccion_id || !fecha_evaluacion ||
        !porcentaje_evaluacion || !tipo_evaluacion) {
        mensaje = 'Error: Todos los campos obligatorios deben estar completos';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar porcentaje (mínimo 5%)
    const porcentaje = parseFloat(porcentaje_evaluacion);
    if (isNaN(porcentaje) || porcentaje < 5 || porcentaje > 100) {
        mensaje = 'Error: El porcentaje debe estar entre 5% y 100%';
        return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // ============================================================
    // 4. VALIDAR CRITERIOS (SOLO SI NO ES EDICIÓN BÁSICA)
    // ============================================================

    if (solo_basico !== 'true') {
        if (!criteriosParsed || !Array.isArray(criteriosParsed) || criteriosParsed.length === 0) {
            mensaje = 'Error: Debe agregar al menos un criterio de evaluación';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // Validar estructura de criterios y niveles
        let sumaPuntajes = 0;

        for (let i = 0; i < criteriosParsed.length; i++) {
            const criterio = criteriosParsed[i];

            // Validar descripción
            if (!criterio.descripcion || criterio.descripcion.trim() === '') {
                mensaje = `Error: El criterio ${i + 1} necesita una descripción`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Validar puntaje del criterio
            const puntajeCriterio = parseFloat(criterio.puntaje_maximo);
            if (isNaN(puntajeCriterio) || puntajeCriterio < 1) {
                mensaje = `Error: El criterio ${i + 1} debe tener un puntaje mínimo de 1 punto`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            sumaPuntajes += puntajeCriterio;

            // Validar que tenga niveles
            if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
                mensaje = `Error: El criterio ${i + 1} debe tener al menos un nivel de desempeño`;
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Validar cada nivel
            for (let j = 0; j < criterio.niveles.length; j++) {
                const nivel = criterio.niveles[j];

                if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                    mensaje = `Error: El nivel ${j + 1} del criterio ${i + 1} necesita un nombre`;
                    return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                }

                if (!nivel.descripcion || nivel.descripcion.trim() === '') {
                    mensaje = `Error: El nivel "${nivel.nombre_nivel}" necesita una descripción`;
                    return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                }

                const puntajeNivel = parseFloat(nivel.puntaje);
                if (isNaN(puntajeNivel) || puntajeNivel < 0.25) {
                    mensaje = `Error: El nivel "${nivel.nombre_nivel}" debe tener un puntaje mínimo de 0.25 puntos`;
                    return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                }

                if (puntajeNivel > puntajeCriterio) {
                    mensaje = `Error: El puntaje del nivel "${nivel.nombre_nivel}" (${puntajeNivel}) excede el puntaje máximo del criterio (${puntajeCriterio})`;
                    return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                }
            }
        }

        // Validar suma total de puntajes
        if (sumaPuntajes > porcentaje) {
            mensaje = `Error: La suma de puntajes de los criterios (${sumaPuntajes.toFixed(2)}) excede el porcentaje de evaluación (${porcentaje}%)`;
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }
    }

    // ============================================================
    // 5. VERIFICAR PERMISOS SEGÚN EL ROL
    // ============================================================

    const esAdmin = req.session.id_rol === 1;

    let queryVerificar;
    let paramsVerificar;

    if (esAdmin) {
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
        if (error) {
            console.error('❌ Error al verificar permisos:', error);
            mensaje = 'Error al verificar permisos';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        if (results.length === 0) {
            mensaje = 'Error: No tiene permisos para editar esta rúbrica o la rúbrica no existe';
            return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        console.log('✅ Permisos verificados');

        // Continuar con la verificación y actualización
        verificarEvaluacionesYActualizar();
    });

    // ============================================================
    // 6. VERIFICAR SI TIENE EVALUACIONES Y ACTUALIZAR
    // ============================================================

    function verificarEvaluacionesYActualizar() {
        const queryVerificarEvaluaciones = `
            SELECT COUNT(*) as count 
            FROM evaluacion_estudiante
            WHERE rubrica_id = ?
        `;

        connection.query(queryVerificarEvaluaciones, [id], (error, results) => {
            if (error) {
                console.error('❌ Error al verificar evaluaciones:', error);
                mensaje = 'Error al verificar evaluaciones';
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            const tieneEvaluaciones = results[0].count > 0;
            console.log(`📊 Rúbrica tiene ${results[0].count} evaluaciones registradas`);

            // Si tiene evaluaciones pero se intenta editar criterios, denegar
            if (tieneEvaluaciones && solo_basico !== 'true') {
                mensaje = 'Error: Esta rúbrica tiene evaluaciones registradas. Solo puede editar información básica (nombre, fecha, competencias, etc.).';
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Decidir tipo de actualización
            if (solo_basico === 'true' || tieneEvaluaciones) {
                console.log('🔧 Modo: Actualización de información básica');
                actualizarInformacionBasica();
            } else {
                console.log('🔧 Modo: Actualización completa (incluyendo criterios)');
                actualizarRubricaCompleta();
            }
        });
    }

    // ============================================================
    // 7. ACTUALIZAR SOLO INFORMACIÓN BÁSICA
    // ============================================================

    function actualizarInformacionBasica() {
        const queryUpdateBasico = `
            UPDATE rubrica_evaluacion
            SET nombre_rubrica = ?, 
                materia_codigo = ?, 
                seccion_id = ?, 
                fecha_evaluacion = ?,
                porcentaje_evaluacion = ?, 
                tipo_evaluacion = ?, 
                competencias = ?, 
                instrucciones = ?
            WHERE id = ?
        `;

        const valuesUpdateBasico = [
            nombre_rubrica.trim(),
            materia_codigo,
            seccion_id,
            fecha_evaluacion,
            porcentaje_evaluacion,
            tipo_evaluacion,
            competencias ? competencias.trim() : null,
            instrucciones ? instrucciones.trim() : null,
            id
        ];

        connection.query(queryUpdateBasico, valuesUpdateBasico, (error, result) => {
            if (error) {
                console.error('❌ Error al actualizar información básica:', error);
                mensaje = 'Error al actualizar la rúbrica';
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            if (result.affectedRows === 0) {
                mensaje = 'Rúbrica no encontrada';
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            console.log('✅ Información básica actualizada exitosamente');
            mensaje = '¡Información básica actualizada exitosamente! Los criterios no se modificaron porque la rúbrica tiene evaluaciones registradas.';
            res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
        });
    }

    // ============================================================
    // 8. ACTUALIZAR RÚBRICA COMPLETA (SIN EVALUACIONES)
    // ============================================================

    function actualizarRubricaCompleta() {
        const totalCriterios = criteriosParsed.length;
        let sumaPuntajes = 0;
        criteriosParsed.forEach(c => sumaPuntajes += parseFloat(c.puntaje_maximo));

        // Obtener una conexión del pool
        connection.getConnection((err, conn) => {
            if (err) {
                console.error('❌ Error al obtener conexión del pool:', err);
                mensaje = 'Error del servidor al conectar con la base de datos';
                return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Iniciar transacción en la conexión obtenida
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release(); // Liberar la conexión
                    console.error('❌ Error al iniciar transacción:', err);
                    mensaje = 'Error del servidor al iniciar transacción';
                    return res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                }

                console.log('🔄 Transacción iniciada');

                // PASO 1: Actualizar la rúbrica principal
                const queryUpdateRubrica = `
                    UPDATE rubrica_evaluacion
                    SET nombre_rubrica = ?, 
                        materia_codigo = ?, 
                        seccion_id = ?, 
                        fecha_evaluacion = ?,
                        porcentaje_evaluacion = ?, 
                        tipo_evaluacion = ?, 
                        competencias = ?, 
                        instrucciones = ?
                    WHERE id = ?
                `;

                const valuesUpdateRubrica = [
                    nombre_rubrica.trim(),
                    materia_codigo,
                    seccion_id,
                    fecha_evaluacion,
                    porcentaje_evaluacion,
                    tipo_evaluacion,
                    competencias ? competencias.trim() : null,
                    instrucciones ? instrucciones.trim() : null,
                    id
                ];

                conn.query(queryUpdateRubrica, valuesUpdateRubrica, (error, resultRubrica) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release(); // Liberar la conexión
                            console.error('❌ Error al actualizar rúbrica:', error);
                            mensaje = 'Error al actualizar la rúbrica';
                            res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    if (resultRubrica.affectedRows === 0) {
                        return conn.rollback(() => {
                            conn.release(); // Liberar la conexión
                            mensaje = 'Rúbrica no encontrada';
                            res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    console.log('✅ Rúbrica principal actualizada');

                    // PASO 2: Eliminar niveles existentes
                    const queryDeleteNiveles = `
                        DELETE nd FROM nivel_desempeno nd
                        INNER JOIN criterio_evaluacion ce ON nd.criterio_id = ce.id
                        WHERE ce.rubrica_id = ?
                    `;

                    conn.query(queryDeleteNiveles, [id], (error) => {
                        if (error) {
                            return conn.rollback(() => {
                                conn.release(); // Liberar la conexión
                                console.error('❌ Error al eliminar niveles:', error);
                                mensaje = 'Error al eliminar niveles existentes';
                                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        console.log('✅ Niveles eliminados');

                        // PASO 3: Eliminar criterios existentes
                        const queryDeleteCriterios = `
                            DELETE FROM criterio_evaluacion 
                            WHERE rubrica_id = ?
                        `;

                        conn.query(queryDeleteCriterios, [id], (error) => {
                            if (error) {
                                return conn.rollback(() => {
                                    conn.release(); // Liberar la conexión
                                    console.error('❌ Error al eliminar criterios:', error);
                                    mensaje = 'Error al eliminar criterios existentes';
                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            console.log('✅ Criterios eliminados');

                            // PASO 4: Insertar nuevos criterios y niveles
                            insertarNuevosCriteriosYNiveles();
                        });
                    });
                });

                // ============================================================
                // FUNCIÓN: INSERTAR NUEVOS CRITERIOS Y NIVELES
                // ============================================================

                function insertarNuevosCriteriosYNiveles() {
                    let criteriosCompletados = 0;
                    let hayError = false;

                    if (criteriosParsed.length === 0) {
                        return finalizarTransaccion();
                    }

                    criteriosParsed.forEach((criterio, indexCriterio) => {
                        if (hayError) return;

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

                        conn.query(queryCriterio, valuesCriterio, (error, resultCriterio) => {
                            if (hayError) return;

                            if (error) {
                                hayError = true;
                                return conn.rollback(() => {
                                    conn.release(); // Liberar la conexión
                                    console.error('❌ Error al insertar criterio:', error);
                                    mensaje = `Error al guardar el criterio: ${criterio.descripcion}`;
                                    res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            const criterioId = resultCriterio.insertId;
                            console.log(`✅ Criterio ${indexCriterio + 1} insertado con ID: ${criterioId}`);

                            // Insertar niveles del criterio
                            if (criterio.niveles && criterio.niveles.length > 0) {
                                let nivelesCompletados = 0;
                                const totalNiveles = criterio.niveles.length;

                                criterio.niveles.forEach((nivel, indexNivel) => {
                                    if (hayError) return;

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

                                    conn.query(queryNivel, valuesNivel, (error) => {
                                        if (hayError) return;

                                        if (error) {
                                            hayError = true;
                                            return conn.rollback(() => {
                                                conn.release(); // Liberar la conexión
                                                console.error('❌ Error al insertar nivel:', error);
                                                mensaje = `Error al guardar el nivel: ${nivel.nombre_nivel}`;
                                                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                                            });
                                        }

                                        console.log(`  ✅ Nivel "${nivel.nombre_nivel}" insertado`);
                                        nivelesCompletados++;

                                        if (nivelesCompletados === totalNiveles) {
                                            criteriosCompletados++;
                                            console.log(`📊 Progreso: ${criteriosCompletados}/${totalCriterios} criterios completados`);

                                            if (criteriosCompletados === totalCriterios && !hayError) {
                                                finalizarTransaccion();
                                            }
                                        }
                                    });
                                });
                            } else {
                                // Criterio sin niveles (no debería pasar por validación)
                                criteriosCompletados++;

                                if (criteriosCompletados === totalCriterios && !hayError) {
                                    finalizarTransaccion();
                                }
                            }
                        });
                    });
                }

                // ============================================================
                // FUNCIÓN: FINALIZAR TRANSACCIÓN
                // ============================================================

                function finalizarTransaccion() {
                    conn.commit((err) => {
                        if (err) {
                            return conn.rollback(() => {
                                conn.release(); // Liberar la conexión
                                console.error('❌ Error al confirmar transacción:', err);
                                mensaje = 'Error al confirmar la transacción';
                                res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        conn.release(); // Liberar la conexión exitosamente
                        console.log('====================================');
                        console.log('✅ RÚBRICA ACTUALIZADA EXITOSAMENTE');
                        console.log('====================================');
                        console.log(`   📝 ID: ${id}`);
                        console.log(`   👤 Usuario: ${esAdmin ? 'Administrador' : 'Docente'}`);
                        console.log(`   📊 Criterios: ${totalCriterios}`);
                        console.log(`   💯 Puntaje total: ${sumaPuntajes.toFixed(2)}/${porcentaje}%`);
                        console.log('====================================');

                        mensaje = '¡Rúbrica actualizada exitosamente!';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }
            });
        });
    }
});

module.exports = router;