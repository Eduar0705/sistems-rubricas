const express = require('express')
const router = express.Router()
// const conexion = require('../models/connection')

router.get('/students/calificaciones', (req, res) => {
    if (!req.session || !req.session.login) {
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.'
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje))
    }
    res.render('studen/calificaciones', { datos: req.session, currentPage: 'calificaciones'})
})

module.exports = router