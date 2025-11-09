const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.delete('/deleteRubrica/:id', (req, res) => {
    const rubricaId = req.params.id;
    let mensaje;
})

module.exports = router;