const express = require('express');
const router = express.Router();
const connection = require('../models/conetion');

router.get('/teacher/rubricas', function(req, res){
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    const cedula = req.session.cedula;

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
            IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = TRUE AND r.docente_cedula = ?
        ORDER BY r.fecha_creacion DESC
    `;

    connection.query(query, [cedula], (error, rubricas) => {
        if(error) {
            console.error('Error al obtener rúbricas:', error);
            return res.render("teacher/rubricas", {
                datos: req.session,
                title: 'SGR - Rúbricas',
                rubricas: [],
                currentPage: 'rubricas'
            });
        }

        res.render("teacher/rubricas", {
            datos: req.session,
            title: 'SGR - Rúbricas',
            rubricas: rubricas,
            currentPage: 'rubricas'
        });
    });
});

// Ruta API para obtener detalle de rúbrica
router.get("/teacher/rubricas/detalle/:id", function(req, res) {
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
            IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
        FROM rubrica_evaluacion r
        INNER JOIN materia m ON r.materia_codigo = m.codigo
        INNER JOIN seccion s ON r.seccion_id = s.id
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
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

// Ruta API para obtener datos de rúbrica para editar
router.get("/teacher/rubricas/editar/:id", function(req, res) {
    console.log('📝 GET /teacher/rubricas/editar/' + req.params.id);
    
    if(!req.session.login){
        console.log('❌ Sin sesión activa');
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const rubricaId = req.params.id;
    const cedula = req.session.cedula;

    console.log('👤 Cédula:', cedula);

    let queryRubrica;
    let queryParams;

    if(req.session.id_rol === 1) {
        // Administrador puede ver cualquier rúbrica
        queryRubrica = `
            SELECT
                r.*,
                m.nombre as materia_nombre,
                s.codigo as seccion_codigo
            FROM rubrica_evaluacion r
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            WHERE r.id = ?
        `;
        queryParams = [rubricaId];
    } else {
        // Docente solo puede ver sus propias rúbricas
        queryRubrica = `
            SELECT
                r.*,
                m.nombre as materia_nombre,
                s.codigo as seccion_codigo
            FROM rubrica_evaluacion r
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            WHERE r.id = ? AND r.docente_cedula = ?
        `;
        queryParams = [rubricaId, cedula];
    }

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

    connection.query(queryRubrica, queryParams, (error, rubrica) => {
        if(error) {
            console.error('❌ Error en query:', error);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }
        
        if(rubrica.length === 0) {
            console.log('⚠️ Rúbrica no encontrada o sin permisos');
            return res.status(404).json({ success: false, message: 'Rúbrica no encontrada o sin permisos' });
        }

        console.log('✅ Rúbrica encontrada:', rubrica[0].nombre_rubrica);

        connection.query(queryCriterios, [rubricaId], (error, criterios) => {
            if(error) {
                console.error('❌ Error al obtener criterios:', error);
                return res.status(500).json({ success: false, message: 'Error al obtener criterios' });
            }

            connection.query(queryNiveles, [rubricaId], (error, niveles) => {
                if(error) {
                    console.error('❌ Error al obtener niveles:', error);
                    return res.status(500).json({ success: false, message: 'Error al obtener niveles' });
                }

                const criteriosConNiveles = criterios.map(criterio => ({
                    ...criterio,
                    niveles: niveles.filter(nivel => nivel.criterio_id === criterio.id)
                }));

                console.log('✅ Enviando respuesta con', criteriosConNiveles.length, 'criterios');

                res.json({
                    success: true,
                    rubrica: rubrica[0],
                    criterios: criteriosConNiveles
                });
            });
        });
    });
});

// Ruta API para obtener opciones de materia y sección
router.get("/teacher/opciones", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const queryMaterias = 'SELECT codigo, nombre FROM materia WHERE activo = TRUE ORDER BY nombre';
    const querySecciones = `
        SELECT s.id, s.codigo, s.materia_codigo, s.lapso_academico
        FROM seccion s
        WHERE s.activo = TRUE
        ORDER BY s.lapso_academico DESC, s.codigo
    `;

    connection.query(queryMaterias, (error, materias) => {
        if(error) {
            return res.status(500).json({ success: false, message: 'Error al obtener materias' });
        }

        connection.query(querySecciones, (error, secciones) => {
            if(error) {
                return res.status(500).json({ success: false, message: 'Error al obtener secciones' });
            }

            res.json({
                success: true,
                materias: materias,
                secciones: secciones
            });
        });
    });
});

// Ruta para obtener profesores únicos
router.get("/teacher/rubricas/profesores", function(req, res) {
    if(!req.session.login){
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const query = `
        SELECT DISTINCT IFNULL(CONCAT(d.nombre, ' ', d.apellido), 'Docente no encontrado') as docente_nombre
        FROM rubrica_evaluacion r
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        WHERE r.activo = TRUE
        ORDER BY docente_nombre
    `;

    connection.query(query, (error, profesores) => {
        if(error) {
            console.error('Error al obtener profesores:', error);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        res.json({
            success: true,
            profesores: profesores
        });
    });
});


module.exports = router;