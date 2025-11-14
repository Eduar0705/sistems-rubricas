const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');

router.get("/home", function(req, res) {
    if(!req.session.login){
        const mensaje = 'Por favor, inicia sesión para acceder a esta página.';
        return res.redirect('/login?mensaje=' + encodeURIComponent(mensaje));
    }

    // Contar los profesores
    let countProf = 'SELECT COUNT(*) AS totalProfesores FROM docente';
    conexion.query(countProf, (err, profesResult) => {
        if (err) {
            console.log('Error al contar profesores: ', err);
            profesResult = [{ totalProfesores: 0 }];
        }

        // Contar las Rúbricas
        let countRubricas = 'SELECT COUNT(*) AS totalRubricas FROM rubrica_evaluacion';
        conexion.query(countRubricas, (err, rubricasResult) => {
            if (err) {
                console.log('Error al contar rúbricas: ', err);
                rubricasResult = [{ totalRubricas: 0 }];
            }

            // **NUEVA CONSULTA: Contar evaluaciones pendientes**
            let countEvaluacionesPendientes = `
                SELECT COUNT(*) AS totalEvaluacionesPendientes 
                FROM evaluacion_estudiante 
                WHERE puntaje_total IS NULL
            `;
            
            conexion.query(countEvaluacionesPendientes, (err, evaluacionesResult) => {
                if (err) {
                    console.log('Error al contar evaluaciones pendientes: ', err);
                    evaluacionesResult = [{ totalEvaluacionesPendientes: 0 }];
                }

                // Obtener rúbricas recientes (máximo 5)
                let recentRubricasQuery = `
                    SELECT
                        r.id,
                        r.nombre_rubrica,
                        r.fecha_creacion,
                        r.tipo_evaluacion,
                        r.instrucciones as descripcion,
                        m.nombre as materia_nombre
                    FROM rubrica_evaluacion r
                    LEFT JOIN materia m ON r.materia_codigo = m.codigo
                    WHERE r.activo = TRUE
                    ORDER BY r.fecha_creacion DESC
                    LIMIT 4
                `;
                
                conexion.query(recentRubricasQuery, (err, recentRubricasResult) => {
                    if (err) {
                        console.log('Error al obtener rúbricas recientes: ', err);
                        recentRubricasResult = [];
                    }

                    const rubricasRecientes = recentRubricasResult.map(rubrica => {
                        const fechaReferencia = rubrica.fecha_actualizacion || rubrica.fecha_creacion;
                        return {
                            id: rubrica.id,
                            nombre: rubrica.nombre_rubrica,
                            tipo: rubrica.tipo_evaluacion,
                            descripcion: rubrica.descripcion,
                            materia: rubrica.materia_nombre,
                            tiempo_transcurrido: calcularTiempoTranscurrido(fechaReferencia)
                        };
                    });

                    const totalProfesores = profesResult[0].totalProfesores;
                    const totalRubricas = rubricasResult[0].totalRubricas;
                    const totalEvaluacionesPendientes = evaluacionesResult[0].totalEvaluacionesPendientes;
                    
                    // Renderizar con todos los datos obtenidos
                    res.render("home/index", {
                        datos: req.session,
                        title: 'Sistema de Gestión de Rúbricas',
                        totalProfesores: totalProfesores,
                        totalRubricas: totalRubricas,
                        totalEvaluacionesPendientes: totalEvaluacionesPendientes, // **NUEVA VARIABLE**
                        rubricasRecientes: rubricasRecientes,
                        currentPage: 'home'
                    });
                });
            });
        });
    });
});

// Función para calcular el tiempo transcurrido
function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const fechaRubrica = new Date(fecha);
    const diferencia = ahora - fechaRubrica;
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30);
    
    if (meses > 0) {
        return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
    } else if (semanas > 0) {
        return semanas === 1 ? 'hace 1 semana' : `hace ${semanas} semanas`;
    } else if (dias > 0) {
        return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
    } else if (horas > 0) {
        return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
    } else if (minutos > 0) {
        return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`;
    } else {
        return 'hace unos segundos';
    }
}

module.exports = router;