const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/deleteProfe/:cedula', (req, res) => {
    let mensaje;
    const cedula = req.params.cedula;

    // Iniciar una transacción para asegurar que todo se elimine correctamente
    conexion.beginTransaction((err) => {
        if (err) {
            console.log('Error al iniciar transacción: ', err);
            mensaje = 'Error al eliminar profesor. Intente más tarde.';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }

        // Paso 1: Eliminar de la tabla usuario (si existe)
        const sqlUsuario = `DELETE FROM usuario WHERE cedula = ?`;
        conexion.query(sqlUsuario, [cedula], (err, resultUsuario) => {
            if (err) {
                return conexion.rollback(() => {
                    console.log('Error al eliminar usuario: ', err);
                    mensaje = 'Error al eliminar profesor. Intente más tarde.';
                    return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                });
            }

            // Paso 2: Verificar si el docente tiene secciones asignadas
            const sqlVerificarSecciones = `SELECT COUNT(*) as total FROM seccion WHERE docente_cedula = ?`;
            conexion.query(sqlVerificarSecciones, [cedula], (err, resultSecciones) => {
                if (err) {
                    return conexion.rollback(() => {
                        console.log('Error al verificar secciones: ', err);
                        mensaje = 'Error al eliminar profesor. Intente más tarde.';
                        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                const tieneSecciones = resultSecciones[0].total > 0;

                if (tieneSecciones) {
                    // Si tiene secciones, no podemos eliminarlo
                    return conexion.rollback(() => {
                        mensaje = 'No se puede eliminar el profesor porque tiene secciones asignadas. Debe reasignar o eliminar las secciones primero.';
                        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                // Paso 3: Si no tiene secciones, eliminar de la tabla docente
                const sqlDocente = `DELETE FROM docente WHERE cedula = ?`;
                conexion.query(sqlDocente, [cedula], (err, resultDocente) => {
                    if (err) {
                        return conexion.rollback(() => {
                            console.log('Error al eliminar docente: ', err);
                            mensaje = 'Error al eliminar profesor. Intente más tarde.';
                            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    // Paso 4: Commit de la transacción si todo salió bien
                    conexion.commit((err) => {
                        if (err) {
                            return conexion.rollback(() => {
                                console.log('Error al hacer commit: ', err);
                                mensaje = 'Error al eliminar profesor. Intente más tarde.';
                                return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        mensaje = 'Profesor eliminado exitosamente.';
                        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                    });
                });
            });
        });
    });
});

module.exports = router;