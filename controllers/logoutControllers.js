const express = require('express');
const routers = express.Router();

routers.get('/logout', (req, res) => {
    const sessionID = req.sessionID;
    const sesionesActivas = req.app.locals.sesionesActivas;

    // Destruir la sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/home');
        }

        // Eliminar la sesión activa del mapa usando sessionID
        if (sessionID && sesionesActivas) {
            sesionesActivas.delete(sessionID);
        }

        // Limpiar la cookie
        res.clearCookie('session_cookie_name');
        res.clearCookie('connect.sid');

        console.log('======================================');
        console.log('==== Sesión cerrada correctamente ====');
        console.log('======================================');
        const mensaje = 'Has cerrado sesión exitosamente.';
        res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    });
});

module.exports = routers;