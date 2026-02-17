const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');
const e = require('express');

router.post('/envioProfe', (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const { cedula, nombre, apellido, email, telefono, especialidad, notas } = req.body;

    // Validación básica de datos requeridos
    if (!cedula || !nombre || !apellido || !email || !telefono || !especialidad) {
        const mensaje = 'Todos los campos son obligatorios';
        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
    }

    const verifdatos = `SELECT 
                            u.*,
                            ud.*
                        FROM usuario_docente ud
                        INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                        WHERE u.cedula = ?`;

    conexion.query(verifdatos, [cedula], (err, results) => {
        if (err) {
            console.error('Error en la verificación de datos:', err);
            const mensaje = 'Error en el servidor';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }

        if (results.length > 0 && results[0].activo == 0)
        {
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
                    const insertUsuario = `UPDATE usuario
                            SET nombre = ?,
                                apeliido = ?,
                                email = ?,
                                activo = 1 
                            WHERE cedula = ?`;
                    
                    const valoresUsuario = [nombre, apellido, email, cedula];

                    conn.query(insertUsuario, valoresUsuario, (err, result) => {
                        if (err) {
                            console.error('Error al insertar usuario:', err);
                            return conn.rollback(() => {
                                conn.release();
                                const mensaje = 'Error al agregar usuario';
                                res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        // Segunda inserción - USUARIO_DOCENTE
                        const insertDocente = `UPDATE usuario_docente
                            SET especializacion=?, descripcion=?, telf=?
                            WHERE cedula_usuario = ?`;
                        
                        const valoresDocente = [especialidad, notas, telefono, cedula];

                        conn.query(insertDocente, valoresDocente, (err) => {
                            if (err) {
                                console.error('Error al insertar docente:', err);
                                return conn.rollback(() => {
                                    conn.release();
                                    const mensaje = 'Error al agregar datos del docente';
                                    res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            // Confirmar transacción
                            conn.commit((err) => {
                                if (err) {
                                    console.error('Error al confirmar transacción:', err);
                                    return conn.rollback(() => {
                                        conn.release();
                                        const mensaje = 'Error al confirmar operación';
                                        res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                                    });
                                }

                                // Liberar conexión y redirigir con éxito
                                conn.release();
                                const mensaje = 'Profesor re-agregado exitosamente :D';
                                console.log(mensaje);
                                res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        });
                    });
                });
            });
        }
        else
        {
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
                    const insertUsuario = `INSERT INTO usuario
                        (cedula, nombre, apeliido, email, id_rol)
                        VALUES (?, ?, ?, ?, ?)`;
                    
                    const valoresUsuario = [cedula, nombre, apellido, email, 2];

                    conn.query(insertUsuario, valoresUsuario, (err, result) => {
                        if (err) {
                            console.error('Error al insertar usuario:', err);
                            return conn.rollback(() => {
                                conn.release();
                                const mensaje = 'Error al agregar usuario';
                                res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        }

                        // Segunda inserción - USUARIO_DOCENTE
                        const insertDocente = `INSERT INTO usuario_docente
                            (cedula_usuario, especializacion, descripcion, telf)
                            VALUES (?, ?, ?, ?)`;
                        
                        const valoresDocente = [cedula, especialidad, notas, telefono];

                        conn.query(insertDocente, valoresDocente, (err) => {
                            if (err) {
                                console.error('Error al insertar docente:', err);
                                return conn.rollback(() => {
                                    conn.release();
                                    const mensaje = 'Error al agregar datos del docente';
                                    res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                                });
                            }

                            // Confirmar transacción
                            conn.commit((err) => {
                                if (err) {
                                    console.error('Error al confirmar transacción:', err);
                                    return conn.rollback(() => {
                                        conn.release();
                                        const mensaje = 'Error al confirmar operación';
                                        res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                                    });
                                }

                                // Liberar conexión y redirigir con éxito
                                conn.release();
                                console.log('=== Profesor agregado exitosamente ===');
                                const mensaje = 'Profesor agregado exitosamente :D';
                                res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
                            });
                        });
                    });
                });
            });
        }
    });
});
module.exports = router;