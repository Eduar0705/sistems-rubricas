const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');
//const periodo_academico = 

// ============================================================
// LISTAR RÚBRICAS
// ============================================================
router.get("/admin/rubricas", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const query = `
        SELECT
                				r.id,
                                r.nombre_rubrica,
                				e.fecha_evaluacion,
                				r.fecha_creacion,
	               				GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                                e.ponderacion AS porcentaje_evaluacion,
                                r.activo,
                                m.nombre AS materia_nombre,
                				m.codigo AS materia_codigo,
                				CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                				CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
                            FROM rubrica r
                            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                            INNER JOIN evaluacion e ON ru.id_eval = e.id
                			INNER JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
                            INNER JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
                            INNER JOIN seccion s ON e.id_seccion = s.id
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN materia m ON pp.codigo_materia = m.codigo
                            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
                			INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
                			INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                            WHERE r.activo = 1 AND u.activo = 1
                            GROUP BY r.id
                            ORDER BY fecha_creacion DESC;
    `;

    connection.query(query, (error, rubricas) => {
        if(error) {
            console.error('Error al obtener rúbricas:', error);
            return res.render("admin/rubricas", {
                datos: req.session,
                title: 'SGR - Rúbricas',
                rubricas: [],
                currentPage: 'rubricas'
            });
        }

        res.render("admin/rubricas", {
            datos: req.session,
            title: 'SGR - Rúbricas',
            rubricas: rubricas,
            currentPage: 'rubricas'
        });
    });
});

// ============================================================
// VER DETALLE DE RÚBRICA (PARA IMPRIMIR)
// ============================================================
router.get("/admin/rubricas/detalle/:id", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const rubricaId = req.params.id;

    const queryRubrica = `
        SELECT
            r.id,
            r.nombre_rubrica,
            r.cedula_docente AS docente_cedula,
            m.codigo AS materia_id,
            s.letra AS seccion_id,
            pp.codigo_periodo AS lapso_academico,
            e.fecha_evaluacion,
            (SELECT SUM(puntaje_maximo) 
            FROM criterio_rubrica cr_sub 
            WHERE cr_sub.rubrica_id = r.id) AS porcentaje_evaluacion,
            GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
            e.competencias,
            r.instrucciones,
            CASE
                WHEN cantidad_personas=1 THEN 'Individual'
                WHEN cantidad_personas=2 THEN 'En Pareja'
                ELSE 'Grupal'
            END AS modalidad,
            e.cantidad_personas,
            r.activo,
            r.fecha_creacion AS created_at,
            r.fecha_actualizacion AS updated_at,
            m.nombre AS materia_nombre,
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
            c.nombre AS carrera_nombre,
            CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
        FROM evaluacion e
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON r.id = ru.id_rubrica
        INNER JOIN seccion s ON e.id_seccion = s.id
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
        INNER JOIN usuario_docente ud ON ud.cedula_usuario = r.cedula_docente
        INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
        LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
        LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
        WHERE r.id = ?
        GROUP BY r.id;
    `;

    const queryCriterios = `
        SELECT
            cr.id,
            cr.descripcion,
            cr.puntaje_maximo,
            cr.orden
        FROM criterio_rubrica cr
        WHERE cr.rubrica_id = ?
        ORDER BY cr.orden
    `;

    const queryNiveles = `
        SELECT
            n.criterio_id,
            n.nombre_nivel,
            n.descripcion,
            n.puntaje_maximo AS puntaje,
            n.orden
        FROM nivel_desempeno n
        INNER JOIN criterio_rubrica cr ON n.criterio_id = cr.id
        WHERE cr.rubrica_id = ?
        ORDER BY cr.orden, n.orden DESC;
    `;

    connection.query(queryRubrica, [rubricaId], (error, rubrica) => {
        if(error || rubrica.length === 0) {
            return res.status(404).json({ success: false, message: 'Rúbrica no encontrada' });
        }

        connection.query(queryCriterios, [rubricaId], (error, criterios) => {
            if(error) {
                return res.status(500).json({ success: false, message: 'Error al obtener criterios' });
            }

            connection.query(queryNiveles, [rubricaId], (error, niveles) => {
                if(error) {
                    return res.status(500).json({ success: false, message: 'Error al obtener niveles' });
                }

                const criteriosConNiveles = criterios.map(criterio => ({
                    ...criterio,
                    niveles: niveles.filter(nivel => nivel.criterio_id === criterio.id)
                }));

                res.json({
                    success: true,
                    rubrica: rubrica[0],
                    criterios: criteriosConNiveles
                });
            });
        });
    });
});

// ============================================================
// OBTENER DATOS PARA EDITAR RÚBRICA
// ============================================================
router.get('/admin/rubricas/editar/:id', (req, res) => {
    const { id } = req.params;
    
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const esAdmin = req.session.id_rol === 1;
    
    let queryRubrica;
    let paramsRubrica;
    
    if(esAdmin) {
        queryRubrica = `
            SELECT 
                r.id,
                e.id AS evaluacion_id,
                r.nombre_rubrica AS nombre_rubrica,
                tr.id AS id_tipo,
                IFNULL(tr.nombre, 'Tipo no asignado') AS tipo_rubrica,
                u.cedula as docente_cedula,
            	m.codigo AS materia_codigo,
            	s.id AS seccion_id,
            	pp.codigo_periodo AS lapso_academico,
                e.fecha_evaluacion,
                (SELECT 
                 	SUM(puntaje_maximo) 
                FROM criterio_rubrica cr_sub 
                WHERE cr_sub.rubrica_id = r.id) AS porcentaje_evaluacion,
                GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
            	e.contenido AS contenido_evaluacion,
                e.competencias,
            	e.instrumentos,
                r.instrucciones,
                CASE
                    WHEN cantidad_personas=1 THEN 'Individual'
                    WHEN cantidad_personas=2 THEN 'En Pareja'
                    ELSE 'Grupal'
                END AS modalidad,
                e.cantidad_personas,
                r.activo,
                r.fecha_creacion AS created_at,
                r.fecha_actualizacion AS updated_at,
                m.nombre AS materia_nombre,
            	s.id AS id_seccion,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
            INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval
            INNER JOIN rubrica r ON ru.id_rubrica = r.id
            LEFT JOIN (
                SELECT 
                    COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
                    ins.id_seccion
                FROM inscripcion_seccion ins
                GROUP BY ins.id_seccion
            ) AS estud_sec ON s.id = estud_sec.id_seccion
            LEFT JOIN tipo_rubrica tr ON r.id_tipo = tr.id
            LEFT JOIN horario_eval he ON e.id = he.id_eval
            LEFT JOIN horario_eval_clandestina hec ON e.id = hec.id_eval
            LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
        	LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
            WHERE r.id = ? AND r.activo = 1
            GROUP BY r.id
            ORDER BY fecha_evaluacion DESC;
        `;
        paramsRubrica = [id];
    } else {
        queryRubrica = `
        SELECT 
                r.id,
                e.id AS evaluacion_id,
                r.nombre_rubrica AS nombre_rubrica,
                u.cedula as docente_cedula,
            	m.codigo AS materia_id,
            	s.id AS seccion_id,
            	pp.codigo_periodo AS lapso_academico,
                e.fecha_evaluacion,
                (SELECT 
                 	SUM(puntaje_maximo) 
                FROM criterio_rubrica cr_sub 
                WHERE cr_sub.rubrica_id = r.id) AS porcentaje_evaluacion,
                GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
            	e.contenido AS contenido_evaluacion,
                e.competencias,
            	e.instrumentos,
                r.instrucciones,
                CASE
                    WHEN cantidad_personas=1 THEN 'Individual'
                    WHEN cantidad_personas=2 THEN 'En Pareja'
                    ELSE 'Grupal'
                END AS modalidad,
                e.cantidad_personas,
                r.activo,
                r.fecha_creacion AS created_at,
                r.fecha_actualizacion AS updated_at,
                m.nombre AS materia_nombre,
            	s.id AS id_seccion,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
            FROM evaluacion e
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            INNER JOIN usuario_docente ud ON ud.cedula_usuario = pd.docente_cedula
            INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval
            INNER JOIN rubrica r ON ru.id_rubrica = r.id
            LEFT JOIN (
                SELECT 
                    COUNT(DISTINCT ins.cedula_estudiante) AS cantidad_en_seccion, 
                    ins.id_seccion
                FROM inscripcion_seccion ins
                GROUP BY ins.id_seccion
            ) AS estud_sec ON s.id = estud_sec.id_seccion
            LEFT JOIN horario_eval he ON e.id = he.id_eval
            LEFT JOIN horario_eval_clandestina hec ON e.id = hec.id_eval
            LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
        	LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
            WHERE r.id = ? AND r.activo = 1
            AND pd.docente_cedula = ?
            GROUP BY r.id
            ORDER BY fecha_evaluacion DESC;
        `;
        paramsRubrica = [id, req.session.cedula];
    }

    connection.query(queryRubrica, paramsRubrica, (error, rubricaResult) => {
        if(error) {
            console.error('Error al obtener rúbrica:', error);
            return res.json({ success: false, message: 'Error al obtener la rúbrica' });
        }

        if(rubricaResult.length === 0) {
            return res.json({ success: false, message: 'Rúbrica no encontrada o sin permisos' });
        }

        const rubrica = rubricaResult[0];

        // Consulta para obtener las estrategias de la evaluación
        const queryEstrategias = `
            SELECT eeval.* 
            FROM estrategia_eval eeval
            INNER JOIN estrategia_empleada eemp ON eeval.id = eemp.id_estrategia
            WHERE eemp.id_eval = ?
        `;

        connection.query(queryEstrategias, [rubrica.evaluacion_id], (error, estrategias) => {
            if(error) {
                console.error('Error al obtener estrategias:', error);
                return res.json({ success: false, message: 'Error al obtener estrategias' });
            }

            // Añadir las estrategias a la rúbrica
            rubrica.estrategias = estrategias;

            const queryCriterios = `
                SELECT
                    cr.id,
                    cr.descripcion,
                    cr.puntaje_maximo,
                    cr.orden
                FROM criterio_rubrica cr
                WHERE cr.rubrica_id = ?
                ORDER BY cr.orden
            `;

            connection.query(queryCriterios, [id], (error, criterios) => {
                if(error) {
                    console.error('Error al obtener criterios:', error);
                    return res.json({ success: false, message: 'Error al obtener criterios' });
                }

                const queryNiveles = `
                    SELECT
                        n.criterio_id,
                        n.nombre_nivel,
                        n.descripcion,
                        n.puntaje_maximo AS puntaje,
                        n.orden
                    FROM nivel_desempeno n
                    INNER JOIN criterio_rubrica cr ON n.criterio_id = cr.id
                    WHERE n.criterio_id IN (?)
                    ORDER BY cr.orden, n.orden DESC;
                `;

                const criteriosIds = criterios.map(c => c.id);

                if(criteriosIds.length === 0) {
                    return res.json({
                        success: true,
                        rubrica: rubrica,
                        criterios: []
                    });
                }

                connection.query(queryNiveles, [criteriosIds], (error, niveles) => {
                    if(error) {
                        console.error('Error al obtener niveles:', error);
                        return res.json({ success: false, message: 'Error al obtener niveles' });
                    }

                    const criteriosConNiveles = criterios.map(criterio => ({
                        ...criterio,
                        niveles: niveles.filter(n => n.criterio_id === criterio.id)
                    }));

                    res.json({
                        success: true,
                        rubrica: rubrica,
                        criterios: criteriosConNiveles
                    });
                });
            });
        });
    });
});

// ============================================================
// OBTENER CARRERA Y SEMESTRE DE UNA MATERIA
// ============================================================
router.get('/admin/rubricas/carrera-materia/:materia_codigo', (req, res) => {
    const { materia_codigo } = req.params;
    
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    //PENDIENTE: ENCONTRAR LA MANERA DE SELECCIONAR DINAMICAMENTE EL PERIODO ACTUAL
    const query = `
        SELECT 
            pp.codigo_carrera AS carrera_codigo, 
            num_semestre AS semestre 
        FROM materia m 
        INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
        INNER JOIN periodo_academico pa ON pp.codigo_periodo = pa.codigo
        WHERE m.codigo = ?;
    `;
    
    connection.query(query, [materia_codigo], (error, results) => {
        if(error) {
            console.error('Error:', error);
            return res.json({ success: false, message: 'Error al obtener información' });
        }
        
        if(results.length === 0) {
            return res.json({ success: false, message: 'Materia no encontrada' });
        }
        
        res.json({
            success: true,
            carrera_codigo: results[0].carrera_codigo,
            semestre: results[0].semestre
        });
    });
});

// ============================================================
// OBTENER CARRERAS
// ============================================================
router.get('/admin/carreras', (req, res) => {
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    
    const esAdmin = req.session.id_rol === 1;
    let query;
    let params = [];
    
    if(esAdmin) {
        query = `
            SELECT
                c.codigo,
                c.nombre,
                ROUND(AVG(PERIOD_DIFF(DATE_FORMAT(pa.fecha_fin, '%Y%m'),DATE_FORMAT(pa.fecha_inicio, '%Y%m')
                ))) AS duracion_semestres
            FROM carrera c 
            INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
            INNER JOIN periodo_academico pa ON pp.codigo_periodo = pa.codigo
            GROUP BY c.codigo;
        `;
    } else {
        query = `
            SELECT
                c.codigo,
                c.nombre,
                ROUND(AVG(PERIOD_DIFF(DATE_FORMAT(pa.fecha_fin, '%Y%m'),DATE_FORMAT(pa.fecha_inicio, '%Y%m')
                ))) AS duracion_semestres
            FROM carrera c 
            INNER JOIN plan_periodo pp ON c.codigo = pp.codigo_carrera
            INNER JOIN seccion s ON pp.id = s.id_materia_plan
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            INNER JOIN periodo_academico pa ON pp.codigo_periodo = pa.codigo
            WHERE pd.docente_cedula = ?
            GROUP BY c.codigo;
        `;
        params = [req.session.cedula];
    }
    
    connection.query(query, params, (error, carreras) => {
        if(error) {
            console.error('Error:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }
        
        res.json({ success: true, carreras: carreras });
    });
});

// ============================================================
// OBTENER MATERIAS Y SECCIONES (PARA EL MODAL)
// ============================================================
router.get('/admin/opciones', (req, res) => {
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const esAdmin = req.session.id_rol === 1;
    
    let queryMaterias;
    let paramsMaterias = [];
    
    if(esAdmin) {
        queryMaterias = `
            SELECT
                m.codigo,
                m.nombre
            FROM materia m
            ORDER BY m.nombre;
        `;
    } else {
        queryMaterias = `
            SELECT
                m.codigo,
                m.nombre
            FROM materia m
            INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
            INNER JOIN seccion s ON pp.id = s.id_materia_plan
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            WHERE pd.docente_cedula = ?
            GROUP BY m.codigo
            ORDER BY m.nombre;
        `;
        paramsMaterias = [req.session.cedula];
    }

    connection.query(queryMaterias, paramsMaterias, (error, materias) => {
        if(error) {
            console.error('Error al obtener materias:', error);
            return res.json({ success: false, message: 'Error al obtener materias' });
        }

        let querySecciones;
        let paramsSecciones = [];
        //VERIFICAR RESPUESTA DE ID
        if(esAdmin) {
            querySecciones = `
            SELECT
                s.id_materia_plan AS id,
                s.letra,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, '-', s.letra) AS codigo,
                pp.codigo_materia AS materia_codigo,
                pp.codigo_periodo AS lapso_academico
            FROM seccion s
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            GROUP BY codigo, lapso_academico
            ORDER BY codigo;
            `;
        } else {
            querySecciones = `
            SELECT
                s.id_materia_plan AS id,
                s.letra,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, '-', s.letra) AS codigo,
                pp.codigo_materia AS materia_codigo,
                pp.codigo_periodo AS lapso_academico
            FROM seccion s
            INNER JOIN permiso_docente pd ON pd.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            WHERE pd.docente_cedula = ?
            GROUP BY codigo, lapso_academico
            ORDER BY codigo;
            `;
            paramsSecciones = [req.session.cedula];
        }

        connection.query(querySecciones, paramsSecciones, (error, secciones) => {
            if(error) {
                console.error('Error al obtener secciones:', error);
                return res.json({ success: false, message: 'Error al obtener secciones' });
            }

            res.json({
                success: true,
                materias: materias,
                secciones: secciones
            });
        });
    });
});

// ============================================================
// OBTENER PROFESORES ÚNICOS
// ============================================================
router.get("/admin/rubricas/profesores", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT 
            CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
        FROM usuario_docente ud
        INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
        WHERE u.activo = 1
        ORDER BY docente_nombre
    `;

    connection.query(query, (error, profesores) => {
        if(error) {
            console.error('Error al obtener profesores:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        res.json({
            success: true,
            profesores: profesores
        });
    });
});

router.get("/admin/tipos_rubrica/", (req, res) => {
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({error: 'No autorizado'})
    }
    const queryTipoRubricas = `
        SELECT 
            id,
            nombre
        FROM tipo_rubrica
        GROUP BY nombre
        ORDER BY nombre
        `
    connection.query(queryTipoRubricas, (error, tipos_r) => {
            if (error) {
                console.error('Error al obtener tipos de rubrica:', error);
                return res.status(500).json({error: 'Error al obtener tipos de rubrica'})
            } else {
                return res.json(tipos_r);
            }
        })
    });
// ============================================================
// APIs PARA SELECCIÓN JERÁRQUICA
// ============================================================
//BUSCAR EVALUACIONES EN LA SECCION CON O SIN RUBRICA
router.get("/admin/evaluaciones_con_rubrica/:seccionId", function (req, res) {
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
            INNER JOIN rubrica_uso ru ON e.id = ru.id_eval
            INNER JOIN rubrica r ON ru.id_rubrica = r.id
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
            LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
            LEFT JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
            GROUP BY e.id
        ) AS todo
        WHERE id_seccion = ?
        ORDER BY fecha_evaluacion DESC;
        `;
    connection.query(query, [seccionId], (error, evaluaciones) => {
        if (error) {
            console.error('Error al obtener evaluaciones:', error);
            return res.json({ success: false, message: 'Error al obtener evaluaciones' });
        }
        res.json({ success: true, evaluaciones });
    });
});
// Obtener semestres por carrera
router.get("/api/admin/semestres/:carrera", (req, res) => {
    const { carrera } = req.params;
    
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    const esAdmin = req.session.id_rol === 1;
    let query, params;
    
    if(esAdmin) {
        query = `
        SELECT
            DISTINCT pp.num_semestre AS semestre
        FROM plan_periodo pp
        WHERE pp.codigo_carrera = ?
        ORDER BY semestre
        `;
        params = [carrera];
    } else {
        query = `
            SELECT 
                DISTINCT pp.num_semestre AS semestre
            FROM plan_periodo pp
            INNER JOIN seccion s ON pp.id = s.id_materia_plan
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            WHERE pp.codigo_carrera = ?
            AND pd.docente_cedula = ?
            ORDER BY semestre;
        `;
        params = [carrera, req.session.cedula];
    }
    
    connection.query(query, params, (error, results) => {
        if(error) {
            console.error('Error al obtener semestres:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        res.json(results.map(r => r.semestre));
    });
});

// Obtener materias por carrera y semestre
router.get("/api/admin/materias/:carrera/:semestre", (req, res) => {
    const { carrera, semestre } = req.params;
    
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    const esAdmin = req.session.id_rol === 1;
    let query, params;
    
    if(esAdmin) {
        query = `
            SELECT
                m.codigo, 
                m.nombre, 
                pp.num_semestre AS semestre,
                pp.unidades_credito AS creditos
            FROM materia m
            INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
            WHERE pp.codigo_carrera = ?
            AND pp.num_semestre = ?
            ORDER BY nombre
        `;
        params = [carrera, semestre];
    } else {
        query = `
            SELECT
                m.codigo, 
                m.nombre, 
                pp.num_semestre AS semestre,
                pp.unidades_credito AS creditos
            FROM materia m
            INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
            INNER JOIN seccion s ON pp.id = s.id_materia_plan
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            WHERE pp.codigo_carrera = ?
            AND pp.num_semestre = ?
            AND pd.docente_cedula = ?
            ORDER BY nombre;
        `;
        params = [carrera, semestre, req.session.cedula];
    }
    
    connection.query(query, params, (error, results) => {
        if(error) {
            console.error('Error al obtener materias:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// Obtener secciones por materia
router.get("/api/admin/secciones/:materia", (req, res) => {
    const { materia } = req.params;
    
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    
    const esAdmin = req.session.id_rol === 1;
    let query, params;
    
    if(esAdmin) {
        query = `
            SELECT
                s.id_materia_plan AS id,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, '-', s.letra) AS codigo,
                pp.codigo_periodo AS lapso_academico,
                s.letra,
                IFNULL(GROUP_CONCAT(DISTINCT CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ' (', hs.aula, ')', ')') SEPARATOR ', '), 'No encontrado') AS horario,
                hs.aula,
                s.capacidad_maxima,
                u.nombre AS docente_nombre,
                u.apeliido AS docente_apellido
            FROM seccion s
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
            INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
            INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
            WHERE pp.codigo_materia = ?
            GROUP BY codigo, lapso_academico
            ORDER BY codigo;
        `;
        params = [materia];
    } else {
        query = `
            SELECT
                s.id_materia_plan AS id,
                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, '-', s.letra) AS codigo,
                pp.codigo_periodo AS lapso_academico,
                s.letra,
                IFNULL(GROUP_CONCAT(CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS horario,
                hs.aula,
                s.capacidad_maxima,
                u.nombre AS docente_nombre,
                u.apeliido AS docente_apellido
            FROM seccion s
          	INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
            LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
            INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
            INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
            WHERE pp.codigo_materia = ?
            AND pd.docente_cedula = ?
            GROUP BY codigo, lapso_academico
            ORDER BY codigo;
        `;
        params = [materia, req.session.cedula];
    }
    
    connection.query(query, params, (error, results) => {
        if(error) {
            console.error('Error al obtener secciones:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});

module.exports = router;