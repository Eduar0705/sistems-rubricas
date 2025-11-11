const express = require('express');
const routers = express.Router();
const conexion = require('../models/conetion');

routers.post('/verifLogin', (req, res) => {
    const { cedula, password } = req.body;

    // Obtener el objeto de sesiones activas
    const sesionesActivas = req.app.locals.sesionesActivas;

    // Verificar si ya existe una sesión activa para esta cédula
    if (sesionesActivas.has(cedula)) {
        const sesionExistente = sesionesActivas.get(cedula);
        const tiempoTranscurrido = Date.now() - sesionExistente.inicioSesion;
        const tiempoRestante = Math.ceil((300000 - tiempoTranscurrido) / 1000 / 60); // en minutos
        
        const mensaje = `Este usuario ya tiene una sesión activa. Por favor, espera aproximadamente ${tiempoRestante} minuto(s) para poder iniciar sesión nuevamente.`;
        return res.render('auth/login', { mensaje });
    }

    const query = 'SELECT * FROM usuario WHERE cedula = ? AND password = ?';
    conexion.query(query, [cedula, password], (err, results) => {
        let mensaje;
        if (err) {
            console.log('Error en la consulta: ' + err);
            mensaje = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
            return res.render('auth/login', { mensaje });
        }

        if (results.length <= 0) {
            mensaje = 'Cédula o contraseña incorrecta. Por favor, inténtalo de nuevo.';
            return res.render('auth/login', { mensaje });
        }

        const user = results[0];

        if (password !== user.password) {
            mensaje = 'Contraseña incorrecta. Por favor, inténtalo de nuevo.';
            return res.render('auth/login', { mensaje });
        }

        // Almacenamos el usuario en la sesión
        req.session.login = true;
        req.session.username = user.username;
        req.session.cedula = user.cedula;
        req.session.email = user.email;
        req.session.id_rol = user.id_rol;
        req.session.activo = user.activo;
        req.session.ultimaActividad = Date.now();

        // Registrar la sesión activa
        sesionesActivas.set(cedula, {
            sessionId: req.sessionID,
            inicioSesion: Date.now(),
            userId: user.id
        });

        // Configurar un temporizador para eliminar la sesión después de 5 minutos de inactividad
        setTimeout(() => {
            sesionesActivas.delete(cedula);
        }, 300000); // 5 minutos

        console.log(req.session);

        if (user.id_rol === 1) {
            res.redirect('/home');
        } else if (user.id_rol === 2) {
            res.redirect('/teacher');
        } else if (user.id_rol === 3) {
            res.redirect('/student');
        } else {
            mensaje = 'Rol de usuario no reconocido.';
            return res.render('auth/login', { mensaje });
        }
    });
});

module.exports = routers;