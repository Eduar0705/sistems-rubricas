const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// ============================================================
// RUTA GET PARA MOSTRAR FORMULARIO
// ============================================================

router.get('/teacher/createrubricas', (req, res) => {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const docenteCedula = req.session.cedula;

    let queryParams = [];

    const queryCarreras = `
            SELECT 
            c.codigo, 
            c.nombre, 
            COUNT(DISTINCT pp.num_semestre) AS duracion_semestres
        FROM carrera c
        INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
        INNER JOIN seccion s ON pp.id = s.id_materia_plan
        INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
        WHERE pd.docente_cedula = ?
        AND c.activo = 1
        ORDER BY nombre
        `;
    queryParams = [docenteCedula];
    const queryTipoRubricas = `
        SELECT 
            id,
            nombre
        FROM tipo_rubrica
        GROUP BY nombre
        ORDER BY nombre
    `;

    connection.query(queryCarreras, queryParams, (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.render("teacher/crearRubrica", {
                datos: req.session,
                title: 'Crear Rúbrica',
                carreras: [],
                currentPage: 'createrubricas',
                mensaje: req.query.mensaje
            });
        }
        connection.query(queryTipoRubricas, (error, tipos_r) => {
            if (error) {
                console.error('Error al obtener tipos de rubrica:', error);
                return res.render("admin/createRubricas", {
                    datos: req.session,
                    title: 'Crear Rúbrica',
                    carreras: carreras,
                    tipos_r: [],
                    currentPage: 'createrubricas',
                    mensaje: req.query.mensaje
                });
            }
            console.log(tipos_r);
            res.render("teacher/crearRubrica", {
                datos: req.session,
                title: 'Crear Rúbrica',
                carreras: carreras,
                tipos_r: tipos_r,
                currentPage: 'createrubricas',
                mensaje: req.query.mensaje
            });
        });
    });
});

// ============================================================
// APIs PARA CARGA JERÁRQUICA (TEACHER) CON VALIDACIÓN DE ROL
// ============================================================

// API: Obtener semestres por carrera
router.get("/api/teacher/semestres/:carrera", (req, res) => {
    if (!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const { carrera } = req.params;
    const esAdmin = req.session.id_rol === 1;

    let query, params;

    if (esAdmin) {
        // Si es admin, muestra todos los semestres
        query = `
            SELECT DISTINCT m.semestre
            FROM materia m
            INNER JOIN seccion s ON m.codigo = s.materia_codigo
            WHERE m.carrera_codigo = ? 
            AND m.activo = TRUE
            AND s.activo = TRUE
            ORDER BY m.semestre
        `;
        params = [carrera];
    } else {
        // Si es docente, solo muestra semestres con permisos
        query = `
            SELECT DISTINCT m.semestre
            FROM materia m
            INNER JOIN seccion s ON m.codigo = s.materia_codigo
            INNER JOIN permisos p ON p.carrera_codigo = m.carrera_codigo 
                AND p.semestre = m.semestre 
                AND p.materia_codigo = m.codigo 
                AND p.seccion_id = s.id
            WHERE m.carrera_codigo = ? 
            AND m.activo = TRUE
            AND s.activo = TRUE
            AND p.docente_cedula = ?
            AND p.activo = TRUE
            ORDER BY m.semestre
        `;
        params = [carrera, req.session.cedula];
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Error al obtener semestres:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        res.json(results.map(r => r.semestre));
    });
});

// API: Obtener materias por carrera y semestre
router.get("/api/teacher/materias/:carrera/:semestre", (req, res) => {
    if (!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const { carrera, semestre } = req.params;
    const esAdmin = req.session.id_rol === 1;

    let query, params;

    if (esAdmin) {
        // Si es admin, muestra todas las materias
        query = `
            SELECT DISTINCT m.codigo, m.nombre, m.semestre, m.creditos
            FROM materia m
            INNER JOIN seccion s ON m.codigo = s.materia_codigo
            WHERE m.carrera_codigo = ? 
            AND m.semestre = ? 
            AND m.activo = TRUE
            AND s.activo = TRUE
            ORDER BY m.nombre
        `;
        params = [carrera, semestre];
    } else {
        // Si es docente, solo muestra materias con permisos
        query = `
            SELECT DISTINCT m.codigo, m.nombre, m.semestre, m.creditos
            FROM materia m
            INNER JOIN seccion s ON m.codigo = s.materia_codigo
            INNER JOIN permisos p ON p.carrera_codigo = m.carrera_codigo 
                AND p.semestre = m.semestre 
                AND p.materia_codigo = m.codigo 
                AND p.seccion_id = s.id
            WHERE m.carrera_codigo = ? 
            AND m.semestre = ? 
            AND m.activo = TRUE
            AND s.activo = TRUE
            AND p.docente_cedula = ?
            AND p.activo = TRUE
            ORDER BY m.nombre
        `;
        params = [carrera, semestre, req.session.cedula];
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Error al obtener materias:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// API: Obtener secciones por materia
router.get("/api/teacher/secciones/:materia", (req, res) => {
    if (!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const { materia } = req.params;
    const esAdmin = req.session.id_rol === 1;

    let query, params;

    if (esAdmin) {
        // Si es admin, muestra todas las secciones
        query = `
            SELECT 
                s.id,
                s.codigo,
                s.lapso_academico,
                s.horario,
                s.aula,
                s.capacidad_maxima,
                d.nombre as docente_nombre,
                d.apellido as docente_apellido
            FROM seccion s
            LEFT JOIN docente d ON s.docente_cedula = d.cedula
            WHERE s.materia_codigo = ? 
            AND s.activo = TRUE
            ORDER BY s.lapso_academico DESC, s.codigo
        `;
        params = [materia];
    } else {
        // Si es docente, solo muestra secciones con permisos
        query = `
            SELECT 
                s.id,
                s.codigo,
                s.lapso_academico,
                s.horario,
                s.aula,
                s.capacidad_maxima
            FROM seccion s
            INNER JOIN permisos p ON p.seccion_id = s.id AND p.materia_codigo = s.materia_codigo
            WHERE s.materia_codigo = ? 
            AND p.docente_cedula = ?
            AND s.activo = TRUE
            AND p.activo = TRUE
            ORDER BY s.lapso_academico DESC, s.codigo
        `;
        params = [materia, req.session.cedula];
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});

// ============================================================
// RUTA POST PARA GUARDAR LA RÚBRICA CON VALIDACIÓN DE PERMISOS
// ============================================================

router.post('/envioRubricaTeacher', (req, res) => {
    let mensaje;

    // Validar sesión
    if (!req.session || !req.session.cedula) {
        mensaje = 'Sesión no válida. Por favor, inicie sesión nuevamente.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const {
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

    // Parse criterios si viene como string
    let criteriosParsed = criterios;
    if (typeof criterios === 'string') {
        try {
            criteriosParsed = JSON.parse(criterios);
        } catch (e) {
            console.error('Error al parsear criterios:', e);
            mensaje = 'Error: Formato de criterios inválido';
            return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }
    }

    // ============================================================
    // VALIDACIONES DEL SERVIDOR
    // ============================================================

    // Validar campos requeridos
    if (!nombre_rubrica || !materia_codigo || !seccion_id || !fecha_evaluacion ||
        !porcentaje_evaluacion || !tipo_evaluacion) {
        mensaje = 'Error: Todos los campos obligatorios deben estar completos';
        return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar porcentaje (mínimo 5%)
    const porcentaje = parseFloat(porcentaje_evaluacion);
    if (isNaN(porcentaje) || porcentaje < 5 || porcentaje > 100) {
        mensaje = 'Error: El porcentaje debe estar entre 5% y 100%';
        return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar criterios
    if (!criteriosParsed || !Array.isArray(criteriosParsed) || criteriosParsed.length === 0) {
        mensaje = 'Error: Debe agregar al menos un criterio de evaluación';
        return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar estructura de criterios y niveles
    let sumaPuntajes = 0;
    for (let i = 0; i < criteriosParsed.length; i++) {
        const criterio = criteriosParsed[i];

        if (!criterio.descripcion || criterio.descripcion.trim() === '') {
            mensaje = `Error: El criterio ${i + 1} necesita una descripción`;
            return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        const puntajeCriterio = parseFloat(criterio.puntaje_maximo);
        if (isNaN(puntajeCriterio) || puntajeCriterio < 1) {
            mensaje = `Error: El criterio ${i + 1} debe tener un puntaje mínimo de 1 punto`;
            return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        sumaPuntajes += puntajeCriterio;

        if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            mensaje = `Error: El criterio ${i + 1} debe tener al menos un nivel de desempeño`;
            return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        for (let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];

            if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                mensaje = `Error: El nivel ${j + 1} del criterio ${i + 1} necesita un nombre`;
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            if (!nivel.descripcion || nivel.descripcion.trim() === '') {
                mensaje = `Error: El nivel "${nivel.nombre_nivel}" necesita una descripción`;
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            const puntajeNivel = parseFloat(nivel.puntaje);
            if (isNaN(puntajeNivel) || puntajeNivel < 0.25) {
                mensaje = `Error: El nivel "${nivel.nombre_nivel}" debe tener un puntaje mínimo de 0.25 puntos`;
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            if (puntajeNivel > puntajeCriterio) {
                mensaje = `Error: El puntaje del nivel "${nivel.nombre_nivel}" (${puntajeNivel}) excede el puntaje máximo del criterio (${puntajeCriterio})`;
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }
        }
    }

    if (sumaPuntajes > porcentaje) {
        mensaje = `Error: La suma de puntajes de los criterios (${sumaPuntajes.toFixed(2)}) excede el porcentaje de evaluación (${porcentaje}%)`;
        return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // ============================================================
    // VERIFICAR PERMISOS SEGÚN EL ROL
    // ============================================================

    const esAdmin = req.session.id_rol === 1;

    if (esAdmin) {
        // Si es admin, solo verificar que la sección exista y esté activa
        const queryVerificar = `
            SELECT id FROM seccion 
            WHERE id = ? AND activo = TRUE
        `;

        connection.query(queryVerificar, [seccion_id], (error, results) => {
            if (error) {
                console.error('Error al verificar sección:', error);
                mensaje = 'Error al verificar la sección';
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            if (results.length === 0) {
                mensaje = 'Error: La sección seleccionada no existe o no está activa';
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            crearRubrica();
        });
    } else {
        // Si es docente, verificar permisos en la tabla permisos
        const queryVerificarPermiso = `
            SELECT p.id 
            FROM permisos p
            INNER JOIN seccion s ON p.seccion_id = s.id
            INNER JOIN materia m ON p.materia_codigo = m.codigo AND s.materia_codigo = m.codigo
            WHERE p.docente_cedula = ? 
            AND p.seccion_id = ?
            AND p.materia_codigo = ?
            AND p.activo = TRUE
            AND s.activo = TRUE
        `;

        connection.query(queryVerificarPermiso, [req.session.cedula, seccion_id, materia_codigo], (error, results) => {
            if (error) {
                console.error('Error al verificar permisos:', error);
                mensaje = 'Error al verificar los permisos';
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            if (results.length === 0) {
                mensaje = 'Error: No tiene permisos para crear rúbricas en esta sección';
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            crearRubrica();
        });
    }

    // ============================================================
    // FUNCIÓN PARA CREAR LA RÚBRICA
    // ============================================================

    function crearRubrica() {
        // Obtener una conexión del pool
        connection.getConnection((err, conn) => {
            if (err) {
                console.error('Error al obtener conexión del pool:', err);
                mensaje = 'Error del servidor al conectar con la base de datos';
                return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Iniciar transacción en la conexión obtenida
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release(); // Liberar la conexión
                    console.error('Error al iniciar transacción:', err);
                    mensaje = 'Error del servidor al iniciar la transacción';
                    return res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                }

                const queryRubrica = `
                    INSERT INTO rubrica_evaluacion
                    (nombre_rubrica, docente_cedula, materia_codigo, seccion_id, fecha_evaluacion,
                    porcentaje_evaluacion, tipo_evaluacion, competencias, instrucciones, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
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

                conn.query(queryRubrica, valuesRubrica, (error, resultRubrica) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release(); // Liberar la conexión
                            console.error('Error al insertar rúbrica:', error);
                            mensaje = 'Error al guardar la rúbrica en la base de datos';
                            res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    const rubricaId = resultRubrica.insertId;
                    console.log('✅ Rúbrica insertada con ID:', rubricaId);

                    let criteriosCompletados = 0;
                    const totalCriterios = criteriosParsed.length;
                    let hayError = false;

                    criteriosParsed.forEach((criterio, indexCriterio) => {
                        if (hayError) return;

                        const queryCriterio = `
                            INSERT INTO criterio_evaluacion
                            (rubrica_id, descripcion, puntaje_maximo, orden)
                            VALUES (?, ?, ?, ?)
                        `;

                        const valuesCriterio = [
                            rubricaId,
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
                                    console.error('Error al insertar criterio:', error);
                                    mensaje = `Error al guardar el criterio: ${criterio.descripcion}`;
                                    res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            const criterioId = resultCriterio.insertId;

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
                                                console.error('Error al insertar nivel:', error);
                                                mensaje = `Error al guardar el nivel: ${nivel.nombre_nivel}`;
                                                res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                                            });
                                        }

                                        nivelesCompletados++;

                                        if (nivelesCompletados === totalNiveles) {
                                            criteriosCompletados++;

                                            if (criteriosCompletados === totalCriterios && !hayError) {
                                                finalizarTransaccion();
                                            }
                                        }
                                    });
                                });
                            } else {
                                criteriosCompletados++;
                                if (criteriosCompletados === totalCriterios && !hayError) {
                                    finalizarTransaccion();
                                }
                            }
                        });
                    });

                    function finalizarTransaccion() {
                        conn.commit((err) => {
                            if (err) {
                                return conn.rollback(() => {
                                    conn.release(); // Liberar la conexión
                                    console.error('Error al confirmar transacción:', err);
                                    mensaje = 'Error al confirmar la transacción';
                                    res.redirect('/teacher/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            conn.release(); // Liberar la conexión exitosamente
                            console.log('✅ Rúbrica creada exitosamente con ID:', rubricaId);
                            console.log('   - Rol del usuario:', esAdmin ? 'Admin' : 'Docente');
                            console.log('   - Criterios:', totalCriterios);
                            console.log('   - Puntajes:', sumaPuntajes.toFixed(2));

                            mensaje = '¡Rúbrica creada exitosamente!';
                            res.redirect('/teacher/rubricas?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }
                });
            });
        });
    }
});

module.exports = router;
