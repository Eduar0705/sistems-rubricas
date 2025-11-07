const express = require('express')
const router = express.Router()
const modelo = require('../models/estudiantesModel')

router.get('/teacher/students', async function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const estudiantes = await modelo.obtenerInfo();
    const secciones = await modelo.obtenerSeccion();


    res.render("teacher/estudiantes",{
        datos: req.session,
        title: 'SGR - Estudiantes',
        estudiantes: estudiantes,
        secciones: secciones
    })
});

module.exports = router;