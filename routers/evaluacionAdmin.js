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
            pendientes,
            fecha_evaluacion,
            id_horario,
            CASE
                WHEN rubrica_id IS NULL THEN 'Pendiente'
                WHEN rubrica_id IS NOT NULL AND total_evaluaciones=completadas THEN 'Completada'
                ELSE 'En Progreso'
            END as estado
        FROM
        (
                SELECT 
                    e.id AS evaluacion_id,
                    e.contenido AS contenido_evaluacion,
                    r.id AS rubrica_id,
                    IFNULL(r.nombre_rubrica, 'Sin rubrica') AS nombre_rubrica,
                    e.ponderacion as valor,
                    u.cedula as docente_cedula,
                    u.nombre as docente_nombre,
                    u.apeliido as docente_apellido,
                    m.nombre as materia_nombre,
                    c.nombre as carrera_nombre,
                    COUNT(e.id) AS total_evaluaciones,
                    CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                    COUNT(eval_est.id) AS completadas,
                    SUM(CASE WHEN eval_est.id IS NULL THEN 1 ELSE 0 END) AS pendientes,
                    e.fecha_evaluacion,
                    e.id_horario,
                    s.id AS id_seccion
                FROM evaluacion e
                LEFT JOIN rubrica_uso ru ON e.id = ru.id_eval
                LEFT JOIN rubrica r ON ru.id_rubrica = r.id
                INNER JOIN seccion s ON e.id_seccion = s.id
                INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                INNER JOIN materia m ON pp.codigo_materia = m.codigo
                INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
                INNER JOIN
                    (
                            SELECT 
                                COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
                                ins.id_seccion
                            FROM inscripcion_seccion ins
                            GROUP BY ins.id_seccion
                        ) AS estud_sec on s.id = estud_sec.id_seccion
                INNER JOIN permiso_docente pd ON estud_sec.id_seccion = pd.id_seccion
                INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
                INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                        LEFT JOIN 
                        (
                            SELECT 
                                er.id,
                                er.id_evaluacion,
                                SUM(de.puntaje_obtenido) AS puntaje_eval
                            FROM evaluacion_realizada er 
                            INNER JOIN detalle_evaluacion de ON er.id = de.evaluacion_r_id
                            GROUP BY er.id
                        ) AS eval_est ON eval_est.id_evaluacion = e.id
                GROUP BY e.id
                ORDER BY e.fecha_evaluacion DESC
        ) AS todo;
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
            
            // Formato del estado con contadores
            let estadoFormateado = ev.estado;
            
            return {
                ...ev,
                fecha_formateada: fecha,
                estado_formateado: estadoFormateado
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
router.get('/api/materia/:materiaCodigo/secciones', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { materiaCodigo } = req.params;

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
        INNER JOIN inscripcion_seccion ins ON s.id = ins.id_seccion
        WHERE pp.codigo_materia = ? AND s.activo = 1
        GROUP BY s.id
        ORDER BY codigo;
    `;

    conexion.query(query, [materiaCodigo], (error, secciones) => {
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
        fecha_evaluacion, id_horario, id_seccion, cant_personas, 
        contenido, competencias, instrumentos, porcentaje, estrategias_eval 
    } = req.body;

    // 1. Validaciones iniciales
    if (!fecha_evaluacion || !id_horario || !id_seccion || !estrategias_eval || estrategias_eval.length === 0) {
        return res.json({ success: false, message: 'Datos incompletos' });
    }

    // 2. Verificar duplicados (Usando el pool directamente)
    const queryDuplicados = `SELECT id FROM evaluacion WHERE fecha_evaluacion = ? AND id_horario = ?`;
    
    conexion.query(queryDuplicados, [fecha_evaluacion, id_horario], (error, duplicados) => {
        if (error) {
            console.error('Error duplicados:', error);
            return res.json({ success: false, message: 'Error al verificar disponibilidad' });
        }

        if (duplicados.length > 0) {
            return res.json({ success: false, message: 'Ya existe una evaluación en este horario' });
        }

        // 3. Obtener conexión para Transacción
        conexion.getConnection((err, conn) => {
            if (err) return res.json({ success: false, message: 'Error de conexión' });

            conn.beginTransaction((err) => {
                if (err) { conn.release(); return res.json({ success: false, message: 'Error de transacción' }); }

                const insertEval = `INSERT INTO evaluacion (id_horario, ponderacion, cantidad_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const valoresEval = [id_horario, porcentaje, cant_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion];

                conn.query(insertEval, valoresEval, (err, result) => {
                    if (err) {
                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al crear evaluación' }); });
                    }

                    const eval_id = result.insertId;

                    // 4. Inserción Múltiple (Mucho más eficiente que un loop)
                    const valoresEstrategias = estrategias_eval.map(estId => [estId, eval_id]);
                    const insertEstrategias = `INSERT INTO estrategia_empleada (id_estrategia, id_eval) VALUES ?`;

                    conn.query(insertEstrategias, [valoresEstrategias], (err) => {
                        if (err) {
                            return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar estrategias' }); });
                        }

                        // 5. Finalizar
                        conn.commit((err) => {
                            if (err) {
                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al confirmar' }); });
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
router.post('/api/evaluaciones/crear_fuera_de_horario', express.json(), (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { 
        fecha_evaluacion, id_horario, id_seccion, cant_personas, 
        contenido, competencias, instrumentos, porcentaje, estrategias_eval 
    } = req.body;

    // 1. Validaciones iniciales
    if (!fecha_evaluacion || !id_horario || !id_seccion || !estrategias_eval || estrategias_eval.length === 0) {
        return res.json({ success: false, message: 'Datos incompletos' });
    }

    // 2. Verificar duplicados (Usando el pool directamente)
    const queryDuplicados = `SELECT id FROM evaluacion WHERE fecha_evaluacion = ? AND id_horario = ?`;
    
    conexion.query(queryDuplicados, [fecha_evaluacion, id_horario], (error, duplicados) => {
        if (error) {
            console.error('Error duplicados:', error);
            return res.json({ success: false, message: 'Error al verificar disponibilidad' });
        }

        if (duplicados.length > 0) {
            return res.json({ success: false, message: 'Ya existe una evaluación en este horario' });
        }

        // 3. Obtener conexión para Transacción
        conexion.getConnection((err, conn) => {
            if (err) return res.json({ success: false, message: 'Error de conexión' });

            conn.beginTransaction((err) => {
                if (err) { conn.release(); return res.json({ success: false, message: 'Error de transacción' }); }

                const insertEval = `INSERT INTO evaluacion (id_horario, ponderacion, cantidad_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const valoresEval = [id_horario, porcentaje, cant_personas, contenido, competencias, instrumentos, fecha_evaluacion, id_seccion];

                conn.query(insertEval, valoresEval, (err, result) => {
                    if (err) {
                        return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al crear evaluación' }); });
                    }

                    const eval_id = result.insertId;

                    // 4. Inserción Múltiple (Mucho más eficiente que un loop)
                    const valoresEstrategias = estrategias_eval.map(estId => [estId, eval_id]);
                    const insertEstrategias = `INSERT INTO estrategia_empleada (id_estrategia, id_eval) VALUES ?`;

                    conn.query(insertEstrategias, [valoresEstrategias], (err) => {
                        if (err) {
                            return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al insertar estrategias' }); });
                        }

                        // 5. Finalizar
                        conn.commit((err) => {
                            if (err) {
                                return conn.rollback(() => { conn.release(); res.json({ success: false, message: 'Error al confirmar' }); });
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
// API: Obtener carreras activas (duplicado, pero lo mantengo por compatibilidad)
router.get('/api/carreras', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT codigo, nombre, descripcion
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
            return res.json({ success: false, message: 'Error al obtener secciones' });
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
            LEFT JOIN evaluacion e ON hs.id = e.id_horario
            WHERE s.id = ?;
    `;

    conexion.query(query, [seccionId], (error, horarios) => {
        if (error) {
            console.error('Error al obtener horarios:', error);
            return res.json({ success: false, message: 'Error al obtener secciones' });
        }
        
        res.json({ success: true, horarios});
    });
});


module.exports = router;