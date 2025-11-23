const express = require('express')
const router = express.Router()
const conexion = require('../models/conetion')

router.post('/envioProfe', (req, res) => {
    const { cedula, nombre, apellido, email, telefono, especialidad, notas } = req.body;

    // Validación básica de datos requeridos
    if (!cedula || !nombre || !apellido || !email || !telefono || !especialidad) {
        const mensaje = 'Todos los campos son obligatorios';
        return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
    }

    const activo = 1;
    const verifdatos = `SELECT * FROM docente WHERE cedula = ? OR email = ? OR telf = ?`;

    conexion.query(verifdatos, [cedula, email, telefono], (err, results) => {
        if (err) {
            console.error('Error en la verificación de datos:', err);
            const mensaje = 'Error en el servidor';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }

        if (results.length > 0) {
            // Determinar qué campo está duplicado
            let campo = 'dato';
            if (results[0].cedula === cedula) {
                campo = 'cédula';
            } else if (results[0].email === email) {
                campo = 'email';
            } else if (results[0].telf === telefono) {
                campo = 'teléfono';
            }

            console.log('Ya el profesor existe con ese', campo);
            const mensaje = `Error, ya existe un profesor con ese ${campo}`;
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        }

        const insert = `INSERT INTO docente
        (cedula, nombre, apellido, especializacion, email, telf, descripcion, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const valores = [cedula, nombre, apellido, especialidad, email, telefono, notas, activo];

        conexion.query(insert, valores, (err, result) => {
            if (err) {
                console.error('Error al insertar profesor:', err);
                const mensaje = 'Error al guardar el profesor';
                return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
            }

            console.log('Profesor agregado exitosamente. ID:', result.insertId);
            const mensaje = 'Profesor agregado exitosamente :D';
            return res.redirect('/admin/profesores?mensaje=' + encodeURIComponent(mensaje));
        });
    });
});

module.exports = router;