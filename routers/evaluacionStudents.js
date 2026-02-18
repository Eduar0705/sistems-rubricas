const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/student/evaluaciones', (req, res) => {
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const cedula = req.session.cedula;

    const query = `
        SELECT
            e.id as evaluacion_id,
            r.nombre_rubrica,
            m.nombre as materia,
            SUM(DISTINCT de.puntaje_obtenido) as puntaje_total,
            er.fecha_evaluado as fecha_evaluacion,
            tr.nombre as tipo_evaluacion,
            SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion,
            er.observaciones,
            CONCAT(ud.nombre, ' ', ud.apeliido) as profesor
        FROM evaluacion_realizada er
        INNER JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id  
        RIGHT JOIN evaluacion e ON er.id_evaluacion = e.id  
        INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
        INNER JOIN rubrica r ON r.id = ru.id_rubrica
        INNER JOIN tipo_rubrica tr ON r.id_tipo = tr.id
        INNER JOIN criterio_rubrica cr ON cr.rubrica_id = r.id
        INNER JOIN seccion s ON e.id_seccion = s.id
        INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN usuario ud ON ud.cedula = er.cedula_evaluador
        WHERE er.cedula_evaluado = ?
        GROUP BY e.id
        ORDER BY er.fecha_evaluado DESC;
    `;

    conexion.query(query, [cedula], (err, evaluaciones) => {
        if (err) {
            console.error('Error al obtener evaluaciones:', err);
            return res.status(500).send('Error al obtener los datos');
        }

        res.render('studen/evaluaciones', {
            datos: req.session,
            currentPage: 'evaluaciones',
            evaluaciones: evaluaciones
        });
    });
});

// =============================================
// GET - Obtener detalles de evaluación para modal
// =============================================
router.get('/api/evaluacion/:id/detalles', (req, res) => {
    if (!req.session.login) {
        return res.json({
            success: false,
            message: 'Sesión no válida'
        });
    }

    const evaluacionId = req.params.id;
    const estudianteCedula = req.session.cedula;

    // Consulta para obtener información de la evaluación
    const queryEvaluacion = `
        SELECT
                er.id,
                r.id as rubrica_id,
                er.cedula_evaluado,
                er.observaciones,
                SUM(DISTINCT de.puntaje_obtenido) as puntaje_total,
                er.fecha_evaluado as fecha_evaluacion,
                r.nombre_rubrica,
                tr.nombre as tipo_evaluacion,
                SUM(DISTINCT cr.puntaje_maximo) as porcentaje_evaluacion,
                r.instrucciones,
                e.competencias,
                m.nombre as materia_nombre,
                m.codigo as materia_codigo,
                CONCAT(ud.nombre, ' ', ud.apeliido) as profesor
            FROM evaluacion_realizada er
            INNER JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id  
            RIGHT JOIN evaluacion e ON er.id_evaluacion = e.id  
            INNER JOIN rubrica_uso ru ON ru.id_eval = e.id
            INNER JOIN rubrica r ON r.id = ru.id_rubrica
            INNER JOIN tipo_rubrica tr ON r.id_tipo = tr.id
            INNER JOIN criterio_rubrica cr ON cr.rubrica_id = r.id
            INNER JOIN seccion s ON e.id_seccion = s.id
            INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
            INNER JOIN materia m ON pp.codigo_materia = m.codigo
            INNER JOIN usuario ud ON ud.cedula = er.cedula_evaluador
            WHERE er.cedula_evaluado = ? AND er.id_evaluacion = ?
            GROUP BY e.id
            ORDER BY er.fecha_evaluado DESC;
        `;
    

    conexion.query(queryEvaluacion, [estudianteCedula, evaluacionId], (err, resultEvaluacion) => {
        if (err) {
            console.error('Error al obtener evaluación:', err);
            return res.json({
                success: false,
                message: 'Error al obtener la evaluación'
            });
        }

        if (resultEvaluacion.length === 0) {
            return res.json({
                success: false,
                message: 'Evaluación no encontrada'
            });
        }

        const evaluacion = resultEvaluacion[0];

        // Consulta para obtener información del estudiante
        const queryEstudiante = `
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

        conexion.query(queryEstudiante, [evaluacion.estudiante_cedula], (err, resultEstudiante) => {
            if (err) {
                console.error('Error al obtener estudiante:', err);
                return res.json({
                    success: false,
                    message: 'Error al obtener información del estudiante'
                });
            }

            if (resultEstudiante.length === 0) {
                return res.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            const estudiante = resultEstudiante[0];

            // Consulta para obtener criterios con sus niveles de desempeño
            const queryCriterios = `
                SELECT id, descripcion, puntaje_maximo, orden
                FROM criterio_rubrica
                WHERE rubrica_id = ?
                ORDER BY orden
            `;

            conexion.query(queryCriterios, [evaluacion.rubrica_id], (err, resultCriterios) => {
                if (err) {
                    console.error('Error al obtener criterios:', err);
                    return res.json({
                        success: false,
                        message: 'Error al obtener criterios de evaluación'
                    });
                }

                    // Obtener niveles de desempeño para cada criterio
                const criteriosIds = resultCriterios.map(c => c.id);

                if (criteriosIds.length === 0) {
                    return res.json({
                        success: false,
                        message: 'No hay criterios de evaluación configurados'
                    });
                }

                const queryNiveles = `
                    SELECT
                        criterio_id,
                        nombre_nivel,
                        descripcion,
                        puntaje_maximo AS puntaje,
                        orden
                    FROM nivel_desempeno
                    WHERE criterio_id IN (?)
                    ORDER BY criterio_id, orden
                `;

                conexion.query(queryNiveles, [criteriosIds], (err, resultNiveles) => {
                    if (err) {
                        console.error('Error al obtener niveles:', err);
                        return res.json({
                            success: false,
                            message: 'Error al obtener niveles de desempeño'
                        });
                    }

                    // Obtener detalles de evaluación para saber qué niveles fueron seleccionados
                    const queryDetalles = `
                        SELECT
                            de.id_criterio_detalle,
                            de.orden_detalle AS nivel_seleccionado,
                            de.puntaje_obtenido
                        FROM detalle_evaluacion de 
                        INNER JOIN evaluacion_realizada er ON de.evaluacion_r_id = er.id
                        INNER JOIN evaluacion e ON er.id_evaluacion = e.id
                        WHERE e.id = ? AND er.cedula_evaluado = ?
                    `;

                    conexion.query(queryDetalles, [evaluacionId], (err, resultDetalles) => {
                        if (err) {
                            console.error('Error al obtener detalles de evaluación:', err);
                            return res.json({
                                success: false,
                                message: 'Error al obtener detalles de evaluación'
                            });
                        }

                        // Crear mapa de detalles por criterio
                        const detallesMap = {};
                        resultDetalles.forEach(detalle => {
                            detallesMap[detalle.id_criterio_detalle] = {
                                nivel_seleccionado: detalle.nivel_seleccionado,
                                puntaje_obtenido: detalle.puntaje_obtenido
                            };
                        });

                        // Agrupar niveles por criterio y marcar seleccionado
                        const criteriosConNiveles = resultCriterios.map(criterio => {
                            const niveles = resultNiveles.filter(
                                nivel => nivel.criterio_id === criterio.id
                            ).map(nivel => ({
                                id: nivel.orden,
                                nombre: nivel.nombre_nivel,
                                descripcion: nivel.descripcion,
                                puntaje: detallesMap[criterio.id].nivel_seleccionado === nivel.orden ? detallesMap[criterio.id].puntaje_obtenido : nivel.puntaje,
                                puntaje_maximo: nivel.puntaje,
                                orden: nivel.orden,
                                seleccionado: detallesMap[criterio.id] ? detallesMap[criterio.id].nivel_seleccionado === nivel.orden : false
                            }));

                            return {
                                id: criterio.id,
                                nombre: criterio.descripcion,
                                descripcion: criterio.descripcion,
                                puntaje_maximo: criterio.puntaje_maximo,
                                orden: criterio.orden,
                                niveles: niveles
                            };
                        });

                        // Preparar respuesta
                        const response = {
                            success: true,
                            evaluacion: {
                                id: evaluacion.id,
                                rubrica_id: evaluacion.rubrica_id,
                                estudiante_cedula: evaluacion.estudiante_cedula,
                                observaciones: evaluacion.observaciones,
                                puntaje_total: evaluacion.puntaje_total,
                                fecha_evaluacion: evaluacion.fecha_evaluacion
                            },
                            estudiante: {
                                cedula: estudiante.cedula,
                                nombre: estudiante.nombre,
                                apellido: estudiante.apellido,
                                email: estudiante.email,
                                carrera: estudiante.carrera
                            },
                            rubrica: {
                                nombre_rubrica: evaluacion.nombre_rubrica,
                                tipo_evaluacion: evaluacion.tipo_evaluacion,
                                porcentaje_evaluacion: evaluacion.porcentaje_evaluacion,
                                instrucciones: evaluacion.instrucciones,
                                competencias: evaluacion.competencias,
                                materia: evaluacion.materia_nombre,
                                materia_codigo: evaluacion.materia_codigo
                            },
                            criterios: criteriosConNiveles
                        };

                        res.json(response);
                    });
                });
            });
        });
    });
});

module.exports = router;
