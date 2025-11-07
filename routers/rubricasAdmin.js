const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

// Ruta para listar rúbricas
router.get("/admin/rubricas", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    const query = `
        SELECT 
            r.id,
            r.nombre_rubrica,
            r.fecha_evaluacion,
            r.fecha_creacion,
            r.porcentaje_evaluacion,
            r.tipo_evaluacion,
            r.activo,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            s.codigo as seccion_codigo,
            CONCAT(d.nombre, ' ', d.apellido) as docente_nombre
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = TRUE
        ORDER BY r.fecha_creacion DESC
    `;
    
    connection.query(query, (error, rubricas) => {
        if(error) {
            console.error('Error al obtener rúbricas:', error);
            return res.render("admin/rubricas", {
                datos: req.session,
                title: 'SGR - Rúbricas',
                rubricas: []
            });
        }
        
        res.render("admin/rubricas", {
            datos: req.session,
            title: 'SGR - Rúbricas',
            rubricas: rubricas
        });
    });
});

// Ruta API para obtener detalle de rúbrica
router.get("/admin/rubricas/detalle/:id", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    
    const rubricaId = req.params.id;
    
    const queryRubrica = `
        SELECT 
            r.*,
            m.nombre as materia_nombre,
            s.codigo as seccion_codigo,
            s.lapso_academico,
            c.nombre as carrera_nombre,
            CONCAT(d.nombre, ' ', d.apellido) as docente_nombre
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        INNER JOIN docente d ON r.docente_cedula = d.cedula
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo
        WHERE r.id = ?
    `;
    
    const queryCriterios = `
        SELECT 
            c.id,
            c.descripcion,
            c.puntaje_maximo,
            c.orden
        FROM criterio_evaluacion c
        WHERE c.rubrica_id = ?
        ORDER BY c.orden
    `;
    
    const queryNiveles = `
        SELECT 
            n.id,
            n.criterio_id,
            n.nombre_nivel,
            n.descripcion,
            n.puntaje,
            n.orden
        FROM nivel_desempeno n
        INNER JOIN criterio_evaluacion c ON n.criterio_id = c.id
        WHERE c.rubrica_id = ?
        ORDER BY c.orden, n.orden DESC
    `;
    
    connection.query(queryRubrica, [rubricaId], (error, rubrica) => {
        if(error || rubrica.length === 0) {
            return res.status(404).json({ success: false, message: 'Rúbrica no encontrada' });
        }
        
        connection.query(queryCriterios, [rubricaId], (error, criterios) => {
            if(error) {
                return res.status(500).json({ success: false, message: 'Error al obtener criterios' });
            }
            
            connection.query(queryNiveles, [rubricaId], (error, niveles) => {
                if(error) {
                    return res.status(500).json({ success: false, message: 'Error al obtener niveles' });
                }
                
                const criteriosConNiveles = criterios.map(criterio => ({
                    ...criterio,
                    niveles: niveles.filter(nivel => nivel.criterio_id === criterio.id)
                }));
                
                res.json({
                    success: true,
                    rubrica: rubrica[0],
                    criterios: criteriosConNiveles
                });
            });
        });
    });
});

module.exports = router;