const express = require('express');
const router = express.Router();

router.get("/admin/profesores", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    res.render("admin/Profesores", {datos : req.session, title: 'SGR - Profesores'});
});

module.exports = router;