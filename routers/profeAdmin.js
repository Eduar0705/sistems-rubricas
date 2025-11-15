const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// ============================================================
// PÁGINA PRINCIPAL DE PROFESORES
// ============================================================
router.get("/admin/profesores", function(req, res) {
    const mensaje = req.query.mensaje;
    
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }
    
    conexion.query('SELECT * FROM docente WHERE activo = 1 ORDER BY apellido, nombre', (err, results) => {
        if (err) {
            console.log('Error al obtener los profesores:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.render("admin/Profesores", {
            mensaje: mensaje,
            datos: req.session,
            profesores: results,
            title: 'SGR - Profesores',
            currentPage: 'profesores'
        });
    });
});

// ============================================================
// API: OBTENER PERMISOS DE UN DOCENTE
// ============================================================
router.get('/api/permisos/docente/:cedula', (req, res) => {
    const { cedula } = req.params;
    
    const query = `
        SELECT 
            p.id,
            p.carrera_codigo,
            p.semestre,
            p.materia_codigo,
            p.seccion_id,
            c.nombre as carrera_nombre,
            m.nombre as materia_nombre,
            s.codigo as seccion_codigo,
            s.lapso_academico
        FROM permisos p
        INNER JOIN carrera c ON p.carrera_codigo = c.codigo
        INNER JOIN materia m ON p.materia_codigo = m.codigo
        INNER JOIN seccion s ON p.seccion_id = s.id
        WHERE p.docente_cedula = ? AND p.activo = 1
        ORDER BY c.nombre, p.semestre, m.nombre, s.codigo
    `;
    
    conexion.query(query, [cedula], (error, results) => {
        if (error) {
            console.error('Error al obtener permisos:', error);
            return res.status(500).json({ error: 'Error al obtener permisos' });
        }
        res.json(results);
    });
});

// ============================================================
// API: OBTENER TODAS LAS CARRERAS
// ============================================================
router.get('/api/carreras', (req, res) => {
    const query = 'SELECT codigo, nombre FROM carrera WHERE activo = 1 ORDER BY nombre';
    
    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener carreras:', error);
            return res.status(500).json({ error: 'Error al obtener carreras' });
        }
        res.json(results);
    });
});

// ============================================================
// API: OBTENER SEMESTRES DE UNA CARRERA
// ============================================================
router.get('/api/semestres/:carreraCode', (req, res) => {
    const { carreraCode } = req.params;
    
    const query = `
        SELECT DISTINCT semestre 
        FROM materia 
        WHERE carrera_codigo = ? AND activo = 1 
        ORDER BY semestre
    `;
    
    conexion.query(query, [carreraCode], (error, results) => {
        if (error) {
            console.error('Error al obtener semestres:', error);
            return res.status(500).json({ error: 'Error al obtener semestres' });
        }
        // Convertir a array simple de números
        const semestres = results.map(row => row.semestre);
        res.json(semestres);
    });
});

// ============================================================
// API: OBTENER MATERIAS DE UNA CARRERA Y SEMESTRE
// ============================================================
router.get('/api/materias/:carreraCode/:semestre', (req, res) => {
    const { carreraCode, semestre } = req.params;
    
    const query = `
        SELECT codigo, nombre, creditos
        FROM materia 
        WHERE carrera_codigo = ? AND semestre = ? AND activo = 1
        ORDER BY nombre
    `;
    
    conexion.query(query, [carreraCode, semestre], (error, results) => {
        if (error) {
            console.error('Error al obtener materias:', error);
            return res.status(500).json({ error: 'Error al obtener materias' });
        }
        res.json(results);
    });
});

// ============================================================
// API: OBTENER SECCIONES DE UNA MATERIA
// ============================================================
router.get('/api/secciones/:materiaCode', (req, res) => {
    const { materiaCode } = req.params;
    
    const query = `
        SELECT 
            id, 
            codigo, 
            lapso_academico, 
            horario, 
            aula,
            capacidad_maxima
        FROM seccion 
        WHERE materia_codigo = ? AND activo = 1
        ORDER BY codigo
    `;
    
    conexion.query(query, [materiaCode], (error, results) => {
        if (error) {
            console.error('Error al obtener secciones:', error);
            return res.status(500).json({ error: 'Error al obtener secciones' });
        }
        res.json(results);
    });
});

// ============================================================
// API: CREAR NUEVO PERMISO
// ============================================================
router.post('/api/permisos', (req, res) => {
    const { docente_cedula, carrera_codigo, semestre, materia_codigo, seccion_id } = req.body;
    
    // Validar datos requeridos
    if (!docente_cedula || !carrera_codigo || !semestre || !materia_codigo || !seccion_id) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    // Verificar si el permiso ya existe
    const checkQuery = `
        SELECT id FROM permisos 
        WHERE docente_cedula = ? 
        AND carrera_codigo = ? 
        AND semestre = ? 
        AND materia_codigo = ? 
        AND seccion_id = ?
    `;
    
    conexion.query(checkQuery, [docente_cedula, carrera_codigo, semestre, materia_codigo, seccion_id], (error, results) => {
        if (error) {
            console.error('Error al verificar permiso:', error);
            return res.status(500).json({ error: 'Error al verificar permiso existente' });
        }
        
        if (results.length > 0) {
            return res.status(409).json({ error: 'Duplicate: Este permiso ya existe para este docente' });
        }
        
        // Insertar nuevo permiso
        const insertQuery = `
            INSERT INTO permisos 
            (docente_cedula, carrera_codigo, semestre, materia_codigo, seccion_id, activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `;
        
        conexion.query(insertQuery, [docente_cedula, carrera_codigo, semestre, materia_codigo, seccion_id], (error, result) => {
            if (error) {
                console.error('Error al crear permiso:', error);
                return res.status(500).json({ error: 'Error al crear permiso: ' + error.message });
            }
            res.json({ success: true, id: result.insertId, message: 'Permiso creado exitosamente' });
        });
    });
});

// ============================================================
// API: ELIMINAR PERMISO
// ============================================================
router.delete('/api/permisos/:id', (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ error: 'ID de permiso requerido' });
    }
    
    // Usar soft delete (marcar como inactivo) en lugar de eliminar físicamente
    const query = 'UPDATE permisos SET activo = 0 WHERE id = ?';
    
    // Si prefieres eliminar físicamente, usa:
    // const query = 'DELETE FROM permisos WHERE id = ?';
    
    conexion.query(query, [id], (error, result) => {
        if (error) {
            console.error('Error al eliminar permiso:', error);
            return res.status(500).json({ error: 'Error al eliminar permiso: ' + error.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Permiso no encontrado' });
        }
        
        res.json({ success: true, message: 'Permiso eliminado exitosamente' });
    });
});

// ============================================================
// API: OBTENER INFORMACIÓN COMPLETA DE UN PERMISO
// ============================================================
router.get('/api/permisos/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            p.*,
            d.nombre as docente_nombre,
            d.apellido as docente_apellido,
            c.nombre as carrera_nombre,
            m.nombre as materia_nombre,
            s.codigo as seccion_codigo,
            s.lapso_academico
        FROM permisos p
        INNER JOIN docente d ON p.docente_cedula = d.cedula
        INNER JOIN carrera c ON p.carrera_codigo = c.codigo
        INNER JOIN materia m ON p.materia_codigo = m.codigo
        INNER JOIN seccion s ON p.seccion_id = s.id
        WHERE p.id = ?
    `;
    
    conexion.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener permiso:', error);
            return res.status(500).json({ error: 'Error al obtener permiso' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Permiso no encontrado' });
        }
        
        res.json(results[0]);
    });
});

// ============================================================
// API: ACTUALIZAR PERMISO
// ============================================================
router.put('/api/permisos/:id', (req, res) => {
    const { id } = req.params;
    const { carrera_codigo, semestre, materia_codigo, seccion_id } = req.body;
    
    if (!carrera_codigo || !semestre || !materia_codigo || !seccion_id) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const query = `
        UPDATE permisos 
        SET carrera_codigo = ?, 
            semestre = ?, 
            materia_codigo = ?, 
            seccion_id = ?
        WHERE id = ?
    `;
    
    conexion.query(query, [carrera_codigo, semestre, materia_codigo, seccion_id, id], (error, result) => {
        if (error) {
            console.error('Error al actualizar permiso:', error);
            return res.status(500).json({ error: 'Error al actualizar permiso: ' + error.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Permiso no encontrado' });
        }
        
        res.json({ success: true, message: 'Permiso actualizado exitosamente' });
    });
});

module.exports = router;