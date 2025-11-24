const express = require('express')
const router = express.Router()
const conexion = require('../models/conetion')

router.get('/admin/evaluacion=docente', (req, res)=>{
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }
    res.render('admin/evaluacionDocente', {
        datos: req.session,
        title: 'SGR - Evaluacion Docente',
        currentPage: 'eva-doc'})
})

module.exports = router