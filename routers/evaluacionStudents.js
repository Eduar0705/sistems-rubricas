const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/student/evaluaciones', (req, res) => {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    res.render('studen/evaluaciones', {datos : req.session});
});

module.exports = router;