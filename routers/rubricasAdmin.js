const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');
const periodo_academico = 

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
                				s.letra AS seccion_codigo,
                				CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
                            FROM rubrica r
                            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                            INNER JOIN evaluacion e ON ru.id_eval = e.id
                			INNER JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
                            INNER JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
                            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN materia m ON pp.codigo_materia = m.codigo
                            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan AND s.letra = pd.letra_sec
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
        INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
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
            CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
        FROM evaluacion e
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON r.id = ru.id_rubrica
        INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
        INNER JOIN usuario_docente ud ON ud.cedula_usuario = r.cedula_docente
        INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
        LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
        LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
        WHERE r.id = ? AND r.activo = 1
        GROUP BY r.id;
        `;
        paramsRubrica = [id];
    } else {
        queryRubrica = `
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
            CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
        FROM evaluacion e
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON r.id = ru.id_rubrica
        INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
        INNER JOIN permiso_docente pd ON pd.id_materia_plan = s.id_materia_plan AND pd.letra_sec = s.letra
        INNER JOIN plan_periodo pp ON pd.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
        INNER JOIN usuario_docente ud ON ud.cedula_usuario = r.cedula_docente
        INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
        LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
        LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
        WHERE r.id = ?
        AND pd.docente_cedula = ?
        AND r.activo = 1
        GROUP BY r.id
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
        WHERE m.codigo = ?
        AND pa.codigo = '2025-1';
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
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
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
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
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
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
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

// ============================================================
// APIs PARA SELECCIÓN JERÁRQUICA
// ============================================================

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
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
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
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
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
                IFNULL(GROUP_CONCAT(CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS horario,
                hs.aula,
                s.capacidad_maxima,
                u.nombre AS docente_nombre,
                u.apeliido AS docente_apellido
            FROM seccion s
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
            LEFT JOIN horario_seccion hs ON s.id_materia_plan = hs.id_materia_plan AND s.letra = hs.letra_sec
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
            INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
            LEFT JOIN horario_seccion hs ON s.id_materia_plan = hs.id_materia_plan AND s.letra = hs.letra_sec
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