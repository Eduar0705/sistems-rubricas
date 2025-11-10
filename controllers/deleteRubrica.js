const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

router.delete('/deleteRubrica/:id', (req, res) => {
    const rubricaId = req.params.id;

    if (!req.session.login) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    // Verificar permisos: solo admin puede eliminar cualquier rúbrica, docente solo las suyas
    let queryCheck;
    let queryParams;

    if (req.session.id_rol === 1) {
        // Administrador puede eliminar cualquier rúbrica
        queryCheck = 'SELECT id FROM rubrica_evaluacion WHERE id = ?';
        queryParams = [rubricaId];
    } else {
        // Docente solo puede eliminar sus propias rúbricas
        queryCheck = 'SELECT id FROM rubrica_evaluacion WHERE id = ? AND docente_cedula = ?';
        queryParams = [rubricaId, req.session.cedula];
    }

    connection.query(queryCheck, queryParams, (error, results) => {
        if (error) {
            console.error('Error al verificar rúbrica:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Rúbrica no encontrada o sin permisos' });
        }

        // Iniciar transacción para eliminar rúbrica y sus dependencias
        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error al iniciar transacción:', err);
                return res.status(500).json({ success: false, message: 'Error interno del servidor' });
            }

            // Primero eliminar niveles de desempeño
            connection.query('DELETE FROM nivel_desempeno WHERE criterio_id IN (SELECT id FROM criterio_evaluacion WHERE rubrica_id = ?)', [rubricaId], (error) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error al eliminar niveles:', error);
                        res.status(500).json({ success: false, message: 'Error al eliminar niveles de desempeño' });
                    });
                }

                // Luego eliminar criterios
                connection.query('DELETE FROM criterio_evaluacion WHERE rubrica_id = ?', [rubricaId], (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error al eliminar criterios:', error);
                            res.status(500).json({ success: false, message: 'Error al eliminar criterios' });
                        });
                    }

                    // Finalmente eliminar la rúbrica
                    connection.query('DELETE FROM rubrica_evaluacion WHERE id = ?', [rubricaId], (error) => {
                        if (error) {
                            return connection.rollback(() => {
                                console.error('Error al eliminar rúbrica:', error);
                                res.status(500).json({ success: false, message: 'Error al eliminar rúbrica' });
                            });
                        }

                        // Confirmar transacción
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error al confirmar transacción:', err);
                                    res.status(500).json({ success: false, message: 'Error al confirmar eliminación' });
                                });
                            }

                            console.log('Rúbrica eliminada exitosamente:', rubricaId);
                            res.json({ success: true, message: 'Rúbrica eliminada exitosamente' });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;