const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

router.get('/teacher/rubricas', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const cedula = req.session.cedula;
    //SI EL SISTEMA REACCIONA MAL AL ESTADO, CAMBIAR A SOLO MOSTRAR EL R.ACTIVO COMO ESTADO
    const query = `
        SELECT
                				r.id,
                                r.nombre_rubrica,
                				e.fecha_evaluacion,
                				r.fecha_creacion,
	               				GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                                e.ponderacion AS porcentaje_evaluacion,
                                m.nombre AS materia_nombre,
                				m.codigo AS materia_codigo,
                				s.letra AS seccion_codigo,
								CASE
                                    WHEN r.activo = 1 THEN ru.estado
                                    ELSE 'Inactivo'
                                END AS estado,
                                r.activo,
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
                            WHERE pd.docente_cedula = ? AND r.activo = 1 AND u.activo = 1
                            GROUP BY r.id
                            ORDER BY fecha_creacion DESC;
    `;

    connection.query(query, [cedula], (error, rubricas) => {
        if(error) {
            console.error('Error al obtener rúbricas:', error);
            return res.render("teacher/rubricas", {
                datos: req.session,
                title: 'SGR - Rúbricas',
                rubricas: [],
                currentPage: 'rubricas'
            });
        }

        res.render("teacher/rubricas", {
            datos: req.session,
            title: 'SGR - Rúbricas',
            rubricas: rubricas,
            currentPage: 'rubricas'
        });
    });
});

// Ruta API para obtener detalle de rúbrica
router.get("/teacher/rubricas/detalle/:id", function(req, res) {
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
            CONCAT(pp.codigo_periodo, '-', pp.codigo_carrera, '-', pp.codigo_materia, '-', s.letra) AS seccion_codigo,
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



// Ruta API para obtener opciones de materia y sección
router.get("/teacher/opciones", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const queryMaterias = 'SELECT codigo, nombre FROM materia';
    // VERIFICAR FUNCIONAMIENTO DE LA ID Y LETRA CODIGO

    const querySecciones = `
        SELECT 
            s.id_materia_plan AS id,
            s.letra AS codigo, 
            pp.codigo_materia AS materia_codigo,
            pp.codigo_periodo AS lapso_academico
        FROM seccion s
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        ORDER BY pp.codigo_periodo DESC, s.letra
    `;

    connection.query(queryMaterias, (error, materias) => {
        if(error) {
            return res.status(500).json({ success: false, message: 'Error al obtener materias' });
        }

        connection.query(querySecciones, (error, secciones) => {
            if(error) {
                return res.status(500).json({ success: false, message: 'Error al obtener secciones' });
            }

            res.json({
                success: true,
                materias: materias,
                secciones: secciones
            });
        });
    });
});

// Ruta para obtener profesores únicos
router.get("/teacher/rubricas/profesores", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT DISTINCT IFNULL(CONCAT(u.nombre, ' ', u.apeliido), 'Docente no encontrado') AS docente_nombre
        FROM rubrica r
        LEFT JOIN usuario_docente ud ON r.cedula_docente = ud.cedula_usuario
        INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
        WHERE u.activo = 1
        ORDER BY docente_nombre;
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
// OBTENER DATOS PARA EDITAR RÚBRICA (TEACHER)
// ============================================================
router.get('/teacher/rubricas/editar/:id', (req, res) => {
    const { id } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    // Verificar que la rúbrica pertenece al docente
    const queryVerificar = `
        SELECT r.id
        FROM rubrica r
        WHERE r.id = ? AND r.cedula_docente = ? AND r.activo = 1;
    `;

    connection.query(queryVerificar, [id, cedula], (error, results) => {
        if(error) {
            console.error('Error al verificar rúbrica:', error);
            return res.json({ success: false, message: 'Error al verificar la rúbrica' });
        }

        if(results.length === 0) {
            return res.json({ success: false, message: 'Rúbrica no encontrada o sin permisos' });
        }

        // Obtener datos de la rúbrica
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
                CONCAT(pp.codigo_periodo, '-', pp.codigo_carrera, '-', pp.codigo_materia, '-', s.letra) AS seccion_codigo,
                CONCAT(u.nombre, ' ', u.apeliido) AS docente_nombre
            FROM evaluacion e
            INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            INNER JOIN seccion s ON e.id_materia_plan = s.id_materia_plan AND e.letra = s.letra
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
            LEFT JOIN usuario_docente ud ON ud.cedula_usuario = r.cedula_docente
            INNER JOIN usuario u ON u.cedula = ud.cedula_usuario
            LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
            LEFT JOIN estrategia_eval eeval ON eeval.id = eemp.id_estrategia
            WHERE r.id = ?
            GROUP BY r.id;
        `;

        connection.query(queryRubrica, [id, cedula], (error, rubricaResult) => {
            if(error) {
                console.error('Error al obtener rúbrica:', error);
                return res.json({ success: false, message: 'Error al obtener la rúbrica' });
            }

            if(rubricaResult.length === 0) {
                return res.json({ success: false, message: 'Rúbrica no encontrada' });
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
});

// ============================================================
// APIs PARA CARGA JERÁRQUICA (TEACHER)
// ============================================================

// Obtener carreras por permisos del docente
router.get('/teacher/carreras', (req, res) => {
    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT 
            DISTINCT c.codigo, c.nombre
        FROM carrera c
        INNER JOIN plan_periodo pp ON pp.codigo_carrera = c.codigo
        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
        WHERE c.activo = 1
        AND pd.docente_cedula = ?
        AND pd.activo = 1
        ORDER BY c.nombre;
    `;

    connection.query(query, [cedula], (error, carreras) => {
        if(error) {
            console.error('Error:', error);
            return res.json({ success: false, message: 'Error al obtener carreras' });
        }

        res.json({ success: true, carreras: carreras });
    });
});

// Obtener semestres por carrera y permisos
router.get("/teacher/semestres/:carrera", (req, res) => {
    const { carrera } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT 
            DISTINCT pp.num_semestre AS semestre
        FROM plan_periodo pp
        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
        WHERE pp.codigo_carrera = ?
        AND pd.docente_cedula = ?
        AND pd.activo = 1
        ORDER BY semestre;
    `;

    connection.query(query, [carrera, cedula], (error, results) => {
        if(error) {
            console.error('Error al obtener semestres:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        res.json(results.map(r => r.semestre));
    });
});

// Obtener materias por carrera, semestre y permisos
router.get("/teacher/materias/:carrera/:semestre", (req, res) => {
    const { carrera, semestre } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT 
            DISTINCT pp.codigo_materia AS codigo,
            m.nombre,
            pp.num_semestre AS semestre,
            pp.unidades_credito AS creditos
        FROM plan_periodo pp
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN permiso_docente pd ON pp.id = pd.id_materia_plan
        WHERE pp.codigo_carrera = ?
        AND pp.codigo_materia = ?
        AND pd.docente_cedula = ?
        AND pd.activo = 1
        ORDER BY semestre;
    `;

    connection.query(query, [carrera, semestre, cedula], (error, results) => {
        if(error) {
            console.error('Error al obtener materias:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// Obtener secciones por materia y permisos
router.get("/teacher/secciones/:materia", (req, res) => {
    const { materia } = req.params;

    if(!req.session || !req.session.cedula) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    const cedula = req.session.cedula;
    // VERIFICAR FUNCIONAMIENTO DE LA ID Y LETRA CODIGO
    const query = `
        SELECT 
            s.id_materia_plan AS id,
            s.letra AS codigo,
            pp.codigo_periodo AS lapso_academico,
            IFNULL(GROUP_CONCAT(CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS horario,
            IFNULL(hs.aula, 'No encontrada') AS aula,
            s.capacidad_maxima
        FROM plan_periodo pp
        INNER JOIN seccion s ON pp.id = s.id_materia_plan
        LEFT JOIN horario_seccion hs ON s.id_materia_plan = hs.id_materia_plan AND s.letra = hs.letra_sec
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN permiso_docente pd ON s.id_materia_plan = pd.id_materia_plan AND s.letra = pd.letra_sec
        AND pp.codigo_materia = ?
        AND pd.docente_cedula = ?
        AND pd.activo = 1
        GROUP BY s.id_materia_plan, s.letra
        ORDER BY lapso_academico DESC, id, codigo;
    `;

    connection.query(query, [materia, cedula], (error, results) => {
        if(error) {
            console.error('Error al obtener secciones:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});

module.exports = router;
