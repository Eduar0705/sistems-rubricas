const express = require('express');
const router = express.Router()

router.get('/teacher/rubricas', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    res.render("teacher/rubricas", {datos: req.session, title: 'SGR - Rúbricas'});
});

module.exports = router;