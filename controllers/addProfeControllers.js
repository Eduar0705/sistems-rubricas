const express = require('express')
const router = express.Router()
const conexion = require('../models/conetion')

router.post('/envioProfe', (req, res)=>{
    let mensaje;
    const {cedula, nombre, apellido, email, telefono, especialidad, notas} = req.body;
    const activo = 1;

    const insert = `INSERT INTO docente
    (cedula, nombre, apellido, especializacion, email, telf, descripcion, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const valores = [cedula, nombre, apellido, especialidad, email, telefono, notas, activo]

    conexion.query(insert, valores, (err, result)=>{
        if(err){
            console.log('ERROR en el envio de los datos: ', err);
            console.log('Error completo:', err); // Para más detalles
            mensaje = 'Error en el envio del profesor intente mas tarde';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }
        
        console.log('Se agrego el profesor exitosamente :D');
        mensaje = 'Profesor agregado exitosamente';
        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
    })
})

module.exports = router;