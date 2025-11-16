const express = require('express');
const router = express.Router()

router.get('/teacher/report', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    res.render("teacher/reportes", {datos: req.session, title: 'SGR - Reportes', currentPage: 'reportes'});
});

module.exports = router;