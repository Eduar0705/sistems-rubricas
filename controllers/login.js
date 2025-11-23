const express = require('express');
const routers = express.Router();
const conexion = require('../models/conetion');

// Constante para timeout de sesión (debe coincidir con app.js)
const SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || (1000 * 60 * 20); // 20 minutos

routers.post('/verifLogin', (req, res) => {
    const { cedula, password, forzarCierre } = req.body;

    // Validar que cedula y password no estén vacíos
    if (!cedula || !password) {
        return res.render('auth/login', { 
            mensaje: 'Por favor, ingresa tu cédula y contraseña.',
            sesionActiva: false
        });
    }

    // Obtener el objeto de sesiones activas
    const sesionesActivas = req.app.locals.sesionesActivas;

    // Verificar si ya existe una sesión activa para esta cédula
    if (sesionesActivas.has(cedula) && !forzarCierre) {
        const sesionExistente = sesionesActivas.get(cedula);
        const tiempoTranscurrido = Date.now() - (sesionExistente.ultimaActividad || sesionExistente.inicioSesion);
        const tiempoRestante = Math.ceil((SESSION_TIMEOUT - tiempoTranscurrido) / 1000 / 60); // en minutos
        
        // Devolver información para mostrar modal de confirmación
        return res.render('auth/login', { 
            sesionActiva: true,
            cedula: cedula,
            password: password, // Necesario para reenviar
            tiempoRestante: tiempoRestante > 0 ? tiempoRestante : 1,
            mensaje: null
        });
    }

    // Si se forzó el cierre, eliminar la sesión anterior
    if (forzarCierre && sesionesActivas.has(cedula)) {
        sesionesActivas.delete(cedula);
        console.log(`🔄 Sesión anterior forzada a cerrar para: ${cedula}`);
    }

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
            } else {
                mensaje = 'Rol de usuario no reconocido.';
                return res.render('auth/login', { mensaje, sesionActiva: false });
            }
        } else {
            // Si no se encuentra en usuario, buscar en estudiante
            const queryEstudiante = `SELECT * FROM estudiante WHERE cedula = ? AND password = ?`;
            conexion.query(queryEstudiante, [cedula, password], (err, resultsEstudiante) => {
                if (err) {
                    console.log('Error en la consulta de estudiante: ' + err);
                    mensaje = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
                    return res.render('auth/login', { mensaje, sesionActiva: false });
                }

                if (resultsEstudiante.length > 0) {
                    const estudiante = resultsEstudiante[0];

                    // Configurar sesión para estudiante
                    configurarSesionEstudiante(req, estudiante, sesionesActivas);
                    
                    console.log('Sesión de estudiante:', req.session);
                    return res.redirect('/student');
                } else {
                    // No se encontró en ninguna tabla
                    mensaje = 'Cédula o contraseña incorrecta. Por favor, inténtalo de nuevo.';
                    return res.render('auth/login', { mensaje, sesionActiva: false });
                }
            });
        }
    });
});

// Función para configurar sesión de usuario
function configurarSesionUsuario(req, user, sesionesActivas) {
    const ahora = Date.now();
    req.session.login = true;
    req.session.username = user.username;
    req.session.cedula = user.cedula;
    req.session.email = user.email;
    req.session.id_rol = user.id_rol;
    req.session.activo = user.activo;
    req.session.ultimaActividad = ahora;
    req.session.tipo = 'usuario';
    
    console.log('\n============================================')
    console.log('Usuario autenticado:', req.session.username);
    console.log('Cédula autenticada:', req.session.cedula);
    console.log('Rol:', req.session.id_rol === 1 ? 'Administrador' : req.session.id_rol === 2 ? 'Profesor' : 'Desconocido');
    console.log('============================================')

    if (sesionesActivas && typeof sesionesActivas.set === 'function') {
        try {
            sesionesActivas.set(req.session.cedula, {
                inicioSesion: ahora,
                ultimaActividad: ahora,
                sessionID: req.sessionID,
                tipo: 'usuario',
                username: user.username
            });
            console.log(`✅ Sesión registrada en Map: ${req.session.cedula}`);
        } catch (error) {
            console.error('Error al registrar sesión en Map:', error);
        }
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

    if (sesionesActivas && typeof sesionesActivas.set === 'function') {
        try {
            sesionesActivas.set(req.session.cedula, {
                inicioSesion: ahora,
                ultimaActividad: ahora,
                sessionID: req.sessionID,
                tipo: 'estudiante',
                username: req.session.username
            });
            console.log(`✅ Sesión registrada en Map: ${req.session.cedula}`);
        } catch (error) {
            console.error('Error al registrar sesión en Map:', error);
        }
    }
}

module.exports = routers;