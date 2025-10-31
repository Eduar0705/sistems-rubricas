const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.post('/updateProfe', (req, res) => {
    try {
        let mensaje;
        const {cedula, nombre, apellido, email, telefono, especialidad, notas, activo} = req.body;

        const update = `UPDATE docente SET nombre = ?, apellido = ?, especializacion = ?, email = ?, telf = ?, descripcion = ?, activo = ? WHERE cedula = ?`;
        const valores = [nombre, apellido, especialidad, email, telefono, notas, activo, cedula];
        
        conexion.query(update, valores, (error, results) => {
            if (error) {
                console.error('Error en la consulta:', error);
                mensaje = 'Error al actualizar el profesor';
                return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
            }
            
            // Verificar si se actualizó algún registro
            if (results.affectedRows === 0) {
                mensaje = 'No se encontró el profesor con la cédula proporcionada';
            } else {
                mensaje = 'Profesor actualizado correctamente';
            }
            
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        });
        
    } catch (error) {
        console.error('Error inesperado:', error);
        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent('Error interno del servidor'));
    }
});

module.exports = router;