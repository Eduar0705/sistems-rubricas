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
    const queryTipoRubricas = `
        SELECT 
            id,
            nombre
        FROM tipo_rubrica
        GROUP BY nombre
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

        conexion.query(queryTipoRubricas, (error, tipos_r) => {
            if (error) {
                console.error('Error al obtener tipos de rubrica:', error);
                return res.render("admin/createRubricas", {
                    datos: req.session,
                    title: 'Crear Rúbrica',
                    carreras: [],
                    tipos_r: [],
                    currentPage: 'createrubricas',
                    mensaje: req.query.mensaje
                });
            }

            res.render("admin/createRubricas", {
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
router.get("/admin/evaluaciones/:seccionId", function (req, res) {
    if (!req.session.login) {
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
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
            INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
            LEFT JOIN (
                SELECT 
                    COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
                    ins.id_seccion
                FROM inscripcion_seccion ins
                GROUP BY ins.id_seccion
            ) AS estud_sec ON s.id = estud_sec.id_seccion
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
            WHERE r.id IS NULL
            GROUP BY e.id
        ) AS todo
        WHERE id_seccion = ?
        ORDER BY fecha_evaluacion DESC;
        `;

    conexion.query(query, [seccionId], (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.json({ success: false, message: 'Error al obtener evaluaciones' });
        }
        res.json({ success: true, evaluaciones });
    });
});
// ============================================================
// RUTA POST PARA GUARDAR LA RÚBRICA
// ============================================================

router.post('/envioRubrica', (req, res) => {
    // Validar sesión
    if (!req.session || !req.session.cedula) {
        return res.status(401).json({
            success: false,
            mensaje: 'Sesión no válida. Por favor, inicie sesión nuevamente.'
        });
    }
    const {
        nombre_rubrica,
        id_evaluacion,
        tipo_rubrica,
        instrucciones,
        criterios, 
        porcentaje
    } = req.body;

    // Parse criterios si viene como string
    let criteriosParsed = criterios;
    if (typeof criterios === 'string') {
        try {
            criteriosParsed = JSON.parse(criterios);
        } catch (e) {
            console.error('Error al parsear criterios:', e);
            return res.status(400).json({
                success: false,
                mensaje: 'Error: Formato de criterios inválido'
            });
        }
    }

    // ============================================================
    // VALIDACIONES DEL SERVIDOR
    // ============================================================

    // Validar campos requeridos
    if (!nombre_rubrica || !id_evaluacion || !tipo_rubrica || !instrucciones) {
        return res.status(400).json({
            success: false,
            mensaje: 'Error: Todos los campos obligatorios deben estar completos',
            errores: {
                nombre_rubrica: !nombre_rubrica,
                id_evaluacion: !id_evaluacion,
                tipo_rubrica: !tipo_rubrica,
                instrucciones: !instrucciones
            }
        });
    }

    // Validar criterios
    if (!criteriosParsed || !Array.isArray(criteriosParsed) || criteriosParsed.length === 0) {
        return res.status(400).json({
            success: false,
            mensaje: 'Error: Debe agregar al menos un criterio de evaluación'
        });
    }

    // Validar estructura de criterios y niveles
    let sumaPuntajes = 0;
    for (let i = 0; i < criteriosParsed.length; i++) {
        const criterio = criteriosParsed[i];

        // Validar descripción del criterio
        if (!criterio.descripcion || criterio.descripcion.trim() === '') {
            return res.status(400).json({
                success: false,
                mensaje: `Error: El criterio ${i + 1} necesita una descripción`,
                campo: `criterio_${i}_descripcion`
            });
        }

        // Validar puntaje mínimo del criterio (1 punto)
        const puntajeCriterio = parseFloat(criterio.puntaje_maximo);
        if (isNaN(puntajeCriterio) || puntajeCriterio < 1) {
            return res.status(400).json({
                success: false,
                mensaje: `Error: El criterio ${i + 1} debe tener un puntaje mínimo de 1 punto`
            });
        }

        sumaPuntajes += puntajeCriterio;

        // Validar niveles del criterio
        if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            return res.status(400).json({
                success: false,
                mensaje: `Error: El criterio ${i + 1} debe tener al menos un nivel de desempeño`
            });
        }

        // Validar cada nivel
        for (let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];

            if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                return res.status(400).json({
                    success: false,
                    mensaje: `Error: El nivel ${j + 1} del criterio ${i + 1} necesita un nombre`
                });
            }

            if (!nivel.descripcion || nivel.descripcion.trim() === '') {
                return res.status(400).json({
                    success: false,
                    mensaje: `Error: El nivel "${nivel.nombre_nivel}" necesita una descripción`
                });
            }

            const puntajeNivel = parseFloat(nivel.puntaje);
            if (isNaN(puntajeNivel) || puntajeNivel < 0.25) {
                return res.status(400).json({
                    success: false,
                    mensaje: `Error: El nivel "${nivel.nombre_nivel}" debe tener un puntaje mínimo de 0.25 puntos`
                });
            }

            if (puntajeNivel > puntajeCriterio) {
                return res.status(400).json({
                    success: false,
                    mensaje: `Error: El puntaje del nivel "${nivel.nombre_nivel}" (${puntajeNivel}) excede el puntaje máximo del criterio (${puntajeCriterio})`
                });
            }
        }
    }

    // Validar que la suma de puntajes sea EXACTAMENTE IGUAL al porcentaje
    if (Math.abs(sumaPuntajes - porcentaje) > 0.01) {
        return res.status(400).json({
            success: false,
            mensaje: `Error: La suma de puntajes (${sumaPuntajes.toFixed(2)}) debe ser EXACTAMENTE IGUAL al porcentaje de evaluación (${porcentaje}%)`
        });
    }

    // ============================================================
    // VERIFICAR SI LA EVALUACIÓN YA TIENE UNA RÚBRICA ASIGNADA
    // ============================================================
    conexion.getConnection((err, conn) => {
        if (err) {
            console.error('Error al obtener conexión del pool:', err);
            return res.status(500).json({
                success: false,
                mensaje: 'Error del servidor al conectar con la base de datos'
            });
        }

        // Verificar si ya existe una relación en rubrica_uso
        const queryVerificar = 'SELECT id_rubrica FROM rubrica_uso WHERE id_eval = ?';
        
        conn.query(queryVerificar, [id_evaluacion], (error, resultados) => {
            if (error) {
                conn.release();
                console.error('Error al verificar relación existente:', error);
                return res.status(500).json({
                    success: false,
                    mensaje: 'Error al verificar si la evaluación ya tiene una rúbrica'
                });
            }

            if (resultados.length > 0) {
                conn.release();
                return res.status(400).json({
                    success: false,
                    mensaje: 'Esta evaluación ya tiene una rúbrica asignada.'
                });
            }

            // ============================================================
            // INICIAR TRANSACCIÓN
            // ============================================================
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release();
                    console.error('Error al iniciar transacción:', err);
                    return res.status(500).json({
                        success: false,
                        mensaje: 'Error del servidor al iniciar la transacción'
                    });
                }

                // Insertar rúbrica
                const queryRubrica = `
                    INSERT INTO rubrica
                    (nombre_rubrica, cedula_docente, instrucciones, id_tipo) 
                    VALUES (?, ?, ?, ?)
                `;

                const valuesRubrica = [
                    nombre_rubrica,
                    req.session.cedula,
                    instrucciones,
                    tipo_rubrica
                ];

                conn.query(queryRubrica, valuesRubrica, (error, resultRubrica) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release();
                            console.error('Error al insertar rúbrica:', error);
                            res.status(500).json({
                                success: false,
                                mensaje: 'Error al guardar la rúbrica en la base de datos'
                            });
                        });
                    }

                    const rubricaId = resultRubrica.insertId;

                    // ============================================================
                    // INSERTAR EN rubrica_uso (RELACIÓN EVALUACIÓN-RÚBRICA)
                    // ============================================================
                    const queryRubricaUso = `
                        INSERT INTO rubrica_uso
                        (id_eval, id_rubrica) 
                        VALUES (?, ?)
                    `;

                    conn.query(queryRubricaUso, [id_evaluacion, rubricaId], (error) => {
                        if (error) {
                            return conn.rollback(() => {
                                conn.release();
                                console.error('Error al insertar en rubrica_uso:', error);
                                res.status(500).json({
                                    success: false,
                                    mensaje: 'Error al relacionar la rúbrica con la evaluación'
                                });
                            });
                        }

                        let criteriosCompletados = 0;
                        const totalCriterios = criteriosParsed.length;
                        let hayError = false;

                        // Insertar criterios y niveles
                        criteriosParsed.forEach((criterio, indexCriterio) => {
                            if (hayError) return;

                            const queryCriterio = `
                                INSERT INTO criterio_rubrica
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
                                        conn.release();
                                        console.error('Error al insertar criterio:', error);
                                        res.status(500).json({
                                            success: false,
                                            mensaje: `Error al guardar el criterio: ${criterio.descripcion}`
                                        });
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
                                            (criterio_id, nombre_nivel, descripcion, puntaje_maximo, orden) 
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
                                            if (error) {
                                                hayError = true;
                                                return conn.rollback(() => {
                                                    conn.release();
                                                    console.error('Error al insertar nivel:', error);
                                                    res.status(500).json({
                                                        success: false,
                                                        mensaje: `Error al guardar el nivel: ${nivel.nombre_nivel}`
                                                    });
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
                                        conn.release();
                                        console.error('Error al confirmar transacción:', err);
                                        res.status(500).json({
                                            success: false,
                                            mensaje: 'Error al confirmar la transacción en la base de datos'
                                        });
                                    });
                                }

                                conn.release();
                                
                                res.json({
                                    success: true,
                                    mensaje: '¡Rúbrica creada exitosamente y asignada a la evaluación!',
                                    rubricaId: rubricaId,
                                    datos: {
                                        criterios: totalCriterios,
                                        sumaPuntajes: sumaPuntajes.toFixed(2),
                                        porcentaje: porcentaje
                                    }
                                });
                            });
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;