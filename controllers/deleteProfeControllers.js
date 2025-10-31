const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get('/deleteProfe/:cedula', (req, res) => {
    let mensaje;
    const  cedula  = req.params.cedula;

    const sql = `DELETE FROM docente WHERE cedula = ?`;
    conexion.query(sql, [cedula], (err, result) => {
        if (err) {
            console.log('Error al eliminar profesor: ', err);
            mensaje = 'Error al eliminar profesor. Intente más tarde.';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }

        mensaje = 'Profesor eliminado exitosamente.';
        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
    });
})

module.exports = router;