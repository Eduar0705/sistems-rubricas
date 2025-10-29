const express = require('express');
const router = express.Router();

router.get("/admin/createrubricas", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    res.render("admin/createRubricas", {datos : req.session, title: 'SGR - Crear Rúbrica'});
});

module.exports = router;