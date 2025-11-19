const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/student", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    res.render("home/studens", {datos : req.session, currentPage: 'student'}
    );
});

module.exports = router;