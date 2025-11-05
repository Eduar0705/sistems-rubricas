const express = require('express');
const router = express.Router()

router.get('/teacher/createrubricas', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    res.render("teacher/crearRubrica", {datos: req.session, title: 'SGR - Crear Rúbrica'});
});

module.exports = router;