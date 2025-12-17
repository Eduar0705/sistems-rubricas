const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/deleteUser/:cedula', (req, res) => {
    // Validar sesión
    if (!req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    let mensaje;
    const cedula = req.params.cedula;

    const sql = `DELETE FROM usuario WHERE cedula = ?`;
    conexion.query(sql, [cedula], (err, result) => {
        if (err) {
            console.log('Error al eliminar usuario: ', err);
            mensaje = 'Error al eliminar usuario. Intente más tarde.';
            return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
        }

        mensaje = 'Usuario eliminado exitosamente.';
        console.log('Usuario eliminado exitosamente.');
        return res.redirect('/admin/config?mensaje=' + encodeURIComponent(mensaje));
    });
})

module.exports = router;