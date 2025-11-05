const express = require('express');
const router = express.Router()

router.get('/teacher/evaluacion', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    res.render("teacher/evaluaciones", {datos: req.session, title: 'SGR - Evaluación'});
});

module.exports = router;