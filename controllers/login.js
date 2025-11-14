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

}

module.exports = routers;