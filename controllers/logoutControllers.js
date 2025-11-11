const express = require('express');
const routers = express.Router();

routers.get('/logout', (req, res) => {
    const cedula = req.session.cedula;
    const sesionesActivas = req.app.locals.sesionesActivas;
    
    // Eliminar la sesión activa del mapa
    if (cedula && sesionesActivas) {
        sesionesActivas.delete(cedula);
    }
    
    // Destruir la sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/home');
        }
        
        // Limpiar la cookie
        res.clearCookie('connect.sid');
        console.log('======================================');
        console.log('==== Sesión cerrada correctamente ====');
        console.log('======================================');
        const mensaje = 'Has cerrado sesión exitosamente.';
        res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    });
});

module.exports = routers;