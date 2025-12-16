const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

// =============================================
// GUARDAR NUEVA EVALUACIÓN DOCENTE
// =============================================
router.post('/admin/evaluacion-docente/guardar', (req, res) => {
    if (!req.session.login || req.session.id_rol !== 1) {
        return res.status(401).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción'
        });
    }

    const {
        docente_cedula,
        unidad_curricular,
        semestre,
        seccion_id,
        carrera_codigo,
        criterio1_calificacion,
        criterio1_observaciones,
        criterio2_calificacion,
        criterio2_observaciones,
        criterio3_calificacion,
        criterio3_observaciones,
        criterio4_calificacion,
        criterio4_observaciones,
        criterio5_calificacion,
        criterio5_observaciones,
        criterio6_calificacion,
        criterio6_observaciones,
        criterio7_calificacion,
        criterio7_observaciones,
        sugerencias
    } = req.body;

    // Validaciones
    if (!docente_cedula || !unidad_curricular || !semestre || !seccion_id || !carrera_codigo) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos básicos son requeridos'
        });
    }

    // Validar que todos los criterios tengan calificación
    const criterios = [
        criterio1_calificacion,
        criterio2_calificacion,
        criterio3_calificacion,
        criterio4_calificacion,
        criterio5_calificacion,
        criterio6_calificacion,
        criterio7_calificacion
    ];

    const calificacionesValidas = ['S', 'CS', 'AV', 'N'];
    for (let i = 0; i < criterios.length; i++) {
        if (!criterios[i] || !calificacionesValidas.includes(criterios[i])) {
            return res.status(400).json({
                success: false,
                message: `El criterio ${i + 1} debe tener una calificación válida (S, CS, AV, N)`
            });
        }
    }

    const admin_cedula = req.session.cedula;

    // Verificar si ya existe una evaluación con la misma combinación
    const checkQuery = `
        SELECT id FROM evaluaciones_docente 
        WHERE docente_cedula = ? 
        AND carrera_codigo = ? 
        AND semestre = ? 
        AND unidad_curricular = ? 
        AND seccion_id = ? 
        AND activo = 1
    `;

    conexion.query(checkQuery, [docente_cedula, carrera_codigo, semestre, unidad_curricular, seccion_id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Error al verificar evaluación existente:', checkError);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar la evaluación'
            });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una evaluación para este docente con la misma carrera, semestre, materia y sección'
            });
        }

        const query = `
            INSERT INTO evaluaciones_docente (
                docente_cedula, admin_cedula, unidad_curricular, semestre, seccion_id, carrera_codigo,
                criterio1_calificacion, criterio1_observaciones,
                criterio2_calificacion, criterio2_observaciones,
                criterio3_calificacion, criterio3_observaciones,
                criterio4_calificacion, criterio4_observaciones,
                criterio5_calificacion, criterio5_observaciones,
                criterio6_calificacion, criterio6_observaciones,
                criterio7_calificacion, criterio7_observaciones,
                sugerencias
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            docente_cedula, admin_cedula, unidad_curricular, semestre, seccion_id, carrera_codigo,
            criterio1_calificacion, criterio1_observaciones || null,
            criterio2_calificacion, criterio2_observaciones || null,
            criterio3_calificacion, criterio3_observaciones || null,
            criterio4_calificacion, criterio4_observaciones || null,
            criterio5_calificacion, criterio5_observaciones || null,
            criterio6_calificacion, criterio6_observaciones || null,
            criterio7_calificacion, criterio7_observaciones || null,
            sugerencias || null
        ];

        conexion.query(query, values, (error, results) => {
            if (error) {
                console.error('Error al guardar evaluación docente:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al guardar la evaluación'
                });
            }

            res.json({
                success: true,
                message: 'Evaluación guardada exitosamente',
                evaluacion_id: results.insertId
            });
        });
    });
});

// =============================================
// OBTENER EVALUACIÓN POR ID
// =============================================
router.get('/admin/evaluacion-docente/:id', (req, res) => {
    if (!req.session.login) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado'
        });
    }

    const evaluacionId = req.params.id;

    const query = `
        SELECT 
            e.*,
            CONCAT(d.nombre, ' ', d.apellido) as docente_nombre,
            e.admin_cedula,
            c.nombre as carrera_nombre,
            s.codigo as seccion_codigo
        FROM evaluaciones_docente e
        INNER JOIN docente d ON e.docente_cedula = d.cedula
        INNER JOIN carrera c ON e.carrera_codigo = c.codigo
        INNER JOIN seccion s ON e.seccion_id = s.id
        WHERE e.id = ? AND e.activo = 1
    `;

    conexion.query(query, [evaluacionId], (error, results) => {
        if (error) {
            console.error('Error al obtener evaluación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la evaluación'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación no encontrada'
            });
        }

        res.json({
            success: true,
            evaluacion: results[0]
        });
    });
});

// =============================================
// ACTUALIZAR EVALUACIÓN DOCENTE
// =============================================
router.put('/admin/evaluacion-docente/actualizar/:id', (req, res) => {
    if (!req.session.login || req.session.id_rol !== 1) {
        return res.status(401).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción'
        });
    }

    const evaluacionId = req.params.id;
    const {
        unidad_curricular,
        semestre,
        seccion_id,
        carrera_codigo,
        criterio1_calificacion,
        criterio1_observaciones,
        criterio2_calificacion,
        criterio2_observaciones,
        criterio3_calificacion,
        criterio3_observaciones,
        criterio4_calificacion,
        criterio4_observaciones,
        criterio5_calificacion,
        criterio5_observaciones,
        criterio6_calificacion,
        criterio6_observaciones,
        criterio7_calificacion,
        criterio7_observaciones,
        sugerencias
    } = req.body;

    // Validaciones
    if (!unidad_curricular || !semestre || !seccion_id || !carrera_codigo) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos básicos son requeridos'
        });
    }

    // Validar calificaciones
    const criterios = [
        criterio1_calificacion,
        criterio2_calificacion,
        criterio3_calificacion,
        criterio4_calificacion,
        criterio5_calificacion,
        criterio6_calificacion,
        criterio7_calificacion
    ];

    const calificacionesValidas = ['S', 'CS', 'AV', 'N'];
    for (let i = 0; i < criterios.length; i++) {
        if (!criterios[i] || !calificacionesValidas.includes(criterios[i])) {
            return res.status(400).json({
                success: false,
                message: `El criterio ${i + 1} debe tener una calificación válida (S, CS, AV, N)`
            });
        }
    }

    const query = `
        UPDATE evaluaciones_docente SET
            unidad_curricular = ?,
            semestre = ?,
            seccion_id = ?,
            carrera_codigo = ?,
            criterio1_calificacion = ?,
            criterio1_observaciones = ?,
            criterio2_calificacion = ?,
            criterio2_observaciones = ?,
            criterio3_calificacion = ?,
            criterio3_observaciones = ?,
            criterio4_calificacion = ?,
            criterio4_observaciones = ?,
            criterio5_calificacion = ?,
            criterio5_observaciones = ?,
            criterio6_calificacion = ?,
            criterio6_observaciones = ?,
            criterio7_calificacion = ?,
            criterio7_observaciones = ?,
            sugerencias = ?
        WHERE id = ? AND activo = 1
    `;

    const values = [
        unidad_curricular, semestre, seccion_id, carrera_codigo,
        criterio1_calificacion, criterio1_observaciones || null,
        criterio2_calificacion, criterio2_observaciones || null,
        criterio3_calificacion, criterio3_observaciones || null,
        criterio4_calificacion, criterio4_observaciones || null,
        criterio5_calificacion, criterio5_observaciones || null,
        criterio6_calificacion, criterio6_observaciones || null,
        criterio7_calificacion, criterio7_observaciones || null,
        sugerencias || null,
        evaluacionId
    ];

    conexion.query(query, values, (error, results) => {
        if (error) {
            console.error('Error al actualizar evaluación docente:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar la evaluación'
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Evaluación actualizada exitosamente'
        });
    });
});

// =============================================
// ELIMINAR (SOFT DELETE) EVALUACIÓN DOCENTE
// =============================================
router.delete('/admin/evaluacion-docente/eliminar/:id', (req, res) => {
    if (!req.session.login || req.session.id_rol !== 1) {
        return res.status(401).json({
            success: false,
            message: 'No tienes permisos para realizar esta acción'
        });
    }

    const evaluacionId = req.params.id;

    const query = 'UPDATE evaluaciones_docente SET activo = 0 WHERE id = ?';

    conexion.query(query, [evaluacionId], (error, results) => {
        if (error) {
            console.error('Error al eliminar evaluación docente:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la evaluación'
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Evaluación eliminada exitosamente'
        });
    });
});

module.exports = router;
