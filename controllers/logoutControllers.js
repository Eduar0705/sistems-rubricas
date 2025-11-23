const express = require('express');
const routers = express.Router();

routers.get('/logout', (req, res) => {
    const cedula = req.session.cedula;
    const sesionesActivas = req.app.locals.sesionesActivas;
    
    // Destruir la sesión primero
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/home');
        }
        
        // Solo eliminar del Map si la sesión se destruyó correctamente
        if (cedula && sesionesActivas) {
            try {
                sesionesActivas.delete(cedula);
                console.log(`✅ Sesión eliminada del Map: ${cedula}`);
            } catch (error) {
                console.error('Error al eliminar sesión del Map:', error);
            }
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