const express = require('express');
const router = express.Router();

router.get("/home", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    res.render("home/index", {datos : req.session});
});

module.exports = router;