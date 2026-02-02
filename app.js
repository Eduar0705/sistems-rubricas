const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const conexionPool = require('./models/conetion');
const app = express();
const title = 'APP';
const PORT = process.env.PORT || 3008;

// Configurar el almacenamiento de sesiones en MySQL
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, // Limpiar sesiones expiradas cada 15 minutos
    expiration: 1200000, // 20 minutos (igual que cookie.maxAge)
    createDatabaseTable: true, // Crear tabla automáticamente si no existe
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, conexionPool);

// Manejar errores del session store
sessionStore.on('error', (error) => {
    console.error('❌ Error en session store:', error.message);
});

// Objeto para rastrear sesiones activas por sessionID (permite múltiples sesiones del mismo usuario)
const sesionesActivas = new Map();

// Función para limpiar sesiones expiradas del Map
function limpiarSesionesExpiradas() {
    const ahora = Date.now();
    const TIMEOUT_SESION = 300000; // 5 minutos

    for (const [sessionID, sesion] of sesionesActivas.entries()) {
        const tiempoInactivo = ahora - (sesion.ultimaActividad || sesion.inicioSesion);
        if (tiempoInactivo > TIMEOUT_SESION) {
            sesionesActivas.delete(sessionID);
        }
    }
}

// Limpiar sesiones expiradas cada 1 minuto
setInterval(limpiarSesionesExpiradas, 60000);

// CONFIGURACIONES
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Configuración de sesiones con MySQL Store
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'mi-secreto-super-seguro-2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true si usas HTTPS
        httpOnly: true, // Previene acceso desde JavaScript del cliente
        maxAge: 1200000,  // 20 minutos de inactividad
        sameSite: 'lax' // Protección CSRF
    }
}));

// Middleware para verificar la inactividad de la sesión
app.use((req, res, next) => {
    if (req.session && req.session.login) {
        const ahora = Date.now();
        const ultimaActividad = req.session.ultimaActividad || ahora;
        const tiempoInactivo = ahora - ultimaActividad;

        // Si han pasado más de 20 minutos (1200000 ms)
        if (tiempoInactivo > 1200000) {
            const sessionID = req.sessionID;
            req.session.destroy((err) => {
                if (err) {
                    console.error('❌ Error al destruir la sesión:', err);
                }
                // Eliminar la sesión activa del mapa usando sessionID
                if (sessionID) {
                    sesionesActivas.delete(sessionID);
                }
                return res.redirect('/login?mensaje=' + encodeURIComponent('Tu sesión ha expirado por inactividad.'));
            });
        } else {
            // Actualizar la última actividad en la sesión
            req.session.ultimaActividad = ahora;

            // Actualizar también en el Map de sesiones activas usando sessionID
            if (req.sessionID && sesionesActivas.has(req.sessionID)) {
                const sesionActiva = sesionesActivas.get(req.sessionID);
                sesionActiva.ultimaActividad = ahora;
            }

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

app.use(require('./routers/exportacion'))
app.use(require('./routers/exportacionAdmin'))

// RUTAS DE LOS CONTROLADORES
app.use(require('./controllers/login'));
app.use(require('./controllers/addProfeControllers'));
app.use(require('./controllers/deleteProfeControllers'));
app.use(require('./controllers/updateProfeControllers'));
app.use(require('./controllers/addUserControllers'));
app.use(require('./controllers/updateUserControllers'))
app.use(require('./controllers/deleteUserControllers'))
app.use(require('./controllers/createRubricaAdmin'));
app.use(require('./controllers/updateRubricas'));
app.use(require('./controllers/evaluacionDocenteController'));

// RUTAS DE ADMINISTRADOR
app.use(require('./routers/admin'));
app.use(require('./routers/rubricasAdmin'));
app.use(require('./routers/crearRubricaAdmin'));
app.use(require('./routers/evaluacionAdmin'));
app.use(require('./routers/profeAdmin'));
app.use(require('./routers/reportesAdmin'));
app.use(require('./routers/configAdmin'));
app.use(require('./controllers/deleteRubrica'))
app.use(require('./routers/notificaciones'))
app.use(require('./routers/evaluacionDocente'))

// RUTAS DE DOCENTE
app.use(require('./routers/teacher'));
app.use(require('./routers/crearRubricaTeachers'));
app.use(require('./routers/estudiantesTeacher'));
app.use(require('./routers/evaluacionTeacher'));
app.use(require('./routers/reportesTeacher'));
app.use(require('./routers/rubricasTeacher'));
app.use(require('./controllers/Evaluar'))

// RUTAS DE ESTUDIANTE
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
    console.log('==============================================');
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('==============================================\n');
});