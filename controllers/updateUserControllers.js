const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.post('/updateUser', (req, res) => {
    let mensaje;
    const { cedulaOriginal, cedula, nombre, email, password, rol } = req.body;

    // Verificar si se debe actualizar la contraseña
    if (password && password.trim() !== '') {
        // Actualizar CON contraseña nueva
        const update = `UPDATE usuario SET cedula = ?, username = ?, password = ?, email = ?, id_rol = ? WHERE cedula = ?`;
        const valores = [cedula, nombre, password, email, rol, cedulaOriginal];

        conexion.query(update, valores, (error, result) => {
            if (error) {
                console.log('Error en la consulta: ', error);
                mensaje = 'Error al actualizar el usuario';
                return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
            }

            if (result.affectedRows === 0) {
                mensaje = 'Error: No se encontró el usuario con la cédula proporcionada';
            } else {
                mensaje = 'Usuario actualizado correctamente';
            }

            return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
        });
    } else {
        // Actualizar SIN cambiar la contraseña
        const update = `UPDATE usuario SET cedula = ?, username = ?, email = ?, id_rol = ? WHERE cedula = ?`;
        const valores = [cedula, nombre, email, rol, cedulaOriginal];

        conexion.query(update, valores, (error, result) => {
            if (error) {
                console.log('Error en la consulta: ', error);
                mensaje = 'Error al actualizar el usuario';
                return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
            }

            if (result.affectedRows === 0) {
                mensaje = 'Error: No se encontró el usuario con la cédula proporcionada';
            } else {
                mensaje = 'Usuario actualizado correctamente';
            }

            return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
        });
    }
});

module.exports = router;