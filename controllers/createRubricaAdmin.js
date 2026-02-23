const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// ============================================================
// RUTA PRINCIPAL PARA CREAR RÚBRICAS
// ============================================================

router.get("/admin/createrubricas", (req, res) => {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Query para obtener carreras activas
    const queryCarreras = `
        SELECT 
            c.codigo, 
            c.nombre, 
            COUNT(DISTINCT pp.num_semestre) AS duracion_semestres
        FROM carrera c
        INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
        WHERE c.activo = 1
        ORDER BY nombre
    `;

    conexion.query(queryCarreras, (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.render("admin/createRubricas", {
                datos: req.session,
                title: 'Crear Rúbrica',
                carreras: [],
                currentPage: 'createrubricas',
                mensaje: req.query.mensaje
            });
        }

        res.render("admin/createRubricas", {
            datos: req.session,
            title: 'Crear Rúbrica',
            carreras: carreras,
            currentPage: 'createrubricas',
            mensaje: req.query.mensaje
        });
    });
});

// ============================================================
// APIs PARA CARGA JERÁRQUICA
// ============================================================

// API: Obtener semestres por carrera
router.get("/api/semestres/:carrera", (req, res) => {
    const { carrera } = req.params;

    const query = `
        SELECT  	
            DISTINCT pp.num_semestre AS semestre,
            c.codigo
        FROM carrera c
        INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
        WHERE c.codigo = ? 
        AND c.activo = 1
        ORDER BY semestre;
    `;

    conexion.query(query, [carrera], (error, results) => {
        if (error) {
            console.error('Error al obtener semestres:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        res.json(results.map(r => r.semestre));
    });
});

// API: Obtener materias por carrera y semestre
router.get("/api/materias/:carrera/:semestre", (req, res) => {
    const { carrera, semestre } = req.params;

    const query = `
        SELECT 
            m.codigo,
            m.nombre,
            pp.num_semestre AS semestre,
            pp.unidades_credito AS creditos
        FROM materia m
        INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
        INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
        WHERE pp.codigo_carrera = ?
        AND pp.num_semestre = ?
        AND c.activo = 1
        ORDER BY semestre, nombre;
    `;

    conexion.query(query, [carrera, semestre], (error, results) => {
        if (error) {
            console.error('Error al obtener materias:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// API: Obtener secciones por materia y carrera
router.get("/api/secciones/:materia/:carrera", (req, res) => {
    const { materia, carrera } = req.params;

    const query = `
        SELECT 
            s.id, 
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS codigo,
            IFNULL(GROUP_CONCAT(DISTINCT CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ' (', hs.aula, ')', ')') SEPARATOR ', '), 'No encontrado') AS horario,
            s.capacidad_maxima,
            COUNT(ins.cedula_estudiante) AS estudiantes_inscritos,
            pp.codigo_periodo AS lapso_academico
        FROM seccion s
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
        LEFT JOIN inscripcion_seccion ins ON s.id = ins.id_seccion
        WHERE pp.codigo_materia = ? 
        AND pp.codigo_carrera = ? 
        AND s.activo = 1
        GROUP BY s.id
        ORDER BY codigo;
    `;

    conexion.query(query, [materia, carrera], (error, results) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});
// API: Obtener evaluaciones por sección
router.get("/admin/evaluaciones/:seccionId", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    const { seccionId } = req.params;
    const query = `
        SELECT
            evaluacion_id,
            id_seccion,
            contenido_evaluacion,
            tipo_evaluacion,
            rubrica_id,
            nombre_rubrica,
            valor,
            docente_cedula,
            docente_nombre,
            docente_apellido,
            materia_nombre,
            carrera_nombre,
            total_evaluaciones,
            seccion_codigo,
            completadas,
            total_evaluaciones - completadas AS pendientes,
            fecha_evaluacion,
            CASE
                WHEN rubrica_id IS NULL THEN 'Pendiente'
                WHEN rubrica_id IS NOT NULL AND total_evaluaciones = completadas AND total_evaluaciones != 0 THEN 'Completada'
                ELSE 'En Progreso'
            END as estado
        FROM
        (
            SELECT 
                e.id AS evaluacion_id,
                e.contenido AS contenido_evaluacion,
            	GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                MAX(r.id) AS rubrica_id,  -- Usar MAX para obtener un valor único
                IFNULL(MAX(r.nombre_rubrica), 'Sin rubrica') AS nombre_rubrica,  -- Usar MAX aquí también
                e.ponderacion as valor,
                u.cedula as docente_cedula,
                u.nombre as docente_nombre,
                u.apeliido as docente_apellido,
                m.nombre as materia_nombre,
                c.nombre as carrera_nombre,
                estud_sec.cantidad_en_seccion AS total_evaluaciones, 
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                COUNT(DISTINCT eval_est.id) AS completadas,
                e.fecha_evaluacion,
                s.id AS id_seccion
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            INNER JOIN (
                SELECT 
                    COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
                    ins.id_seccion
                FROM inscripcion_seccion ins
                GROUP BY ins.id_seccion
            ) AS estud_sec ON s.id = estud_sec.id_seccion
            INNER JOIN permiso_docente pd ON estud_sec.id_seccion = pd.id_seccion
            INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
            INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
            LEFT JOIN (
                SELECT 
                    er.id,
                    er.id_evaluacion,
                    SUM(de.puntaje_obtenido) AS puntaje_eval
                FROM evaluacion_realizada er 
                INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                GROUP BY er.id, er.id_evaluacion
            ) AS eval_est ON eval_est.id_evaluacion = e.id
            LEFT JOIN rubrica_uso ru ON e.id = ru.id_eval
            LEFT JOIN rubrica r ON ru.id_rubrica = r.id
            LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
            LEFT JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
            GROUP BY e.id
        ) AS todo
        WHERE id_seccion = ?
        ORDER BY fecha_evaluacion DESC;
        `;

    conexion.query(query, [seccionId], (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.json({ success: false, message: 'Error al obtener estrategias' });
        }
        res.json({ success: true, evaluaciones});
    });
});
// ============================================================
// RUTA POST PARA GUARDAR LA RÚBRICA
// ============================================================

router.post('/envioRubrica', (req, res) => {
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
            return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }
    }

    // ============================================================
    // VALIDACIONES DEL SERVIDOR
    // ============================================================

    // Validar campos requeridos
    if (!nombre_rubrica || !materia_codigo || !seccion_id || !fecha_evaluacion ||
        !porcentaje_evaluacion || !tipo_evaluacion) {
        mensaje = 'Error: Todos los campos obligatorios deben estar completos';
        return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar porcentaje
    const porcentaje = parseFloat(porcentaje_evaluacion);
    if (isNaN(porcentaje) || porcentaje < 5 || porcentaje > 100) {
        mensaje = 'Error: El porcentaje debe estar entre 5% y 100%';
        return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar criterios
    if (!criteriosParsed || !Array.isArray(criteriosParsed) || criteriosParsed.length === 0) {
        mensaje = 'Error: Debe agregar al menos un criterio de evaluación';
        return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // Validar estructura de criterios y niveles
    let sumaPuntajes = 0;
    for (let i = 0; i < criteriosParsed.length; i++) {
        const criterio = criteriosParsed[i];

        // Validar descripción del criterio
        if (!criterio.descripcion || criterio.descripcion.trim() === '') {
            mensaje = `Error: El criterio ${i + 1} necesita una descripción`;
            return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // Validar puntaje mínimo del criterio (1 punto)
        const puntajeCriterio = parseFloat(criterio.puntaje_maximo);
        if (isNaN(puntajeCriterio) || puntajeCriterio < 1) {
            mensaje = `Error: El criterio ${i + 1} debe tener un puntaje mínimo de 1 punto`;
            return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        sumaPuntajes += puntajeCriterio;

        // Validar niveles del criterio
        if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            mensaje = `Error: El criterio ${i + 1} debe tener al menos un nivel de desempeño`;
            return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // Validar cada nivel
        for (let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];

            if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                mensaje = `Error: El nivel ${j + 1} del criterio ${i + 1} necesita un nombre`;
                return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            if (!nivel.descripcion || nivel.descripcion.trim() === '') {
                mensaje = `Error: El nivel "${nivel.nombre_nivel}" necesita una descripción`;
                return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Validar puntaje mínimo del nivel (0.25 puntos)
            const puntajeNivel = parseFloat(nivel.puntaje);
            if (isNaN(puntajeNivel) || puntajeNivel < 0.25) {
                mensaje = `Error: El nivel "${nivel.nombre_nivel}" debe tener un puntaje mínimo de 0.25 puntos`;
                return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // Validar que el puntaje del nivel no exceda el del criterio
            if (puntajeNivel > puntajeCriterio) {
                mensaje = `Error: El puntaje del nivel "${nivel.nombre_nivel}" (${puntajeNivel}) excede el puntaje máximo del criterio (${puntajeCriterio})`;
                return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }
        }
    }

    // Validar que la suma de puntajes no exceda el porcentaje
    if (sumaPuntajes > porcentaje) {
        mensaje = `Error: La suma de puntajes de los criterios (${sumaPuntajes.toFixed(2)}) excede el porcentaje de evaluación (${porcentaje}%)`;
        return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
    }

    // ============================================================
    // INICIAR TRANSACCIÓN
    // ============================================================

    // Obtener una conexión del pool
    conexion.getConnection((err, conn) => {
        if (err) {
            console.error('Error al obtener conexión del pool:', err);
            mensaje = 'Error del servidor al conectar con la base de datos';
            return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
        }

        // Iniciar transacción en la conexión obtenida
        conn.beginTransaction((err) => {
            if (err) {
                conn.release(); // Liberar la conexión
                console.error('Error al iniciar transacción:', err);
                mensaje = 'Error del servidor al iniciar la transacción';
                return res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
            }

            // ============================================================
            // 1. INSERTAR LA RÚBRICA PRINCIPAL
            // ============================================================

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
                        res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                const rubricaId = resultRubrica.insertId;
                console.log('Rúbrica insertada con ID:', rubricaId);

                let criteriosCompletados = 0;
                const totalCriterios = criteriosParsed.length;
                let hayError = false;

                // ============================================================
                // 2. INSERTAR CRITERIOS Y NIVELES
                // ============================================================

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
                        if (error) {
                            hayError = true;
                            return conn.rollback(() => {
                                conn.release(); // Liberar la conexión
                                console.error('Error al insertar criterio:', error);
                                mensaje = `Error al guardar el criterio: ${criterio.descripcion}`;
                                res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        const criterioId = resultCriterio.insertId;
                        console.log('Criterio insertado con ID:', criterioId);

                        // ============================================================
                        // 3. INSERTAR NIVELES DE DESEMPEÑO
                        // ============================================================

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

                                conn.query(queryNivel, valuesNivel, (error, resultNivel) => {
                                    if (error) {
                                        hayError = true;
                                        return conn.rollback(() => {
                                            conn.release(); // Liberar la conexión
                                            console.error('Error al insertar nivel:', error);
                                            mensaje = `Error al guardar el nivel: ${nivel.nombre_nivel}`;
                                            res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                                        });
                                    }

                                    console.log('Nivel insertado:', nivel.nombre_nivel);
                                    nivelesCompletados++;

                                    // Verificar si todos los niveles de este criterio fueron insertados
                                    if (nivelesCompletados === totalNiveles) {
                                        criteriosCompletados++;
                                        console.log(`Criterio ${criteriosCompletados}/${totalCriterios} completado`);

                                        // Verificar si todos los criterios fueron completados
                                        if (criteriosCompletados === totalCriterios && !hayError) {
                                            finalizarTransaccion();
                                        }
                                    }
                                });
                            });
                        } else {
                            // Si no hay niveles (no debería pasar por validación), contar como completado
                            criteriosCompletados++;

                            if (criteriosCompletados === totalCriterios && !hayError) {
                                finalizarTransaccion();
                            }
                        }
                    });
                });

                // ============================================================
                // FUNCIÓN PARA FINALIZAR LA TRANSACCIÓN
                // ============================================================

                function finalizarTransaccion() {
                    conn.commit((err) => {
                        if (err) {
                            return conn.rollback(() => {
                                conn.release(); // Liberar la conexión
                                console.error('Error al confirmar transacción:', err);
                                mensaje = 'Error al confirmar la transacción en la base de datos';
                                res.redirect('/admin/createrubricas?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        conn.release(); // Liberar la conexión exitosamente
                        console.log('✅ Rúbrica creada exitosamente con ID:', rubricaId);
                        console.log('   - Criterios insertados:', totalCriterios);
                        console.log('   - Suma de puntajes:', sumaPuntajes.toFixed(2));
                        console.log('   - Porcentaje de evaluación:', porcentaje + '%');

                        mensaje = '¡Rúbrica creada exitosamente!';
                        res.redirect('/admin/rubricas?mensaje=' + encodeURIComponent(mensaje));
                    });
                }
            });
        });
    });
});

module.exports = router;