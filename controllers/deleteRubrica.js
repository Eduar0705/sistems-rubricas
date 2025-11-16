const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// ============================================================
// RUTA PARA ELIMINAR RÚBRICA
// ============================================================
router.delete('/admin/deleteRubrica/:id', (req, res) => {
    const rubricaId = req.params.id;

    console.log('=== Solicitud de eliminación recibida ===');
    console.log('ID de rúbrica:', rubricaId);
    console.log('Usuario:', req.session.cedula);
    console.log('Rol:', req.session.id_rol);

    if (!req.session.login) {
        console.log('Error: Usuario no autorizado');
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    // Verificar permisos
    let queryCheck;
    let queryParams;

    if (req.session.id_rol === 1) {
        // Administrador puede eliminar cualquier rúbrica
        queryCheck = 'SELECT id FROM rubrica_evaluacion WHERE id = ?';
        queryParams = [rubricaId];
        console.log('Usuario es administrador - puede eliminar cualquier rúbrica');
    } else {
        // Docente solo puede eliminar sus propias rúbricas
        queryCheck = 'SELECT id FROM rubrica_evaluacion WHERE id = ? AND docente_cedula = ?';
        queryParams = [rubricaId, req.session.cedula];
        console.log('Usuario es docente - solo puede eliminar sus rúbricas');
    }

    connection.query(queryCheck, queryParams, (error, results) => {
        if (error) {
            console.error('Error al verificar rúbrica:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        if (results.length === 0) {
            console.log('Rúbrica no encontrada o sin permisos');
            return res.status(404).json({ success: false, message: 'Rúbrica no encontrada o sin permisos' });
        }

        console.log('Rúbrica encontrada, iniciando eliminación...');

        // Iniciar transacción
        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error al iniciar transacción:', err);
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }

            // Paso 1: Eliminar detalles de evaluación
            console.log('Paso 1: Eliminando detalles de evaluación...');
            connection.query(
                'DELETE FROM detalle_evaluacion WHERE evaluacion_id IN (SELECT id FROM evaluacion_estudiante WHERE rubrica_id = ?)',
                [rubricaId],
                (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error al eliminar detalles de evaluación:', error);
                            res.status(500).json({ success: false, message: 'Error al eliminar detalles de evaluación' });
                        });
                    }

                    console.log('Detalles de evaluación eliminados correctamente');

                    // Paso 2: Eliminar niveles de desempeño
                    console.log('Paso 2: Eliminando niveles de desempeño...');
                    connection.query(
                        'DELETE FROM nivel_desempeno WHERE criterio_id IN (SELECT id FROM criterio_evaluacion WHERE rubrica_id = ?)',
                        [rubricaId],
                        (error) => {
                            if (error) {
                                return connection.rollback(() => {
                                    console.error('Error al eliminar niveles:', error);
                                    res.status(500).json({ success: false, message: 'Error al eliminar niveles de desempeño' });
                                });
                            }

                            console.log('Niveles eliminados correctamente');

                            // Paso 3: Eliminar criterios
                            console.log('Paso 3: Eliminando criterios...');
                            connection.query('DELETE FROM criterio_evaluacion WHERE rubrica_id = ?', [rubricaId], (error) => {
                                if (error) {
                                    return connection.rollback(() => {
                                        console.error('Error al eliminar criterios:', error);
                                        res.status(500).json({ success: false, message: 'Error al eliminar criterios' });
                                    });
                                }

                                console.log('Criterios eliminados correctamente');

                                // Paso 4: Eliminar evaluaciones de estudiantes
                                console.log('Paso 4: Eliminando evaluaciones...');
                                connection.query('DELETE FROM evaluacion_estudiante WHERE rubrica_id = ?', [rubricaId], (error) => {
                                    if (error) {
                                        return connection.rollback(() => {
                                            console.error('Error al eliminar evaluaciones:', error);
                                            res.status(500).json({ success: false, message: 'Error al eliminar evaluaciones' });
                                        });
                                    }

                                    console.log('Evaluaciones eliminadas correctamente');

                                    // Paso 5: Eliminar la rúbrica
                                    console.log('Paso 5: Eliminando rúbrica...');
                                    connection.query('DELETE FROM rubrica_evaluacion WHERE id = ?', [rubricaId], (error) => {
                                        if (error) {
                                            return connection.rollback(() => {
                                                console.error('Error al eliminar rúbrica:', error);
                                                res.status(500).json({ success: false, message: 'Error al eliminar rúbrica' });
                                            });
                                        }

                                        console.log('Rúbrica eliminada correctamente');

                                        // Confirmar transacción
                                        connection.commit((err) => {
                                            if (err) {
                                                return connection.rollback(() => {
                                                    console.error('Error al confirmar transacción:', err);
                                                    res.status(500).json({
                                                        success: false,
                                                        message: 'Error al confirmar eliminación'
                                                    });
                                                });
                                            }

                                            console.log('=== Rúbrica eliminada exitosamente ===');
                                            res.json({
                                                success: true,
                                                message: 'Rúbrica eliminada exitosamente'
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    );
                }
            );
        });
    });
});

module.exports = router;