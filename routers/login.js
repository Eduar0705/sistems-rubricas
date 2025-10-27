const express = require('express');
const router = express.Router();

router.get("/login", function(req, res) {
    const mensaje = req.query.mensaje;
    res.render("auth/login", { title: "Iniciar Sesión", mensaje });
});

module.exports = router;