const express = require('express')
const router = express.Router()
const conexion = require('../models/conetion');

router.post('/envioUser', (req, res) => {
    const { cedula, nombre, email, password, rol } = req.body;

    // Validación básica
    if (!cedula || !nombre || !email || !password || !rol) {
        const mensaje = 'Error: Todos los campos son obligatorios';
        return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
    }

    // Verificar si el usuario ya existe - CONSULTA CORREGIDA
    const verifdatos = `SELECT * FROM usuario WHERE cedula = ? OR email = ?`;
    
    conexion.query(verifdatos, [cedula, email], (error, results) => {
        if (error) {
            console.error('Error al verificar datos:', error);
            const mensaje = 'Error en el servidor al verificar datos';
            return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
        }
        
        if (results.length > 0) {
            // Determinar qué campo está duplicado
            let campo = 'datos';
            const usuarioExistente = results[0];
            
            if (usuarioExistente.cedula === cedula) {
                campo = 'cédula';
            } else if (usuarioExistente.email === email) {
                campo = 'email';
            }
            
            console.log('Ya existe un usuario con ese', campo);
            const mensaje = `Error: Ya existe un usuario con ese ${campo}`;
            return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
        }

        // Si no existe, insertar el nuevo usuario
        const insert = `INSERT INTO usuario 
        (cedula, username, password, email, id_rol) 
        VALUES (?, ?, ?, ?, ?)`;

        const valores = [cedula, nombre, password, email, rol];
        
        console.log('Insertando usuario con valores:', valores);
        
        conexion.query(insert, valores, (error, results) => {
            if (error) {
                console.error('Error al insertar usuario:', error);
                const mensaje = 'Error en el servidor al insertar usuario';
                return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
            }
            const mensaje = 'Usuario agregado exitosamente';
            return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
        });
    });
});

module.exports = router;