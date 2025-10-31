const express = require('express');
const session = require('express-session');
const app = express();
const title = 'APP';
const PORT = process.env.PORT || 3008;

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
        maxAge: 1000 * 60 * 60 * 24
    } 
}));

// RUTAS PRINCIPALES
app.use(require('./routers/login'));

//RUTAS DE LOS CONTROLLERS
app.use(require('./controllers/login'));
app.use(require('./controllers/addProfeControllers'));
app.use(require('./controllers/deleteProfeControllers'));
app.use(require('./controllers/updateProfeControllers'));

//RUTAS ADMIN
app.use(require('./routers/admin'));
app.use(require('./routers/rubricasAdmin'));
app.use(require('./routers/crearRubricaAdmin'));
app.use(require('./routers/permisosAdmin'));
app.use(require('./routers/evaluacionAdmin'));
app.use(require('./routers/profeAdmin'));
app.use(require('./routers/reportesAdmin'));

//RUTAS TEACHER
app.use(require('./routers/teacher'));

//RUTAS STUDENT
app.use(require('./routers/student'));


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