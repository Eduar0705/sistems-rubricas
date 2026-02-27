const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// ============================================================
// RUTA PARA ELIMINAR RÚBRICA
// ============================================================
// ============================================================
// ELIMINAR RÚBRICA (END-POINT)
// ============================================================
router.delete('/admin/deleteRubrica/:id', (req, res) => {
    // Validar sesión
    if (!req.session || !req.session.cedula) {
        return res.status(401).json({
            success: false,
            message: 'Sesión no válida. Por favor, inicie sesión nuevamente.'
        });
    }

    const rubricaId = req.params.id;

    // ============================================================
    // INICIAR TRANSACCIÓN
    // ============================================================
    connection.getConnection((err, conn) => {
        if (err) {
            console.error('Error al obtener conexión:', err);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor al conectar con la base de datos'
            });
        }

        conn.beginTransaction((err) => {
            if (err) {
                conn.release();
                console.error('Error al iniciar transacción:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error del servidor al iniciar la transacción'
                });
            }

            // ============================================================
            // PASO 1: VERIFICAR QUE LA RÚBRICA EXISTA Y PERTENEZCA AL DOCENTE
            // ============================================================
            const queryVerificar = 'SELECT id FROM rubrica WHERE id = ?';
            conn.query(queryVerificar, [rubricaId], (err, results) => {
                if (err) {
                    return conn.rollback(() => {
                        conn.release();
                        console.error('Error al verificar rúbrica:', err);
                        res.status(500).json({
                            success: false,
                            message: 'Error al verificar la rúbrica'
                        });
                    });
                }

                if (results.length === 0) {
                    return conn.rollback(() => {
                        conn.release();
                        res.status(404).json({
                            success: false,
                            message: 'Rúbrica no encontrada o no tiene permisos para eliminarla'
                        });
                    });
                }

                // ============================================================
                // PASO 2: ELIMINAR NIVELES DE DESEMPEÑO (PRIMERO POR FK)
                // ============================================================
                const queryDeleteNiveles = `
                    DELETE n FROM nivel_desempeno n
                    INNER JOIN criterio_rubrica c ON n.criterio_id = c.id
                    WHERE c.rubrica_id = ?
                `;
                conn.query(queryDeleteNiveles, [rubricaId], (err) => {
                    if (err) {
                        return conn.rollback(() => {
                            conn.release();
                            console.error('Error al eliminar niveles:', err);
                            res.status(500).json({
                                success: false,
                                message: 'Error al eliminar los niveles de desempeño'
                            });
                        });
                    }

                    // ============================================================
                    // PASO 3: ELIMINAR CRITERIOS DE LA RÚBRICA
                    // ============================================================
                    const queryDeleteCriterios = 'DELETE FROM criterio_rubrica WHERE rubrica_id = ?';
                    conn.query(queryDeleteCriterios, [rubricaId], (err) => {
                        if (err) {
                            return conn.rollback(() => {
                                conn.release();
                                console.error('Error al eliminar criterios:', err);
                                res.status(500).json({
                                    success: false,
                                    message: 'Error al eliminar los criterios'
                                });
                            });
                        }

                        // ============================================================
                        // PASO 4: ELIMINAR RELACIÓN EN rubrica_uso
                        // ============================================================
                        const queryDeleteUso = 'DELETE FROM rubrica_uso WHERE id_rubrica = ?';
                        conn.query(queryDeleteUso, [rubricaId], (err) => {
                            if (err) {
                                return conn.rollback(() => {
                                    conn.release();
                                    console.error('Error al eliminar relación rubrica_uso:', err);
                                    res.status(500).json({
                                        success: false,
                                        message: 'Error al eliminar la relación con la evaluación'
                                    });
                                });
                            }

                            // ============================================================
                            // PASO 5: ELIMINAR LA RÚBRICA
                            // ============================================================
                            const queryDeleteRubrica = 'DELETE FROM rubrica WHERE id = ?';
                            conn.query(queryDeleteRubrica, [rubricaId], (err, result) => {
                                if (err) {
                                    return conn.rollback(() => {
                                        conn.release();
                                        console.error('Error al eliminar rúbrica:', err);
                                        res.status(500).json({
                                            success: false,
                                            message: 'Error al eliminar la rúbrica'
                                        });
                                    });
                                }

                                if (result.affectedRows === 0) {
                                    return conn.rollback(() => {
                                        conn.release();
                                        res.status(404).json({
                                            success: false,
                                            message: 'La rúbrica no existe o ya fue eliminada'
                                        });
                                    });
                                }

                                // ============================================================
                                // CONFIRMAR TRANSACCIÓN
                                // ============================================================
                                conn.commit((err) => {
                                    if (err) {
                                        return conn.rollback(() => {
                                            conn.release();
                                            console.error('Error al confirmar transacción:', err);
                                            res.status(500).json({
                                                success: false,
                                                message: 'Error al confirmar la eliminación'
                                            });
                                        });
                                    }

                                    conn.release();
                                    res.json({
                                        success: true,
                                        message: 'Rúbrica eliminada correctamente'
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
