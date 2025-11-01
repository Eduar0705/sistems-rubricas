const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/admin/config', (req, res) => {
    const mensaje = req.query.mensaje;
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    conexion.query('SELECT * FROM usuario', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).render('error', { 
                error: 'Error al cargar la configuración',
                mensaje: 'Por favor, intenta nuevamente más tarde.'
            });
        }
        
        res.render('admin/config', {
            mensaje: mensaje,
            datos: req.session,
            usuarios: results,
            title: 'SGR - Configuración'
        });
    });
});

module.exports = router;