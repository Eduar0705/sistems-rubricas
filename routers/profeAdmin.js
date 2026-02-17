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
    
    conexion.query(`SELECT
                        u.cedula,
                        u.nombre,
                        u.apeliido AS apellido,
                        ud.especializacion,
                        u.email,
                        ud.telf AS telefono,
                        ud.descripcion,
                        u.activo
                    FROM usuario u
                    INNER JOIN usuario_docente ud ON u.cedula = ud.cedula_usuario
                    WHERE u.activo = 1
                    AND u.id_rol=2 ORDER BY apellido, nombre`, (err, results) => {
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
            pd.id,
            pp.codigo_carrera AS carrera_codigo,
            pp.num_semestre AS semestre,
            pp.codigo_materia AS materia_codigo,
            pd.id_seccion AS seccion_id,
            c.nombre as carrera_nombre,
            m.nombre as materia_nombre,
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
            pp.codigo_periodo AS lapso_academico
        FROM permiso_docente pd
        INNER JOIN seccion s ON pd.id_seccion = s.id
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
        WHERE pd.docente_cedula = ? AND pd.activo = 1
        ORDER BY carrera_nombre, semestre, materia_nombre, seccion_codigo;
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
    const query = `
                SELECT 
                    codigo, 
                    nombre 
                FROM carrera 
                WHERE activo = 1 
                ORDER BY nombre`;
    
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
        SELECT 
            DISTINCT num_semestre AS semestre
        FROM plan_periodo pp
        INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
        WHERE c.codigo = ? 
        AND c.activo = 1 
        ORDER BY semestre;
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
        SELECT 
            m.codigo,
            m.nombre,
            pp.unidades_credito AS creditos
        FROM materia m
        INNER JOIN plan_periodo pp ON m.codigo = pp.codigo_materia
        INNER JOIN carrera c ON  pp.codigo_carrera = c.codigo
        WHERE pp.codigo_carrera = ? AND pp.num_semestre = ? 
        AND c.activo = 1
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
            s.id, 
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS codigo,
            pp.codigo_periodo AS lapso_academico, 
            IFNULL(GROUP_CONCAT(CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ')') SEPARATOR ', '), 'No encontrado') AS horario,
            hs.aula,
            s.capacidad_maxima
        FROM seccion s
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
        WHERE pp.codigo_materia = ? AND s.activo = 1
        ORDER BY codigo;
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
    // Validar sesión
    if (!req.session || !req.session.cedula) {
        return res.status(401).json({ 
            success: false, 
            error: 'No autorizado' 
        });
    }

    const { docente_cedula, seccion_id } = req.body;
    
    // Validar datos requeridos
    if (!docente_cedula || !seccion_id) {
        return res.status(400).json({ 
            success: false,
            error: 'Faltan datos requeridos' 
        });
    }

    const values = [docente_cedula, seccion_id];

    // Verificar si el permiso ya existe
    const checkQuery = `
        SELECT id, activo 
        FROM permiso_docente 
        WHERE docente_cedula = ? AND id_seccion = ?
    `;

    conexion.query(checkQuery, values, (error, results) => {
        if (error) {
            console.error('Error al verificar permiso:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Error al verificar permiso' 
            });
        }

        if (results.length > 0) {
            // CASO 1: El permiso YA EXISTE
            const permiso = results[0];

            if (permiso.activo === 1) {
                // Ya está activo
                return res.status(409).json({ 
                    success: false,
                    mensaje: 'El permiso ya existe y está activo',
                    permiso_id: permiso.id
                });
            }

            // Reactivar permiso existente
            const updateQuery = `
                UPDATE permiso_docente 
                SET activo = 1, 
                    cedula_creador = ?
                WHERE docente_cedula = ? AND id_seccion = ?
            `;
            conexion.query(updateQuery, [req.session.cedula, docente_cedula, seccion_id], (error, result) => {
                if (error) {
                    console.error('Error al reactivar permiso:', error);
                    return res.status(500).json({ 
                        success: false,
                        error: 'Error al reactivar permiso' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Permiso reactivado exitosamente',
                    reactivado: true,
                    permiso_id: permiso.id
                });
            });

        } else {
            // CASO 2: El permiso NO EXISTE - Crear nuevo
            const insertQuery = `
                INSERT INTO permiso_docente
                (docente_cedula, id_seccion, cedula_creador, activo)
                VALUES (?, ?, ?, 1)
            `;

            conexion.query(insertQuery, [docente_cedula, seccion_id, req.session.cedula], (error, result) => {
                if (error) {
                    console.error('Error al crear permiso:', error);
                    return res.status(500).json({ 
                        success: false,
                        error: 'Error al crear permiso' 
                    });
                }

                res.status(201).json({ 
                    success: true, 
                    id: result.insertId,
                    message: 'Permiso creado exitosamente',
                    nuevo: true
                });
            });
        }
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
    const query = 'UPDATE permiso_docente SET activo = 0 WHERE id = ?';
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
            pd.id,
            pd.docente_cedula,
            pp.codigo_carrera AS carrera_codigo,
            pp.id AS materia_id,
            s.id AS seccion_id,
            pd.activo,
            pp.codigo_periodo AS lapso_academico_id,
            pd.puede_crear_rubrica,
            pd.puede_evaluar,
            pd.puede_modificar_notas,
            pd.puede_ver_reportes,
            u.nombre as docente_nombre,
            u.apeliido as docente_apellido,
            c.nombre as carrera_nombre,
            m.nombre as materia_nombre,
            u.nombre AS docente_nombre,
            u.apeliido AS docente_apellido,
            c.nombre AS carrera_nombre,
            m.nombre AS materia_nombre,
            CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
            pp.codigo_periodo AS lapso_academico
        FROM permiso_docente pd
        INNER JOIN seccion s ON pd.id_seccion = s.id
        INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
        INNER JOIN carrera c ON pp.codigo_carrera =  c.codigo
        INNER JOIN materia m ON pp.codigo_materia = m.codigo
        INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
        INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
        WHERE pd.id = ?
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
    const { seccion_id } = req.body;
    
    if (!seccion_id) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const query = `
        UPDATE permiso_docente
        SET
            id_seccion = ?
        WHERE id = ?
    `;
    
    conexion.query(query, [seccion_id, id], (error, result) => {
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