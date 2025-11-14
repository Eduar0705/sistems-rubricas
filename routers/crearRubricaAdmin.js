const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/admin/createrubricas", (req, res) => {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    // Query para obtener carreras activas
    const queryCarreras = `
        SELECT codigo, nombre, duracion_semestres 
        FROM carrera 
        WHERE activo = TRUE 
        ORDER BY nombre
    `;
    
    // Query para obtener materias con información de carrera y semestre
    const queryMaterias = `
        SELECT 
            m.codigo,
            m.nombre,
            m.carrera_codigo,
            m.semestre,
            c.nombre as carrera_nombre
        FROM materia m
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo
        WHERE m.activo = TRUE
        ORDER BY c.nombre, m.semestre, m.nombre
    `;
    
    // Query para obtener secciones con información completa
    const querySecciones = `
        SELECT 
            s.id,
            s.codigo,
            s.materia_codigo,
            s.lapso_academico,
            m.nombre as materia_nombre,
            m.semestre,
            m.carrera_codigo,
            c.nombre as carrera_nombre
        FROM seccion s
        INNER JOIN materia m ON s.materia_codigo = m.codigo
        INNER JOIN carrera c ON m.carrera_codigo = c.codigo
        WHERE s.activo = TRUE
        ORDER BY c.nombre, m.semestre, m.nombre, s.codigo
    `;
    
    // Ejecutar las consultas en paralelo
    conexion.query(queryCarreras, (error, carreras) => {
        if(error) {
            console.error('Error al obtener carreras:', error);
            return res.render("admin/createRubricas", {
                datos: req.session,
                title: 'Crear Rúbrica',
                carreras: [],
                materias: [],
                secciones: [],
                currentPage: 'createrubricas'
            });
        }
        
        conexion.query(queryMaterias, (error, materias) => {
            if(error) {
                console.error('Error al obtener materias:', error);
                return res.render("admin/createRubricas", {
                    datos: req.session,
                    title: 'Crear Rúbrica',
                    carreras: carreras,
                    materias: [],
                    secciones: [],
                    currentPage: 'createrubricas'
                });
            }
            
            conexion.query(querySecciones, (error, secciones) => {
                if(error) {
                    console.error('Error al obtener secciones:', error);
                    return res.render("admin/createRubricas", {
                        datos: req.session,
                        title: 'Crear Rúbrica',
                        carreras: carreras,
                        materias: materias,
                        secciones: [],
                        currentPage: 'createrubricas'
                    });
                }
                
                // Organizar los datos de manera jerárquica
                const datosJerarquicos = organizarDatosJerarquicos(carreras, materias, secciones);
                
                res.render("admin/createRubricas", {
                    datos: req.session,
                    title: 'Crear Rúbrica',
                    carreras: carreras,
                    materias: materias,
                    secciones: secciones,
                    datosJerarquicos: datosJerarquicos,
                    currentPage: 'createrubricas'
                });
            });
        });
    });
});

// Función auxiliar para organizar los datos de manera jerárquica
function organizarDatosJerarquicos(carreras, materias, secciones) {
    return carreras.map(carrera => {
        // Obtener los semestres únicos para esta carrera
        const semestresSet = new Set();
        materias
            .filter(m => m.carrera_codigo === carrera.codigo)
            .forEach(m => semestresSet.add(m.semestre));
        
        const semestres = Array.from(semestresSet).sort((a, b) => a - b);
        
        return {
            codigo: carrera.codigo,
            nombre: carrera.nombre,
            duracion_semestres: carrera.duracion_semestres,
            semestres: semestres.map(numSemestre => {
                // Obtener materias de este semestre
                const materiasDelSemestre = materias.filter(m => 
                    m.carrera_codigo === carrera.codigo && 
                    m.semestre === numSemestre
                );
                
                return {
                    numero: numSemestre,
                    materias: materiasDelSemestre.map(materia => {
                        // Obtener secciones de esta materia
                        const seccionesDeMateria = secciones.filter(s => 
                            s.materia_codigo === materia.codigo
                        );
                        
                        return {
                            codigo: materia.codigo,
                            nombre: materia.nombre,
                            secciones: seccionesDeMateria
                        };
                    })
                };
            })
        };
    });
}

// Ruta API para obtener materias por carrera y semestre (útil para selects dinámicos)
router.get("/api/materias/:carrera/:semestre", (req, res) => {
    const { carrera, semestre } = req.params;
    
    const query = `
        SELECT codigo, nombre, semestre
        FROM materia
        WHERE carrera_codigo = ? AND semestre = ? AND activo = TRUE
        ORDER BY nombre
    `;
    
    conexion.query(query, [carrera, semestre], (error, results) => {
        if(error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// Ruta API para obtener secciones por materia
router.get("/api/secciones/:materia", (req, res) => {
    const { materia } = req.params;
    
    const query = `
        SELECT 
            s.id,
            s.codigo,
            s.lapso_academico,
            s.horario,
            s.aula
        FROM seccion s
        WHERE s.materia_codigo = ? AND s.activo = TRUE
        ORDER BY s.lapso_academico DESC, s.codigo
    `;
    
    conexion.query(query, [materia], (error, results) => {
        if(error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});

// Ruta API para obtener semestres por carrera
router.get("/api/semestres/:carrera", (req, res) => {
    const { carrera } = req.params;
    
    const query = `
        SELECT DISTINCT semestre
        FROM materia
        WHERE carrera_codigo = ? AND activo = TRUE
        ORDER BY semestre
    `;
    
    conexion.query(query, [carrera], (error, results) => {
        if(error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        res.json(results.map(r => r.semestre));
    });
});

module.exports = router;