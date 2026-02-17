const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.post('/updateProfe', (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    try {
        const { cedula, cedula_og, nombre, apellido, email, telefono, especialidad, notas, activo } = req.body;

                // Obtener conexión del pool para la transacción
        conexion.getConnection((err, conn) => {
            if (err) {
                console.error('Error al obtener conexión del pool:', err);
                const mensaje = 'Error al conectar con la base de datos';
                return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
            }

            // Iniciar transacción
            conn.beginTransaction((err) => {
                if (err) {
                    conn.release();
                    console.error('Error al iniciar transacción:', err);
                    const mensaje = 'Error interno del servidor';
                    return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                }

                // Primera inserción - USUARIO
                const updateUsuario = `UPDATE usuario
                    SET cedula=?, nombre=?, apeliido=?, email=?, activo=?
                    WHERE cedula=?`;
                
                const valoresUsuario = [cedula, nombre, apellido, email, activo, cedula_og];

                conn.query(updateUsuario, valoresUsuario, (err, result) => {
                    if (err) {
                        const mensaje = 'Error al actualizar usuario';
                        console.error(mensaje, err);
                        return conn.rollback(() => {
                            conn.release();
                            res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                        });
                    }

                    // Segunda inserción - USUARIO_DOCENTE
                    const updateDocente = `UPDATE usuario_docente
                        SET especializacion=?, descripcion=?, telf=?
                        WHERE cedula_usuario=?`;
                    
                    const valoresDocente = [especialidad, notas, telefono, cedula];

                    conn.query(updateDocente, valoresDocente, (err) => {
                        if (err) {
                            const mensaje = 'Error al actualizar datos del docente';
                            console.error(mensaje, err);
                            return conn.rollback(() => {
                                conn.release();
                                res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        // Confirmar transacción
                        conn.commit((err) => {
                            if (err) {
                                const mensaje = 'Error al confirmar operación';
                                console.error(mensaje, err);
                                return conn.rollback(() => {
                                    conn.release();
                                    res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            // Liberar conexión y redirigir con éxito
                            conn.release();
                            console.log('=== Profesor actualizado exitosamente ===');
                            const mensaje = 'Profesor actualizado exitosamente :D';
                            res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                        });
                    });
                });
            }); 
        });
    } catch (error) {
        console.error('Error inesperado:', error);
        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent('Error interno del servidor'));
    }
});

module.exports = router;