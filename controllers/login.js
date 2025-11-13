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

    // Primero buscar en usuario (profesores, administradores)
    const queryUsuario = 'SELECT * FROM usuario WHERE cedula = ? AND password = ?';
    conexion.query(queryUsuario, [cedula, password], (err, resultsUsuario) => {
        let mensaje;
        
        if (err) {
            console.log('Error en la consulta de usuario: ' + err);
            mensaje = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
            return res.render('auth/login', { mensaje });
        }

        // Si se encuentra en la tabla usuario
        if (resultsUsuario.length > 0) {
            const user = resultsUsuario[0];

            // Verificar contraseña
            if (password !== user.password) {
                mensaje = 'Contraseña incorrecta. Por favor, inténtalo de nuevo.';
                return res.render('auth/login', { mensaje });
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
                return res.render('auth/login', { mensaje });
            }
        } else {
            // Si no se encuentra en usuario, buscar en estudiante
            const queryEstudiante = `SELECT * FROM estudiante WHERE cedula = ? AND password = ?`;
            conexion.query(queryEstudiante, [cedula, password], (err, resultsEstudiante) => {
                if (err) {
                    console.log('Error en la consulta de estudiante: ' + err);
                    mensaje = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
                    return res.render('auth/login', { mensaje });
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
                    return res.render('auth/login', { mensaje });
                }
            });
        }
    });
});

// Función para configurar sesión de usuario
function configurarSesionUsuario(req, user, sesionesActivas) {
    req.session.login = true;
    req.session.username = user.username;
    req.session.cedula = user.cedula;
    req.session.email = user.email;
    req.session.id_rol = user.id_rol;
    req.session.activo = user.activo;
    req.session.ultimaActividad = Date.now();
    req.session.tipo = 'usuario';
    console.log('Usuario autenticado:', req.session);

    // Registrar la sesión activa
    registrarSesionActiva(req, user.cedula, user.id, sesionesActivas);
}

// Función para configurar sesión de estudiante
function configurarSesionEstudiante(req, estudiante, sesionesActivas) {
    req.session.login = true;
    req.session.username = estudiante.nombre + ' ' + estudiante.apellido;
    req.session.cedula = estudiante.cedula;
    req.session.email = estudiante.email;
    req.session.telefono = estudiante.telefono;
    req.session.fecha_nacimiento = estudiante.fecha_nacimiento;
    req.session.carrera_codigo = estudiante.carrera_codigo;
    req.session.activo = estudiante.activo;
    req.session.ultimaActividad = Date.now();
    req.session.tipo = 'estudiante';
    console.log('Estudiante autenticado:', req.session);

    // Registrar la sesión activa
    registrarSesionActiva(req, estudiante.cedula, estudiante.id, sesionesActivas);
}

// Función para registrar sesión activa
function registrarSesionActiva(req, cedula, userId, sesionesActivas) {
    const sessionId = req.sessionID;
    const entry = {
        sessionId,
        inicioSesion: Date.now(),
        userId,
        timeout: null
    };

    // Guardar la entrada (incluye referencia al timeout para poder cancelarlo al hacer logout)
    sesionesActivas.set(cedula, entry);

    // Programar eliminación y destrucción de la sesión en 5 minutos
    entry.timeout = setTimeout(() => {
        const current = sesionesActivas.get(cedula);
        // Si la sesión actual no coincide (p. ej. el usuario inició otra sesión), no hacemos nada
        if (!current || current.sessionId !== sessionId) return;

        // Eliminar del mapa de sesiones activas
        sesionesActivas.delete(cedula);

        // Registrar motivo de expiración para que el middleware lo detecte y redirija al /login
        if (req.app) {
            if (!req.app.locals.sesionesExpiradas) req.app.locals.sesionesExpiradas = new Map();
            req.app.locals.sesionesExpiradas.set(sessionId, {
                cedula,
                message: 'Pasó mucho tiempo inactivo. Por favor inicia sesión de nuevo.',
                timestamp: Date.now()
            });
            console.log(`Sesión expirada registrada para sessionId: ${sessionId}, cedula: ${cedula}`);
        }

        // Destruir la sesión en el store de express-session
        if (req.sessionStore && current.sessionId) {
            req.sessionStore.destroy(current.sessionId, (err) => {
                if (err) console.log('Error al destruir la sesión:', err);
                else console.log(`Sesión destruida para cédula: ${cedula}`);
            });
        }

        console.log(`Sesión automáticamente eliminada para cédula: ${cedula}`);
    }, 300000); // 5 minutos
}

module.exports = routers;