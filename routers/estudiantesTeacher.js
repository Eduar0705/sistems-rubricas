const express = require('express')
const router = express.Router()
const modelo = require('../models/estudiantesModel')

router.get('/teacher/students', async function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    try {
        // Obtener todos los datos necesarios
        const estudiantesData = await modelo.MostrarEstudiantes();
        const seccionesData = await modelo.MostrarSecciones();
        const carrerasData = await modelo.MostrarCarreras();
        const estudiantesSecData = await modelo.MostrarEstudiantesSec();
        
        // Procesar datos para agregar información adicional
        const estudiantesCompletos = estudiantesData.map(estudiante => {
            // Buscar la relación en estudiante_sec
            const estudianteSec = estudiantesSecData.find(
                es => es.ced_estudiante === estudiante.cedula
            );
            
            return {
                ...estudiante,
                evaluaciones: 0, // Aquí irían las evaluaciones del estudiante
                promedio: estudianteSec ? estudianteSec.promedio : 0,
                estado: estudianteSec ? estudianteSec.estado : 'CURSANDO',
                id_sec: estudianteSec ? estudianteSec.id_sec : null
            };
        });

        res.render("teacher/estudiantes", {
            datos: req.session, 
            estudiantes: estudiantesCompletos,
            secciones: seccionesData,
            carreras: carrerasData,
            title: 'SGR - Estudiantes'
        });
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.render("teacher/estudiantes", {
            datos: req.session,
            estudiantes: [],
            secciones: [],
            carreras: [],
            error: 'Error al cargar los estudiantes',
            title: 'SGR - Estudiantes'
        });
    }
});

// Ruta para obtener estudiantes de una sección específica
router.get('/teacher/students/seccion/:id', async function(req, res){
    if(!req.session.login){
        return res.redirect('/login');
    }
    
    try {
        const id_sec = req.params.id;
        const estudiantesSec = await modelo.ObtenerEstudiantesPorSeccion(id_sec);
        
        // Obtener información completa de cada estudiante
        const estudiantesCompletos = await Promise.all(
            estudiantesSec.map(async (es) => {
                const estudiante = await modelo.ObtenerEstudiantePorCedula(es.ced_estudiante);
                return {
                    ...estudiante,
                    promedio: es.promedio,
                    estado: es.estado
                };
            })
        );
        
        res.json(estudiantesCompletos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
});

// Ruta para obtener un estudiante específico
router.get('/teacher/students/:cedula', async function(req, res){
    if(!req.session.login){
        return res.redirect('/login');
    }
    
    try {
        const cedula = req.params.cedula;
        const estudiante = await modelo.ObtenerEstudiantePorCedula(cedula);
        res.json(estudiante);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener estudiante' });
    }
});

module.exports = router;