const express = require('express');
const session = require('express-session');
const app = express();
const title = 'APP';
const PORT = process.env.PORT || 3008;

// Objeto para rastrear sesiones activas por usuario
const sesionesActivas = new Map();

// CONFIGURACIONES
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi-secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 20  // 20 minutos de inactividad
    }
}));

// Middleware para verificar la inactividad de la sesión
app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        const ahora = Date.now();
        const ultimaActividad = req.session.ultimaActividad || ahora;
        const tiempoInactivo = ahora - ultimaActividad;
        
        // Si han pasado más de 5 minutos (300000 ms)
        if (tiempoInactivo > 300000) {
            const cedula = req.session.cedula;
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error al destruir la sesión:', err);
                }
                // Eliminar la sesión activa del mapa
                if (cedula) {
                    sesionesActivas.delete(cedula);
                }
                return res.redirect('/login');
            });
        } else {
            // Actualizar la última actividad
            req.session.ultimaActividad = ahora;
            next();
        }
    } else {
        next();
    }
});

// Hacer disponible el objeto de sesiones activas globalmente
app.locals.sesionesActivas = sesionesActivas;

// RUTAS PRINCIPALES
app.use(require('./routers/login'));
app.use(require('./controllers/logoutControllers'))

//RUTAS DE LOS CONTROLLERS
app.use(require('./controllers/login'));
app.use(require('./controllers/addProfeControllers'));
app.use(require('./controllers/deleteProfeControllers'));
app.use(require('./controllers/updateProfeControllers'));
app.use(require('./controllers/addUserControllers'));
app.use(require('./controllers/updateUserControllers'))
app.use(require('./controllers/deleteUserControllers'))
app.use(require('./controllers/createRubricaAdmin'));
app.use(require('./controllers/createRubricaTeacher'));
app.use(require('./controllers/updateRubricas'));

//RUTAS ADMIN
app.use(require('./routers/admin'));
app.use(require('./routers/rubricasAdmin'));
app.use(require('./routers/crearRubricaAdmin'));
app.use(require('./routers/evaluacionAdmin'));
app.use(require('./routers/profeAdmin'));
app.use(require('./routers/reportesAdmin'));
app.use(require('./routers/configAdmin'));
app.use(require('./controllers/deleteRubrica'))
app.use(require('./routers/notificaciones'));

//RUTAS TEACHER
app.use(require('./routers/teacher'));
app.use(require('./routers/crearRubricaTeachers'));
app.use(require('./routers/estudiantesTeacher'));
app.use(require('./routers/evaluacionTeacher'));
app.use(require('./routers/reportesTeacher'));
app.use(require('./routers/rubricasTeacher'));
app.use(require('./controllers/Evaluar'))

//RUTAS STUDENT
app.use(require('./routers/student'));
app.use(require('./routers/evaluacionStudents'));
app.use(require('./routers/calificacionesStudents'));


// MANEJO DE ERROR 404 
app.use((req, res, next) => {
    res.status(404).render('error/404', { 
        title: `${title} - Página No Encontrada`,
        url: req.originalUrl
    });
});

// MANEJO DE ERROR 500
app.use((err, req, res, next) => {
    console.error('Error 500:', err.stack);
    res.status(500).render('error/500', { 
        title: `${title} - Error del Servidor`,
        error: process.env.NODE_ENV === 'development' ? err : null
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});