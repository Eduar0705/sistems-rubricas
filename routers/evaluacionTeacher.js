const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}
// Ruta principal de evaluaciones
router.get("/teacher/evaluacion", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const docenteCedula = req.session.cedula;
    const esAdmin = req.session.id_rol === 1;

    let query;
    let queryParams = [];

    if (esAdmin) {
        // Admin puede ver todas las evaluaciones
        query = `
            SELECT
                er.id,
                er.id_evaluacion,
                COALESCE(SUM(DISTINCT de.puntaje_obtenido),0) as puntaje_total,
                er.fecha_evaluado as fecha_evaluacion,
                er.observaciones,
                er.cedula_evaluado as estudiante_cedula,
                u.nombre AS estudiante_nombre,
                u.apeliido AS estudiante_apellido,
                r.nombre_rubrica,
                tr.nombre as tipo_evaluacion,
                SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion,
                r.instrucciones,
                e.competencias,
                m.nombre as materia_nombre,
                m.codigo as materia_codigo,
                c.nombre AS carrera_nombre,
                pp.codigo_periodo AS materia_semestre,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                IFNULL(GROUP_CONCAT(DISTINCT CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS seccion_horario,
                hs.aula AS seccion_aula,
                CASE
                    WHEN de.puntaje_obtenido IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
			FROM evaluacion e 
            INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            INNER JOIN tipo_rubrica tr ON r.id_tipo = tr.id
            INNER JOIN criterio_rubrica cr ON cr.rubrica_id = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
            INNER JOIN usuario_estudiante ue ON ins.cedula_estudiante = ue.cedula_usuario
            INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
            LEFT JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id  
            LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
            LEFT JOIN usuario ud ON ud.cedula = er.cedula_evaluador
            GROUP BY er.id
            ORDER BY er.fecha_evaluado DESC;
        `;
    } else {
        // Docente solo ve evaluaciones de secciones donde tiene permisos
        query = `
            SELECT
                er.id,
                er.id_evaluacion,
                COALESCE(SUM(DISTINCT de.puntaje_obtenido),0) as puntaje_total,
                er.fecha_evaluado as fecha_evaluacion,
                er.observaciones,
                er.cedula_evaluado as estudiante_cedula,
                u.nombre AS estudiante_nombre,
                u.apeliido AS estudiante_apellido,
                r.nombre_rubrica,
                tr.nombre as tipo_evaluacion,
                SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion,
                r.instrucciones,
                e.competencias,
                m.nombre as materia_nombre,
                m.codigo as materia_codigo,
                c.nombre AS carrera_nombre,
                pp.codigo_periodo AS materia_semestre,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                IFNULL(GROUP_CONCAT(DISTINCT CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS seccion_horario,
                hs.aula AS seccion_aula,
                CASE
                    WHEN de.puntaje_obtenido IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
			FROM evaluacion e 
            INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            INNER JOIN tipo_rubrica tr ON r.id_tipo = tr.id
            INNER JOIN criterio_rubrica cr ON cr.rubrica_id = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
            INNER JOIN usuario_estudiante ue ON ins.cedula_estudiante = ue.cedula_usuario
            INNER JOIN usuario u ON ue.cedula_usuario = u.cedula
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
            LEFT JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id  
            LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
            WHERE pd.docente_cedula = ?
            GROUP BY er.id
            ORDER BY er.fecha_evaluado DESC;
        `;
        queryParams = [docenteCedula];
    }

    conexion.query(query, queryParams, (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.render("teacher/evaluaciones", {
                datos: req.session, 
                title: 'SGR - Evaluaciones', 
                currentPage: 'evaluaciones',
                evaluaciones: [],
                error: 'Error al cargar las evaluaciones'
            });
        }

        const evaluacionesFormateadas = evaluaciones.map(ev => {
            const iniciales = (ev.estudiante_nombre.charAt(0) + ev.estudiante_apellido.charAt(0)).toUpperCase();
            const fecha = ev.fecha_evaluacion ? 
                new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : 'Pendiente';
            
            return {
                ...ev,
                iniciales,
                fecha_formateada: fecha,
                calificacion: ev.puntaje_total ? 
                    `${parseFloat(ev.puntaje_total).toFixed(1)}/100 (${(parseFloat(ev.puntaje_total) / 5).toFixed(1)}/20)` : 
                    '-/-'
            };
        });

        if (esAdmin) {
             res.render("teacher/evaluaciones", {
                datos: req.session, 
                title: 'SGR - Evaluaciones', 
                currentPage: 'evaluaciones',
                evaluaciones: evaluacionesFormateadas
            });
        } else {
            // Agrupar para docente: Carrera -> Semestre -> Materia -> Sección -> Rúbrica
            const evaluacionesAgrupadas = {};

            evaluacionesFormateadas.forEach(ev => {
                // Nivel 1: Carrera
                if (!evaluacionesAgrupadas[ev.carrera_nombre]) {
                    evaluacionesAgrupadas[ev.carrera_nombre] = {};
                }

                // Nivel 2: Semestre
                const semestreKey = `Semestre ${ev.materia_semestre}`;
                if (!evaluacionesAgrupadas[ev.carrera_nombre][semestreKey]) {
                    evaluacionesAgrupadas[ev.carrera_nombre][semestreKey] = {};
                }

                // Nivel 3: Materia
                if (!evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre]) {
                    evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre] = {};
                }

                // Nivel 4: Sección
                const seccionKey = `Sección ${ev.seccion_codigo}`;
                if (!evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre][seccionKey]) {
                    evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre][seccionKey] = {
                        info: {
                            horario: ev.seccion_horario,
                            aula: ev.seccion_aula
                        },
                        rubricas: {}
                    };
                }

                // Nivel 5: Rúbrica
                if (!evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre][seccionKey].rubricas[ev.nombre_rubrica]) {
                    evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre][seccionKey].rubricas[ev.nombre_rubrica] = [];
                }

                // Agregar evaluación
                evaluacionesAgrupadas[ev.carrera_nombre][semestreKey][ev.materia_nombre][seccionKey].rubricas[ev.nombre_rubrica].push(ev);
            });

            res.render("teacher/evaluaciones_docente", {
                datos: req.session, 
                title: 'SGR - Mis Evaluaciones', 
                currentPage: 'evaluaciones',
                evaluacionesGrouped: evaluacionesAgrupadas
            });
        }
    });
});

// API: Obtener carreras activas
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

// API: Obtener secciones por materia y carrera
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

// API: Obtener rúbricas activas
router.get('/api/rubricas/activas', (req, res) => {
    if(!req.session.login){
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
                				CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo
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
router.post('/api/evaluaciones/crear', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { rubrica_id, estudiantes, observaciones } = req.body;

    // Validaciones
    if (!rubrica_id || !estudiantes || estudiantes.length === 0) {
        return res.json({ 
            success: false, 
            message: 'Datos incompletos' 
        });
    }

    // Verificar que la rúbrica existe y está activa
    const queryVerificar = `SELECT 
                                r.id,
                                ru.id_eval
                            FROM rubrica r
                            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                            WHERE r.id = ? AND r.activo = 1`;
    
    conexion.query(queryVerificar, [rubrica_id], (error, results) => {
        if (error) {
            console.error('Error al verificar rúbrica:', error);
            return res.json({ 
                success: false, 
                message: 'Error al verificar rúbrica' 
            });
        }

        if (results.length === 0) {
            return res.json({ 
                success: false, 
                message: 'La rúbrica no existe o no está activa' 
            });
        }
        const id_eval = results.id_eval
        // Verificar que no existan evaluaciones duplicadas
        const queryDuplicados = `
            SELECT cedula_evaluado
            FROM evaluacion_realizada 
            WHERE id_evaluacion = ?
            AND cedula_evaluado IN (?)
        `;

        conexion.query(queryDuplicados, [id_eval, estudiantes], (error, duplicados) => {
            if (error) {
                console.error('Error al verificar duplicados:', error);
                return res.json({ 
                    success: false, 
                    message: 'Error al verificar duplicados' 
                });
            }

            if (duplicados.length > 0) {
                const cedulasDuplicadas = duplicados.map(d => d.cedula_evaluado);
                return res.json({ 
                    success: false, 
                    message: `Ya existen evaluaciones para algunos estudiantes. Cédulas: ${cedulasDuplicadas.join(', ')}` 
                });
            }

            // Insertar las evaluaciones
            const values = estudiantes.map(cedula => [
                id_eval,
                cedula,
                observaciones || null
            ]);

            const queryInsertar = `
                INSERT INTO evaluacion_realizada 
                (id_evaluacion, cedula_evaluado, observaciones) 
                VALUES ?
            `;

            conexion.query(queryInsertar, [values], (error, result) => {
                if (error) {
                    console.error('Error al crear evaluaciones:', error);
                    return res.json({ 
                        success: false, 
                        message: 'Error al crear las evaluaciones' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Evaluaciones creadas exitosamente',
                    cantidad: result.affectedRows
                });
            });
        });
    });
});

// API: Obtener secciones por carrera
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

        res.json({ success: true, secciones });
    });
});

// ============================
// APIs específicas para DOCENTE con permisos
// ============================

// Carreras visibles para el docente (según permisos de seccion)
router.get('/api/teacher/carreras', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;

    const query = `
        SELECT DISTINCT
            c.codigo,
            c.nombre,
            c.descripcion
        FROM permisos p
        INNER JOIN seccion s ON p.seccion_id = s.id AND s.activo = 1
        INNER JOIN materia m ON s.materia_codigo = m.codigo AND m.activo = 1
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo AND c.activo = 1
        WHERE p.docente_cedula = ?
          AND p.activo = 1
        ORDER BY c.nombre
    `;

    conexion.query(query, [docenteCedula], (error, carreras) => {
        if (error) {
            console.error('Error al obtener carreras (docente):', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras });
    });
});

// Materias de una carrera donde el docente tiene permisos
router.get('/api/teacher/carrera/:carreraCodigo/materias', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { carreraCodigo } = req.params;

    const query = `
        SELECT DISTINCT
            m.codigo,
            m.nombre,
            m.semestre,
            m.creditos
        FROM permisos p
        INNER JOIN seccion s ON p.seccion_id = s.id AND s.activo = 1
        INNER JOIN materia m ON s.materia_codigo = m.codigo AND m.activo = 1
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo AND c.activo = 1
        WHERE c.codigo = ?
          AND p.docente_cedula = ?
          AND p.activo = 1
        ORDER BY m.semestre, m.nombre
    `;

    conexion.query(query, [carreraCodigo, docenteCedula], (error, materias) => {
        if (error) {
            console.error('Error al obtener materias (docente):', error);
            return res.json({ success: false, message: 'Error al obtener materias' });
        }

        res.json({ success: true, materias });
    });
});

// Secciones de una materia donde el docente tiene permisos
router.get('/api/teacher/materia/:materiaCodigo/secciones', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { materiaCodigo } = req.params;

    const query = `
        SELECT DISTINCT
            s.id,
            s.codigo,
            s.horario,
            s.aula,
            s.capacidad_maxima
        FROM permisos p
        INNER JOIN seccion s ON p.seccion_id = s.id AND s.activo = 1
        INNER JOIN materia m ON s.materia_codigo = m.codigo AND m.activo = 1
        WHERE m.codigo = ?
          AND p.docente_cedula = ?
          AND p.activo = 1
        ORDER BY s.codigo
    `;

    conexion.query(query, [materiaCodigo, docenteCedula], (error, secciones) => {
        if (error) {
            console.error('Error al obtener secciones (docente):', error);
            return res.json({ success: false, message: 'Error al obtener secciones' });
        }

        res.json({ success: true, secciones });
    });
});

// Estudiantes de una sección donde el docente tiene permisos
router.get('/api/teacher/seccion/:seccionId/estudiantes', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { seccionId } = req.params;

    const query = `
        SELECT 
            e.cedula,
            e.nombre,
            e.apellido,
            e.email
        FROM estudiante e
        INNER JOIN inscripcion_seccion ins ON e.cedula = ins.estudiante_cedula
        INNER JOIN seccion s ON ins.seccion_id = s.id
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.activo = 1
        WHERE ins.seccion_id = ? 
          AND e.activo = 1 
          AND ins.estado = 'Inscrito'
          AND p.docente_cedula = ?
        ORDER BY e.apellido, e.nombre
    `;

    conexion.query(query, [seccionId, docenteCedula], (error, estudiantes) => {
        if (error) {
            console.error('Error al obtener estudiantes (docente):', error);
            return res.json({ success: false, message: 'Error al obtener estudiantes' });
        }
    });
});

// Rúbricas activas solo en secciones donde el docente tiene permisos
router.get('/api/teacher/rubricas/activas', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;

    const query = `
        SELECT DISTINCT
            r.id,
            r.nombre_rubrica,
            r.tipo_evaluacion,
            r.porcentaje_evaluacion,
            r.modalidad,
            r.cantidad_personas,
            r.seccion_id,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            s.codigo as seccion_codigo
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.activo = 1
        WHERE r.activo = 1
          AND m.activo = 1
          AND s.activo = 1
          AND p.docente_cedula = ?
        ORDER BY r.nombre_rubrica
    `;

    conexion.query(query, [docenteCedula], (error, rubricas) => {
        if (error) {
            console.error('Error al obtener rúbricas (docente):', error);
            return res.json({ success: false, message: 'Error al obtener rúbricas' });
        }

        res.json({ success: true, rubricas });
    });
});
router.get('/api/evaluacion_estudiante/:evaluacionId/:estudianteCedula/detalles', async (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        return res.status(401).json({ success: false, message: 'Por favor, inicia sesión para acceder a esta página.' });
    }

    const { evaluacionId, estudianteCedula } = req.params;
    console.log(evaluacionId, estudianteCedula)

    try {
        // =====================
        // 1. Obtener evaluación
        // =====================
        const evalSQL = `
            SELECT
                er.id,
                r.id as rubrica_id,
                er.cedula_evaluado as estudiante_cedula,
                er.observaciones,
                COALESCE(SUM(DISTINCT de.puntaje_obtenido),0) as puntaje_total,
                er.fecha_evaluado as fecha_evaluacion,
                r.nombre_rubrica,
                tr.nombre as tipo_evaluacion,
                SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion,
                r.instrucciones,
                e.competencias,
                m.nombre as materia_nombre,
                m.codigo as materia_codigo,
                CONCAT(ud.nombre, ' ', ud.apeliido) as profesor
            FROM evaluacion e
            INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            INNER JOIN tipo_rubrica tr ON r.id_tipo = tr.id
            INNER JOIN criterio_rubrica cr ON cr.rubrica_id = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            LEFT JOIN evaluacion_realizada er ON e.id = er.id_evaluacion
            LEFT JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id 
			LEFT JOIN usuario ud ON ud.cedula = er.cedula_evaluador
            WHERE er.cedula_evaluado = ? AND er.id_evaluacion = ?
            GROUP BY e.id
            ORDER BY er.fecha_evaluado DESC;
        `;
        const evalData = await query(evalSQL, [estudianteCedula, evaluacionId]);
        if (evalData.length === 0) {
            return sendError(res, 'Evaluación no encontrada');
        }

        const evaluacion = evalData[0];
        // =====================
        // 2. Obtener estudiante
        // =====================
        const estSQL = `
            SELECT 
                u.cedula,
                u.nombre,
                u.apeliido as apellido,
                u.email,
                c.nombre AS carrera
            FROM usuario u
            INNER JOIN usuario_estudiante ue ON u.cedula = ue.cedula_usuario
            INNER JOIN carrera c ON ue.codigo_carrera = c.codigo
            WHERE u.cedula = ?
        `;

        const estudiantes = await query(estSQL, [evaluacion.estudiante_cedula]);
        if (estudiantes.length === 0) return sendError(res, 'Estudiante no encontrado');

        const estudiante = estudiantes[0];

        // =====================
        // 3. Obtener criterios
        // =====================
        const criteriosSQL = `
            SELECT id, descripcion, puntaje_maximo, orden
            FROM criterio_rubrica
            WHERE rubrica_id = ?
            ORDER BY orden
        `;

        const criterios = await query(criteriosSQL, [evaluacion.rubrica_id]);
        if (criterios.length === 0) return sendError(res, 'No hay criterios configurados');


        // =====================
        // 4. Obtener niveles
        // =====================
        const criteriosIds = criterios.map(c => c.id);

        const nivelesSQL = `
            SELECT
                criterio_id, nombre_nivel,
                descripcion, puntaje_maximo AS puntaje, orden
            FROM nivel_desempeno
            WHERE criterio_id IN (?)
            ORDER BY criterio_id, orden
        `;
        const niveles = await query(nivelesSQL, [criteriosIds]);


        // =====================
        // 5. Obtener detalles guardados
        // =====================
        const detallesSQL = `
            SELECT
                de.id_criterio_detalle,
                de.orden_detalle AS nivel_seleccionado,
                de.puntaje_obtenido
            FROM detalle_evaluacion de 
            INNER JOIN evaluacion_realizada er ON de.evaluacion_r_id = er.id
            INNER JOIN evaluacion e ON er.id_evaluacion = e.id
            WHERE e.id = ? AND er.cedula_evaluado = ?
        `;

        const detalles = await query(detallesSQL, [evaluacionId, estudianteCedula]); 
        
        const detallesMap = {};
        detalles.forEach(d => {
            detallesMap[d.id_criterio_detalle] = {
                nivel_seleccionado: d.nivel_seleccionado,
                puntaje_obtenido: d.puntaje_obtenido
            };
        });

        // =====================
        // 6. Unir criterios + niveles + selección
        // =====================
        const criteriosFinal = criterios.map(c => {
            const nivelesCriterio = niveles
                .filter(n => n.criterio_id === c.id)
                .map(n => ({
                    id: n.orden,
                    nombre: n.nombre_nivel,
                    descripcion: n.descripcion,
                    puntaje: detallesMap[c.id]?.nivel_seleccionado === n.orden ? detallesMap[c.id]?.puntaje_obtenido : n.puntaje,
                    puntaje_maximo: n.puntaje,
                    orden: n.orden,
                    seleccionado: detallesMap[c.id]?.nivel_seleccionado === n.orden
                }));

            return {
                id: c.id,
                nombre: c.descripcion,
                descripcion: c.descripcion,
                puntaje_maximo: c.puntaje_maximo,
                orden: c.orden,
                niveles: nivelesCriterio
            };
        });


        // =====================
        // 7. Respuesta final
        // =====================
        return res.json({
            success: true,
            evaluacion: {
                id: evaluacion.id,
                rubrica_id: evaluacion.rubrica_id,
                estudiante_cedula: evaluacion.estudiante_cedula,
                observaciones: evaluacion.observaciones,
                puntaje_total: evaluacion.puntaje_total,
                fecha_evaluacion: evaluacion.fecha_evaluacion
            },
            estudiante,
            rubrica: {
                nombre_rubrica: evaluacion.nombre_rubrica,
                tipo_evaluacion: evaluacion.tipo_evaluacion,
                porcentaje_evaluacion: evaluacion.porcentaje_evaluacion,
                instrucciones: evaluacion.instrucciones,
                competencias: evaluacion.competencias,
                materia: evaluacion.materia_nombre,
                materia_codigo: evaluacion.materia_codigo
            },
            criterios: criteriosFinal
        });

    } catch (err) {
        return res.json({success: false, message: 'Error al obtener la evaluación', err});
    }
});
// Crear evaluaciones solo para rúbricas/secciones donde el docente tiene permisos
router.post('/api/teacher/evaluaciones/crear', (req, res) => {
    if (!req.session.login) {
        return res.json({ success: false, message: 'No autorizado' });
    }

    const docenteCedula = req.session.cedula;
    const { rubrica_id, estudiantes, observaciones } = req.body;

    if (!rubrica_id || !estudiantes || estudiantes.length === 0) {
        return res.json({
            success: false,
            message: 'Datos incompletos'
        });
    }

    const queryVerificar = `
        SELECT r.id
        FROM rubrica_evaluacion r
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN permisos p ON p.seccion_id = s.id AND p.activo = 1
        WHERE r.id = ?
          AND r.activo = 1
          AND p.docente_cedula = ?
    `;

    conexion.query(queryVerificar, [rubrica_id, docenteCedula], (error, results) => {
        if (error) {
            console.error('Error al verificar rúbrica (docente):', error);
            return res.json({
                success: false,
                message: 'Error al verificar rúbrica'
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'La rúbrica no existe, no está activa o no pertenece a una sección asignada al docente'
            });
        }

        const queryDuplicados = `
            SELECT estudiante_cedula 
            FROM evaluacion_estudiante 
            WHERE rubrica_id = ? 
            AND estudiante_cedula IN (?)
        `;

        conexion.query(queryDuplicados, [rubrica_id, estudiantes], (error, duplicados) => {
            if (error) {
                console.error('Error al verificar duplicados (docente):', error);
                return res.json({
                    success: false,
                    message: 'Error al verificar duplicados'
                });
            }

            if (duplicados.length > 0) {
                const cedulasDuplicadas = duplicados.map(d => d.estudiante_cedula);
                return res.json({
                    success: false,
                    message: `Ya existen evaluaciones para algunos estudiantes. Cédulas: ${cedulasDuplicadas.join(', ')}`
                });
            }

            const values = estudiantes.map(cedula => [
                rubrica_id,
                cedula,
                observaciones || null
            ]);

            const queryInsertar = `
                INSERT INTO evaluacion_estudiante 
                (rubrica_id, estudiante_cedula, observaciones) 
                VALUES ?
            `;

            conexion.query(queryInsertar, [values], (error, result) => {
                if (error) {
                    console.error('Error al crear evaluaciones (docente):', error);
                    return res.json({
                        success: false,
                        message: 'Error al crear las evaluaciones'
                    });
                }

                res.json({
                    success: true,
                    message: 'Evaluaciones creadas exitosamente',
                    cantidad: result.affectedRows
                });
            });
        });
    });
});

module.exports = router;