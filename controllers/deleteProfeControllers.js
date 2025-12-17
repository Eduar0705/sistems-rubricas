const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/deleteProfe/:cedula', (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    let mensaje;
    const cedula = req.params.cedula;

    // Obtener una conexión del pool
    conexion.getConnection((err, conn) => {
        if (err) {
            console.log('Error al obtener conexión del pool: ', err);
            mensaje = 'Error al conectar con la base de datos.';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }

        // Iniciar una transacción para asegurar que todo se elimine correctamente
        conn.beginTransaction((err) => {
            if (err) {
                conn.release(); // Liberar la conexión
                console.log('Error al iniciar transacción: ', err);
                mensaje = 'Error al eliminar profesor. Intente más tarde.';
                return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
            }

            // Paso 1: Eliminar de la tabla usuario (si existe)
            const sqlUsuario = `DELETE FROM usuario WHERE cedula = ?`;
            conn.query(sqlUsuario, [cedula], (err, resultUsuario) => {
                if (err) {
                    return conn.rollback(() => {
                        conn.release(); // Liberar la conexión
                        console.log('Error al eliminar usuario: ', err);
                        mensaje = 'Error al eliminar profesor. Intente más tarde.';
                        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                    });
                }

                // Paso 2: Verificar si el docente tiene secciones asignadas
                const sqlVerificarSecciones = `SELECT COUNT(*) as total FROM seccion WHERE docente_cedula = ?`;
                conn.query(sqlVerificarSecciones, [cedula], (err, resultSecciones) => {
                    if (err) {
                        return conn.rollback(() => {
                            conn.release(); // Liberar la conexión
                            console.log('Error al verificar secciones: ', err);
                            mensaje = 'Error al eliminar profesor. Intente más tarde.';
                            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    const tieneSecciones = resultSecciones[0].total > 0;

                    if (tieneSecciones) {
                        // Si tiene secciones, no podemos eliminarlo
                        return conn.rollback(() => {
                            conn.release(); // Liberar la conexión
                            mensaje = 'No se puede eliminar el profesor porque tiene secciones asignadas. Debe reasignar o eliminar las secciones primero.';
                            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    // Paso 3: Si no tiene secciones, eliminar de la tabla docente
                    const sqlDocente = `DELETE FROM docente WHERE cedula = ?`;
                    conn.query(sqlDocente, [cedula], (err, resultDocente) => {
                        if (err) {
                            return conn.rollback(() => {
                                conn.release(); // Liberar la conexión
                                console.log('Error al eliminar docente: ', err);
                                mensaje = 'Error al eliminar profesor. Intente más tarde.';
                                return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        // Paso 4: Commit de la transacción si todo salió bien
                        conn.commit((err) => {
                            if (err) {
                                return conn.rollback(() => {
                                    conn.release(); // Liberar la conexión
                                    console.log('Error al hacer commit: ', err);
                                    mensaje = 'Error al eliminar profesor. Intente más tarde.';
                                    return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            conn.release(); // Liberar la conexión exitosamente
                            mensaje = 'Profesor eliminado exitosamente.';
                            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;