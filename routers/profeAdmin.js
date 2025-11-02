const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/admin/profesores", function(req, res) {
    const mensaje = req.query.mensaje;
    
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    conexion.query('SELECT * FROM docente', (err, results) => {
        if (err) {
            console.log('Error al obtener los profesores:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.render("admin/Profesores", {
            mensaje: mensaje, 
            datos: req.session, 
            profesores: results, 
            title: 'SGR - Profesores'
        });
    });
});

module.exports = router;