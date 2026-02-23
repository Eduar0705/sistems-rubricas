const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// Ruta principal de evaluaciones
router.get("/admin/evaluaciones", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const query = `
        SELECT
            evaluacion_id,
            id_seccion,
            contenido_evaluacion,
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
            id_horario,
            tipo_horario,
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
                IFNULL(MAX(he.id_horario), MAX(hec.id)) AS id_horario, 
                CASE 
                    WHEN MAX(he.id_horario) IS NOT NULL THEN 'Sección'
                    WHEN MAX(hec.id) IS NOT NULL THEN 'Clandestina'
                    ELSE 'Sin horario'
                END AS tipo_horario,
                s.id AS id_seccion
            FROM evaluacion e
            LEFT JOIN horario_eval he ON e.id = he.id_eval
            LEFT JOIN horario_eval_clandestina hec ON e.id = hec.id_eval
            LEFT JOIN rubrica_uso ru ON e.id = ru.id_eval
            LEFT JOIN rubrica r ON ru.id_rubrica = r.id
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
            GROUP BY e.id
        ) AS todo
        ORDER BY fecha_evaluacion DESC;
        `;

    conexion.query(query, (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.render("admin/evaluaciones", {
                datos: req.session, 
                title: 'SGR - Evaluaciones', 
                currentPage: 'evaluaciones',
                evaluaciones: [],
                error: 'Error al cargar las evaluaciones'
            });
        }

        const evaluacionesFormateadas = evaluaciones.map(ev => {
            const fecha = ev.fecha_evaluacion ? 
                new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : 'Sin evaluaciones';
            
            
            return {
                ...ev,
                fecha_formateada: fecha,
                estado_formateado: ev.estado
            };
        });
        res.render("admin/evaluaciones", {
            datos: req.session, 
            title: 'SGR - Evaluaciones', 
            currentPage: 'evaluaciones',
            evaluaciones: evaluacionesFormateadas
        });
    });
});
// API: Obtener estrategias de evaluación
router.get('/api/estrategias_eval', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT 
            *
        FROM estrategia_eval
        ORDER BY nombre
    `;

    conexion.query(query, (error, estrategias_eval) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, estrategias_eval });
    });
});

// API: Obtener carreras activas
router.get('/api/carreras', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT 
            codigo, 
            nombre, 
            descripcion
        FROM carrera
        WHERE activo = 1
        ORDER BY nombre
    `;

    conexion.query(query, (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras });
    });
});

// API: Obtener materias por carrera
router.get('/api/carrera/:carreraCodigo/materias', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { carreraCodigo } = req.params;

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
        AND c.activo = 1
        ORDER BY semestre, nombre
    `;

    conexion.query(query, [carreraCodigo], (error, materias) => {
        if (error) {
            console.error('Error al obtener materias:', error);
            return res.json({ success: false, message: 'Error al obtener materias' });
        }

        res.json({ success: true, materias });
    });
});

// API: Obtener secciones por materia
router.get('/api/materia/:materiaCodigo/:carreraCodigo/secciones', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { materiaCodigo, carreraCodigo } = req.params;

    const query = `
        SELECT 
            s.id, 
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS codigo,
            IFNULL(GROUP_CONCAT(DISTINCT CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ' (', hs.aula, ')', ')') SEPARATOR ', '), 'No encontrado') AS horario,
            s.capacidad_maxima,
            COUNT(ins.cedula_estudiante) AS estudiantes_inscritos
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

    conexion.query(query, [materiaCodigo, carreraCodigo], (error, secciones) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.json({ success: false, message: 'Error al obtener secciones' });
        }

        res.json({ success: true, secciones });
    });
});

// API: Obtener estudiantes de una sección
router.get('/api/seccion/:seccionId/estudiantes', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { seccionId } = req.params;

    const query = `
        SELECT 
            u.cedula,
            u.nombre,
            u.apeliido AS apellido,
            u.email
        FROM seccion s
        INNER JOIN inscripcion_seccion ins ON s.id = ins.id_seccion
        INNER JOIN usuario_estudiante ud ON ins.cedula_estudiante = ud.cedula_usuario
        INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
        WHERE ins.id_seccion = ?
        AND u.activo = 1 
        ORDER BY apellido, u.nombre;
    `;

    conexion.query(query, [seccionId], (error, estudiantes) => {
        if (error) {
            console.error('Error al obtener estudiantes:', error);
            return res.json({ success: false, message: 'Error al obtener estudiantes' });
        }

        res.json({ success: true, estudiantes });
    });
});

// API: Obtener rúbricas activas con detalle de carrera, materia, sección y docente
router.get('/api/rubricas/activas', (req, res) => {
    if(!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
                            SELECT
                				r.id,
                                r.nombre_rubrica,
                				e.ponderacion AS porcentaje_evaluacion,
                                CASE
                                    WHEN e.cantidad_personas=1 THEN 'Individual'
                                    WHEN e.cantidad_personas=2 THEN 'En Pareja'
                                    ELSE 'Grupal'
                                END AS modalidad,
	               				GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                                e.cantidad_personas,
                                s.id AS seccion_id,
                                m.nombre AS materia_nombre,
                				m.codigo AS materia_codigo,
                                pp.num_semestre AS semestre,
                                c.codigo as carrera_codigo,
            					c.nombre as carrera_nombre,
                				CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                                IFNULL(GROUP_CONCAT(CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS seccion_horario,
                                hs.aula AS seccion_aula,
                                pp.codigo_periodo AS seccion_lapso,
                                u.cedula AS docente_cedula,
                                u.nombre as docente_nombre,
            					u.apeliido as docente_apellido
                            FROM rubrica r
                            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                            INNER JOIN evaluacion e ON ru.id_eval = e.id
                			LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
                            LEFT JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
                            INNER JOIN seccion s ON e.id_seccion = s.id
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN materia m ON pp.codigo_materia = m.codigo
                            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
                            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
                			INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
                			INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                            LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
                            WHERE r.activo = 1 AND u.activo = 1
                            GROUP BY r.id
                            ORDER BY nombre_rubrica DESC;
    `;

    conexion.query(query, (error, rubricas) => {
        if (error) {
            console.error('Error al obtener rúbricas:', error);
            return res.json({ success: false, message: 'Error al obtener rúbricas' });
        }

        res.json({ success: true, rubricas });
    });
});

// API: Crear evaluaciones
router.post('/api/evaluaciones/crear_en_horario', express.json(), (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { 
        observaciones, fecha_evaluacion, id_horario, id_seccion, cant_personas, 
        contenido, competencias, instrumentos, porcentaje, estrategias_eval 
    } = req.body;

    // 1. Validaciones iniciales
    if (!fecha_evaluacion || !id_horario || !id_seccion || !cant_personas || !competencias || !instrumentos ||
         porcentaje == null || !estrategias_eval || estrategias_eval.length === 0) {
        return res.json({ success: false, message: 'Datos incompletos' });
    }

    // 2. Verificar duplicados (Usando el pool directamente)
    const queryDuplicados = `SELECT 
                                e.id 
                            FROM evaluacion e
                            INNER JOIN horario_eval he ON e.id = he.id_eval
                            WHERE e.fecha_evaluacion = ? AND he.id_horario = ?`;
    
    conexion.query(queryDuplicados, [fecha_evaluacion, id_horario], (error, duplicados) => {
        if (error) {
            console.error('Error duplicados:', error);
            return res.json({ success: false, message: 'Error al verificar disponibilidad. Por favor, inténtelo de nuevo más tarde.' });
        }

        if (duplicados.length > 0) {
            return res.json({ success: false, message: 'Ya existe una evaluación en este horario' });
        }

        // 3. Obtener conexión para Transacción
        conexion.getConnection((err, conn) => {
            if (err) return res.json({ success: false, message: 'Error de conexión' });

            conn.beginTransaction((err) => {
                if (err) { conn.release(); return res.json({ success: false, message: 'Error de transacción' }); }

                const insertEval = `INSERT INTO evaluacion (ponderacion, cantidad_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const valoresEval = [porcentaje, cant_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion];
                conn.query(insertEval, valoresEval, (err, result) => {
                    if (err) {
                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al crear evaluación. Por favor, inténtelo de nuevo más tarde.' }); });
                    }
                    const eval_id = result.insertId;
                    const insertHorar = `INSERT INTO horario_eval(id_horario, id_eval) VALUES (?, ?)`;
                    const valoresHorar = [id_horario ,eval_id];

                    conn.query(insertHorar, valoresHorar, (err, result) => {
                        if (err) {
                            return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al crear evaluación. Por favor, inténtelo de nuevo más tarde.' }); });
                        }

                        // 4. Inserción Múltiple (Mucho más eficiente que un loop)
                        const valoresEstrategias = estrategias_eval.map(estId => [estId, eval_id]);
                        const insertEstrategias = `INSERT INTO estrategia_empleada (id_estrategia, id_eval) VALUES ?`;

                        conn.query(insertEstrategias, [valoresEstrategias], (err) => {
                            if (err) {
                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar estrategias. Por favor, inténtelo de nuevo más tarde.' }); });
                            }

                            // 5. Finalizar
                            conn.commit((err) => {
                                if (err) {
                                    return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al confirmar. Por favor, inténtelo de nuevo más tarde.' }); });
                                }
                                conn.release();
                                res.json({ success: true, message: 'Evaluación agregada exitosamente :D', id: eval_id });
                            });
                        });
                    });
                });
            });
        });
    });
});
router.post('/api/evaluaciones/crear_fuera_de_horario', express.json(), (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }
    const { 
        observaciones, fecha_evaluacion, hora_eval_inicio, hora_eval_fin, id_seccion, cant_personas, 
        contenido, competencias, instrumentos, porcentaje, estrategias_eval 
    } = req.body;

    // 1. Validaciones iniciales
    if (!fecha_evaluacion || !hora_eval_inicio || !hora_eval_fin || !id_seccion || !cant_personas || !competencias || 
        !contenido || !instrumentos || porcentaje == null || !estrategias_eval || estrategias_eval.length === 0) {
        return res.json({ success: false, message: 'Datos incompletos' });
    }

    // 2. Verificar duplicados (Usando el pool directamente)
    let queryDuplicados = `SELECT 
                                e.id 
                            FROM evaluacion e
                            INNER JOIN horario_eval he ON e.id = he.id_eval
                            INNER JOIN horario_seccion hs ON he.id_horario = hs.id
                            WHERE hs.hora_inicio < ? AND hs.hora_cierre > ?
                            AND e.fecha_evaluacion = ?`;
    
    conexion.query(queryDuplicados, [hora_eval_fin, hora_eval_inicio, fecha_evaluacion], (error, duplicados) => {
        if (error) {
            console.error('Error duplicados:', error);
            return res.json({ success: false, message: 'Error al verificar disponibilidad, por favor intentelo de nuevo más tarde.' });
        }

        if (duplicados.length > 0) {
            return res.json({ success: false, message: 'Ya existe una evaluación en este horario' });
        }
        const queryDuplicados = `SELECT 
                                    e.id 
                                FROM evaluacion e
                                INNER JOIN horario_eval_clandestina hec ON e.id = hec.id_eval
                                WHERE hec.hora_inicio < ? AND hec.hora_cierre > ?
                                AND e.fecha_evaluacion = ?`;
    
        conexion.query(queryDuplicados, [hora_eval_fin, hora_eval_inicio, fecha_evaluacion], (error, duplicados) => {
            if (error) {
                console.error('Error duplicados:', error);
                return res.json({ success: false, message: 'Error al verificar disponibilidad, por favor intentelo de nuevo más tarde.' });
            }

            if (duplicados.length > 0) {
                return res.json({ success: false, message: 'Ya existe una evaluación en este horario' });
            }

            // 3. Obtener conexión para Transacción
            conexion.getConnection((err, conn) => {
                if (err) return res.json({ success: false, message: 'Error de conexión. Por favor, inténtelo de nuevo más tarde.' });

                conn.beginTransaction((err) => {
                    if (err) { conn.release(); return res.json({ success: false, message: 'Error de transacción. Por favor, inténtelo de nuevo más tarde.' }); }
                    const insertEval = `INSERT INTO evaluacion (ponderacion, cantidad_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    const valoresEval = [porcentaje, cant_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion];

                    conn.query(insertEval, valoresEval, (err, result) => {
                        if (err) {
                            return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al crear evaluación. Por favor, inténtelo de nuevo más tarde' }); });
                        }
                    const eval_id = result.insertId;
                    const insertHorar = `INSERT INTO horario_eval_clandestina (hora_inicio, hora_cierre, id_eval) VALUES (?, ?, ?)`;
                    const valoresHorar = [hora_eval_inicio, hora_eval_fin, eval_id];
                    conn.query(insertHorar, valoresHorar, (err, result) => {
                        if (err) {
                            return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al crear horario de la evaluación. Por favor, inténtelo de nuevo más tarde.' }); });
                        }
                        // 4. Inserción Múltiple (Mucho más eficiente que un loop)
                        const valoresEstrategias = estrategias_eval.map(estId => [estId, eval_id]);
                        const insertEstrategias = `INSERT INTO estrategia_empleada (id_estrategia, id_eval) VALUES ?`;

                        conn.query(insertEstrategias, [valoresEstrategias], (err) => {
                            if (err) {
                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar estrategias. Por favor, inténtelo de nuevo más tarde.' }); });
                            }

                            // 5. Finalizar
                            conn.commit((err) => {
                                if (err) {
                                    return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al confirmar. Por favor, verifique que se haya agregado la evaluacion y si no, agreguela de nuevo.' }); });
                                }
                                conn.release();
                                res.json({ success: true, message: 'Evaluación agregada exitosamente :D', id: eval_id });
                            });
                        });
                    });
                });
            });
        });
    });
});
});
// API: Obtener detalles de una evaluación para editar
router.get('/api/evaluacion/:id', (req, res) => {
    if(!req.session.login) return res.json({ success: false, message: 'No autorizado' });

    const { id } = req.params;

    const query = `
        SELECT 
            e.id AS evaluacion_id,
            e.contenido,
            e.ponderacion AS porcentaje,
            e.cantidad_personas,
            e.competencias,
            e.instrumentos,
            e.fecha_evaluacion,
            e.id_seccion,
            s.id AS seccion_id,
            s.letra AS seccion_letra,
            pp.codigo_carrera AS carrera_codigo,
            pp.codigo_materia AS materia_codigo,
            CASE 
                WHEN he.id_horario IS NOT NULL THEN 'Sección'
                WHEN hec.id IS NOT NULL THEN 'Otro'
                ELSE 'Sin horario'
            END AS tipo_horario,
            he.id_horario,
            hs.dia,
            hs.dia_num,
            hs.aula,
            IFNULL(hs.hora_inicio, hec.hora_inicio) AS hora_inicio,
            IFNULL(hs.hora_cierre, hec.hora_cierre) AS hora_cierre
        FROM evaluacion e
        INNER JOIN seccion s ON e.id_seccion = s.id
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        LEFT JOIN horario_eval he ON e.id = he.id_eval
        LEFT JOIN horario_seccion hs ON hs.id = he.id_horario
        LEFT JOIN horario_eval_clandestina hec ON e.id = hec.id_eval
        WHERE e.id = ?
    `;

    conexion.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener evaluación:', error);
            return res.json({ success: false, message: 'Error al obtener evaluación' });
        }
        if (results.length === 0) {
            return res.json({ success: false, message: 'Evaluación no encontrada' });
        }

        const evaluacion = results[0];

        // Obtener estrategias asociadas
        const queryEstrategias = `
            SELECT ee.id_estrategia
            FROM estrategia_empleada ee
            WHERE ee.id_eval = ?
        `;
        conexion.query(queryEstrategias, [id], (err, estrategias) => {
            if (err) {
                console.error('Error al obtener estrategias:', err);
                return res.json({ success: false, message: 'Error al obtener estrategias' });
            }
            evaluacion.estrategias = estrategias.map(e => e.id_estrategia);
            res.json({ success: true, evaluacion });
        });
    });
});
// API: Actualizar evaluación
router.put('/api/evaluacion/:id', express.json(), (req, res) => {
    if (!req.session.login) return res.json({ success: false, message: 'No autorizado' });

    const { id } = req.params;
    const { 
        contenido, estrategias_eval, porcentaje, cant_personas, id_seccion,
        fecha_evaluacion, tipo_horario, id_horario, hora_inicio, hora_fin,
        competencias, instrumentos 
    } = req.body;

    // Validaciones básicas
    if (!contenido || !estrategias_eval || !porcentaje || !cant_personas || !id_seccion || !fecha_evaluacion || !tipo_horario || !competencias || !instrumentos) {
        return res.json({ success: false, message: 'Datos incompletos' });
    }

    // Verificar si la evaluación existe y si tiene evaluaciones realizadas
    const checkQuery = `
        SELECT COUNT(*) AS count FROM evaluacion_realizada WHERE id_evaluacion = ?
    `;
    conexion.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al verificar evaluaciones realizadas:', err);
            return res.json({ success: false, message: 'Error al verificar estado de la evaluación' });
        }
        /*if (result[0].count > 0) {
            return res.json({ success: false, message: 'No se puede editar una evaluación que ya tiene estudiantes evaluados' });
        }*/

        // Iniciar transacción
        conexion.getConnection((err, conn) => {
            if (err) return res.json({ success: false, message: 'Error de conexión' });

            conn.beginTransaction(err => {
                if (err) { conn.release(); return res.json({ success: false, message: 'Error de transacción' }); }

                // Actualizar evaluacion
                const updateEval = `
                    UPDATE evaluacion 
                    SET contenido = ?, ponderacion = ?, cantidad_personas = ?, competencias = ?, instrumentos = ?, fecha_evaluacion = ?, id_seccion = ?
                    WHERE id = ?
                `;
                conn.query(updateEval, [contenido, porcentaje, cant_personas, competencias, instrumentos, fecha_evaluacion, id_seccion, id], (err, result) => {
                    if (err) {
                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al actualizar evaluación' }); });
                    }

                    // Eliminar horarios existentes
                    const deleteHorarioEval = `DELETE FROM horario_eval WHERE id_eval = ?`;
                    const deleteHorarioClandestina = `DELETE FROM horario_eval_clandestina WHERE id_eval = ?`;
                    
                    conn.query(deleteHorarioEval, [id], err => {
                        if (err) {
                            return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al actualizar horario' }); });
                        }
                        conn.query(deleteHorarioClandestina, [id], err => {
                            if (err) {
                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al actualizar horario' }); });
                            }

                            // Insertar nuevo horario según tipo
                            if (tipo_horario === 'Sección') {
                                if (!id_horario) {
                                    return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Horario de sección no proporcionado' }); });
                                }
                                const insertHorario = `INSERT INTO horario_eval (id_horario, id_eval) VALUES (?, ?)`;
                                conn.query(insertHorario, [id_horario, id], err => {
                                    if (err) {
                                        console.error(err.message)
                                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar horario de sección' }); });
                                    }
                                    updateEstrategias();
                                });
                            } else if (tipo_horario === 'Otro') {
                                if (!hora_inicio || !hora_fin) {
                                    return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Horario de otro tipo incompleto' }); });
                                }
                                const insertClandestina = `INSERT INTO horario_eval_clandestina (hora_inicio, hora_cierre, id_eval) VALUES (?, ?, ?)`;
                                conn.query(insertClandestina, [hora_inicio, hora_fin, id], err => {
                                    if (err) {
                                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar horario clandestino' }); });
                                    }
                                    updateEstrategias();
                                });
                            } else {
                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Tipo de horario inválido' }); });
                            }

                            function updateEstrategias() {
                                // Eliminar estrategias existentes
                                const deleteEstrategias = `DELETE FROM estrategia_empleada WHERE id_eval = ?`;
                                conn.query(deleteEstrategias, [id], err => {
                                    if (err) {
                                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al actualizar estrategias' }); });
                                    }

                                    // Insertar nuevas estrategias
                                    if (estrategias_eval && estrategias_eval.length > 0) {
                                        const values = estrategias_eval.map(estId => [estId, id]);
                                        const insertEstrategias = `INSERT INTO estrategia_empleada (id_estrategia, id_eval) VALUES ?`;
                                        conn.query(insertEstrategias, [values], err => {
                                            if (err) {
                                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar estrategias' }); });
                                            }
                                            commitTransaction();
                                        });
                                    } else {
                                        commitTransaction();
                                    }
                                });
                            }

                            function commitTransaction() {
                                conn.commit(err => {
                                    if (err) {
                                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al confirmar transacción' }); });
                                    }
                                    conn.release();
                                    res.json({ success: true, message: 'Evaluación actualizada correctamente' });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});
// API: Obtener carreras activas (duplicado, pero lo mantengo por compatibilidad)
router.get('/api/carreras', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT 
            c.codigo, 
            c.nombre, 
            COUNT(DISTINCT pp.num_semestre) AS duracion_semestres
        FROM carrera c
        INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
        WHERE c.activo = 1
        ORDER BY nombre
    `;

    conexion.query(query, (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.json({ success: false, message: 'Error al obtener carreras. Por favor, inténtelo de nuevo más tarde' });
        }

        res.json({ success: true, carreras });
    });
});

// API: Obtener horarios por carrera
router.get('/api/carrera/:carreraCodigo/secciones', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { carreraCodigo } = req.params;

    const query = `
        SELECT 
            s.id,
            s.codigo,
            s.horario,
            s.aula,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo
        FROM seccion s
        INNER JOIN materia m ON s.materia_codigo = m.codigo
        WHERE m.carrera_codigo = ? 
        AND s.activo = 1
        ORDER BY m.nombre, s.codigo
    `;

    conexion.query(query, [carreraCodigo], (error, secciones) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.json({ success: false, message: 'Error al obtener secciones. Por favor, inténtelo de nuevo más tarde' });
        }

        res.json({ success: true, secciones});
        });
    });

// API: Obtener horarios por sección
router.get('/api/seccion/:seccionId/horario', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { seccionId } = req.params;

    const query = `
            SELECT 
                hs.id,
                hs.dia,
                hs.dia_num,
                hs.aula,
                hs.hora_inicio,
                hs.hora_cierre,
                pp.codigo_periodo AS periodo,
                pa.fecha_inicio,
                pa.fecha_fin
            FROM seccion s
            INNER JOIN horario_seccion hs ON s.id = hs.id_seccion
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN periodo_academico pa ON pp.codigo_periodo = pa.codigo
            WHERE s.id = ?;
    `;

    conexion.query(query, [seccionId], (error, horarios) => {
        if (error) {
            console.error('Error al obtener horarios:', error);
            return res.json({ success: false, message: 'Error al obtener horarios. Por favor, inténtelo de nuevo más tarde' });
        }
        
        res.json({ success: true, horarios});
    });
});


module.exports = router;