const express = require('express');
const routers = express.Router();
const conexion = require('../models/conetion');

routers.post('/verifLogin', (req, res) => {
    const { cedula, password } = req.body;

    // Validar que cedula y password no estén vacíos
    if (!cedula || !password) {
        return res.render('auth/login', {
            mensaje: 'Por favor, ingresa tu cédula y contraseña.',
            sesionActiva: false
        });
    }

    // Obtener el objeto de sesiones activas
    const sesionesActivas = req.app.locals.sesionesActivas;

    // Primero buscar en usuario (profesores, administradores)
    const queryUsuario = 'SELECT * FROM usuario WHERE cedula = ? AND password = ?';
    conexion.query(queryUsuario, [cedula, password], (err, resultsUsuario) => {
        let mensaje;

        if (err) {
            console.log('Error en la consulta de usuario: ' + err);
            mensaje = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
            return res.render('auth/login', { mensaje, sesionActiva: false });
        }

        // Si se encuentra en la tabla usuario
        if (resultsUsuario.length > 0) {
            const user = resultsUsuario[0];

            // Verificar contraseña
            if (password !== user.password) {
                mensaje = 'Contraseña incorrecta. Por favor, inténtalo de nuevo.';
                return res.render('auth/login', { mensaje, sesionActiva: false });
            }

            // Configurar sesión para usuario
            configurarSesionUsuario(req, user, sesionesActivas);

            // Redirigir según el rol
            if (user.id_rol === 1) {
                return res.redirect('/home');
            } else if (user.id_rol === 2) {
                return res.redirect('/teacher');
            } else if (user.id_rol === 3) {
                return res.redirect('/student');
            } else {
                mensaje = 'Rol de usuario no reconocido.';
                return res.render('auth/login', { mensaje, sesionActiva: false });
            }
        }
    });
});

// Función para configurar sesión de usuario
function configurarSesionUsuario(req, user, sesionesActivas) {
    const ahora = Date.now();
    req.session.login = true;
    req.session.username = user.nombre + ' ' + user.apeliido;
    req.session.cedula = user.cedula;
    req.session.email = user.email;
    req.session.id_rol = user.id_rol;
    req.session.activo = user.activo;
    req.session.ultimaActividad = ahora;
    req.session.tipo = req.session.id_rol === 1 ? 'Administrador' : req.session.id_rol === 2 ? 'Profesor' : req.session.id_rol === 3 ? 'Estudiante' :'Desconocido';

    console.log('\n============================================')
    console.log('Usuario autenticado:', req.session.username);
    console.log('Cédula autenticada:', req.session.cedula);
    console.log('Rol:', req.session.tipo);
    console.log('============================================')

    // Registrar la sesión usando sessionID como clave
    if (sesionesActivas && typeof sesionesActivas.set === 'function') {
        sesionesActivas.set(req.sessionID, {
            inicioSesion: ahora,
            ultimaActividad: ahora,
            sessionID: req.sessionID,
            cedula: user.cedula,
            tipo: 'usuario',
            username: user.username
        });
    }
}

// Función para configurar sesión de estudiante
function configurarSesionEstudiante(req, estudiante, sesionesActivas) {
    const ahora = Date.now();
    req.session.login = true;
    req.session.username = estudiante.nombre + ' ' + estudiante.apellido;
    req.session.cedula = estudiante.cedula;
    req.session.email = estudiante.email;
    req.session.telefono = estudiante.telefono;
    req.session.fecha_nacimiento = estudiante.fecha_nacimiento;
    req.session.carrera_codigo = estudiante.carrera_codigo;
    req.session.activo = estudiante.activo;
    req.session.ultimaActividad = ahora;
    req.session.tipo = 'estudiante';

    console.log('\n============================================')
    console.log('Estudiante autenticado:', req.session.username);
    console.log('Cédula autenticada:', req.session.cedula);
    console.log('============================================')

    // Registrar la sesión usando sessionID como clave
    if (sesionesActivas && typeof sesionesActivas.set === 'function') {
        sesionesActivas.set(req.sessionID, {
            inicioSesion: ahora,
            ultimaActividad: ahora,
            sessionID: req.sessionID,
            cedula: estudiante.cedula,
            tipo: 'estudiante',
            username: req.session.username
        });
    }
}

module.exports = routers;