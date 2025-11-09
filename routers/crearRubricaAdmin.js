const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/admin/createrubricas", (req, res) => {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    // Obtener materias y secciones para los selects
    const queryMaterias = 'SELECT codigo, nombre FROM materia WHERE activo = TRUE ORDER BY nombre';
    const querySecciones = `
        SELECT s.id, s.codigo, s.materia_codigo, s.lapso_academico 
        FROM seccion s 
        WHERE s.activo = TRUE 
        ORDER BY s.lapso_academico DESC, s.codigo
    `;
    
    conexion.query(queryMaterias, (error, materias) => {
        if(error) {
            console.error('Error al obtener materias:', error);
            return res.render("admin/createRubricas", {
                datos: req.session,
                title: 'Crear Rúbrica',
                materias: [],
                secciones: []
            });
        }
        
        conexion.query(querySecciones, (error, secciones) => {
            if(error) {
                console.error('Error al obtener secciones:', error);
                return res.render("admin/createRubricas", {
                    datos: req.session,
                    title: 'Crear Rúbrica',
                    materias: materias,
                    secciones: []
                });
            }
            
            res.render("admin/createRubricas", {
                datos: req.session,
                title: 'Crear Rúbrica',
                materias: materias,
                secciones: secciones
            });
        });
    });
});

module.exports = router;

