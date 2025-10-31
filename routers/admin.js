const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/home", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Contar los profesores
    let countProfesoresQuery = 'SELECT COUNT(*) AS totalProfesores FROM docente';
    conexion.query(countProfesoresQuery, (err, profesResult) => {
        if (err) {
            console.log('Error al contar profesores: ', err);
            return res.render("home/index", {
                datos: req.session, 
                title: 'Sistema de Gestion de Rubricas',
                totalProfesores: 0 // o null según prefieras
            });
        }
        
        const totalProfesores = profesResult[0].totalProfesores;
        
        // Renderizar dentro del callback con los datos obtenidos
        res.render("home/index", {
            datos: req.session, 
            title: 'Sistema de Gestion de Rubricas', 
            totalProfesores: totalProfesores
        });
    });
});

module.exports = router;