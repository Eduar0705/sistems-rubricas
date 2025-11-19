const express = require('express')
const router = express.Router()
// const conexion = require('../models/connection')
const calificacionesController = require('../controllers/calificacionesStudentController')

router.get('/students/calificaciones', calificacionesController.getCalificaciones)

module.exports = router