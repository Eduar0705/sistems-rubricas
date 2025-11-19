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
            ee.id as evaluacion_id,
            r.nombre_rubrica,
            m.nombre as materia,
            ee.puntaje_total,
            ee.fecha_evaluacion,
            r.tipo_evaluacion,
            r.porcentaje_evaluacion,
            ee.observaciones,
            CONCAT(d.nombre, ' ', d.apellido) as profesor
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN docente d ON r.docente_cedula = d.cedula
        WHERE ee.estudiante_cedula = ?
        ORDER BY ee.fecha_evaluacion DESC
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
            ee.id,
            ee.rubrica_id,
            ee.estudiante_cedula,
            ee.observaciones,
            ee.puntaje_total,
            ee.fecha_evaluacion,
            re.nombre_rubrica,
            re.tipo_evaluacion,
            re.porcentaje_evaluacion,
            re.instrucciones,
            re.competencias,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo
        FROM evaluacion_estudiante ee
        INNER JOIN rubrica_evaluacion re ON ee.rubrica_id = re.id
        INNER JOIN materia m ON re.materia_codigo = m.codigo
        WHERE ee.id = ? AND ee.estudiante_cedula = ?
    `;

    conexion.query(queryEvaluacion, [evaluacionId], (err, resultEvaluacion) => {
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
                e.cedula,
                e.nombre,
                e.apellido,
                e.email,
                c.nombre as carrera
            FROM estudiante e
            INNER JOIN carrera c ON e.carrera_codigo = c.codigo
            WHERE e.cedula = ?
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
                SELECT
                    ce.id,
                    ce.descripcion,
                    ce.puntaje_maximo,
                    ce.orden
                FROM criterio_evaluacion ce
                WHERE ce.rubrica_id = ?
                ORDER BY ce.orden ASC
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
                        nd.id,
                        nd.criterio_id,
                        nd.nombre_nivel,
                        nd.descripcion,
                        nd.puntaje,
                        nd.orden
                    FROM nivel_desempeno nd
                    WHERE nd.criterio_id IN (?)
                    ORDER BY nd.criterio_id ASC, nd.orden ASC
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
                            de.criterio_id,
                            de.nivel_seleccionado,
                            de.puntaje_obtenido
                        FROM detalle_evaluacion de
                        WHERE de.evaluacion_id = ?
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
                            detallesMap[detalle.criterio_id] = {
                                nivel_seleccionado: detalle.nivel_seleccionado,
                                puntaje_obtenido: detalle.puntaje_obtenido
                            };
                        });

                        // Agrupar niveles por criterio y marcar seleccionado
                        const criteriosConNiveles = resultCriterios.map(criterio => {
                            const niveles = resultNiveles.filter(
                                nivel => nivel.criterio_id === criterio.id
                            ).map(nivel => ({
                                id: nivel.id,
                                nombre: nivel.nombre_nivel,
                                descripcion: nivel.descripcion,
                                puntaje: nivel.puntaje,
                                orden: nivel.orden,
                                seleccionado: detallesMap[criterio.id] ? detallesMap[criterio.id].nivel_seleccionado === nivel.id : false
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
