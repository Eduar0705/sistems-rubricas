const express = require('express');
const router = express.Router();
const conexion = require('../models/conetion');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// Función auxiliar para descargar imagen desde URL
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

//Funcion para obtener el logo y cargarlo a los documentos
async function getLogoBuffer() {
    // Ruta al logo JPG local (compatible con PDF y Excel)
    const localPathJpg = path.join(__dirname, '..', 'public', 'img', 'IUJO.gif');
    // URL de respaldo (opcional, por si falla el local)
    const logoUrl = 'https://aulabqto.iujoac.org.ve/pluginfile.php/1/core_admin/logo/0x200/1685566539/logo%20iujo%20para%20moodle.png';

    try {
        // Intentar leer archivo local JPG
        await fs.promises.access(localPathJpg);
        const buffer = await fs.promises.readFile(localPathJpg);
        console.log('Logo local JPG encontrado y cargado.');
        return buffer;
    } catch (localErr) {
        console.warn('Logo local no encontrado, intentando descargar...', localErr.message);
    }

    try {
        // Descargar logo PNG desde URL si falla el local
        const buffer = await downloadImage(logoUrl);
        console.log('Logo descargado exitosamente desde URL, tamaño:', buffer.length, 'bytes');
        return buffer;
    } catch (urlErr) {
        console.error('Error al descargar logo desde URL:', urlErr.message);
        return null;
    }
}

// ==================== EXPORTACIÓN EXCEL - FORMATO IUJO ====================
router.get('/api/teacher/evaluaciones/export/excel', async (req, res) => {
    if (!req.session.login) {
        return res.status(401).send('No autorizado');
    }

    const docenteCedula = req.session.cedula;
    const rol = req.session.id_rol;

    let query;
    let queryParams = [];

    //Consulta para si es admin le salgan todas las evaluaciones
    if (rol === 1) {
        query = `
            SELECT
                ee.id as evaluacion_id,
                ee.puntaje_total,
                e.cedula as estudiante_cedula,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                r.id as rubrica_id,
                r.nombre_rubrica,
                r.porcentaje_evaluacion,
                r.tipo_evaluacion,
                m.nombre as materia_nombre,
                m.semestre,
                c.nombre as carrera_nombre,
                c.codigo as carrera_codigo,
                s.codigo as seccion_codigo,
                s.horario as seccion_horario,
                s.aula as seccion_aula,
                d.nombre as docente_nombre,
                d.apellido as docente_apellido,
                CASE
                    WHEN ee.puntaje_total IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            INNER JOIN docente d ON r.docente_cedula = d.cedula
            WHERE e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1
            ORDER BY c.nombre, m.semestre, s.codigo, r.nombre_rubrica, e.apellido, e.nombre
        `;
    }//Si es 2 o Profesor le muestra solo las que tiene permisos
    else if (rol === 2) {
        query = `
            SELECT
                ee.id as evaluacion_id,
                ee.puntaje_total,
                e.cedula as estudiante_cedula,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                r.id as rubrica_id,
                r.nombre_rubrica,
                r.porcentaje_evaluacion,
                r.tipo_evaluacion,
                m.nombre as materia_nombre,
                m.semestre,
                c.nombre as carrera_nombre,
                c.codigo as carrera_codigo,
                s.codigo as seccion_codigo,
                s.horario as seccion_horario,
                s.aula as seccion_aula,
                d.nombre as docente_nombre,
                d.apellido as docente_apellido,
                CASE
                    WHEN ee.puntaje_total IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            INNER JOIN docente d ON r.docente_cedula = d.cedula
            INNER JOIN permisos p ON p.seccion_id = s.id
            WHERE e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1
            AND p.docente_cedula = ?
            AND p.activo = 1
            ORDER BY c.nombre, m.semestre, s.codigo, r.nombre_rubrica, e.apellido, e.nombre
        `;
        queryParams = [docenteCedula];
    } else {
        return res.status(401).send('No autorizado');
    }

    conexion.query(query, queryParams, async (error, evaluaciones) => {
        if (error) {
            console.error('Error al exportar Excel:', error);
            return res.status(500).send('Error al generar Excel');
        }

        try {
            // Obtener IDs de rúbricas para buscar criterios
            const rubricaIds = [...new Set(evaluaciones.map(e => e.rubrica_id))];

            let criteriosMap = {};
            let detallesMap = {};

            if (rubricaIds.length > 0) {
                // Obtener criterios
                const queryCriterios = `
                    SELECT id, rubrica_id, descripcion, puntaje_maximo, orden
                    FROM criterio_evaluacion
                    WHERE rubrica_id IN (?)
                    ORDER BY rubrica_id, orden
                `;

                const criterios = await new Promise((resolve, reject) => {
                    conexion.query(queryCriterios, [rubricaIds], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                criterios.forEach(c => {
                    if (!criteriosMap[c.rubrica_id]) criteriosMap[c.rubrica_id] = [];
                    criteriosMap[c.rubrica_id].push(c);
                });

                // Obtener detalles de evaluación (puntajes por criterio)
                const queryDetalles = `
                    SELECT de.evaluacion_id, de.criterio_id, de.puntaje_obtenido, nd.nombre_nivel
                    FROM detalle_evaluacion de
                    INNER JOIN evaluacion_estudiante ee ON de.evaluacion_id = ee.id
                    LEFT JOIN nivel_desempeno nd ON de.nivel_seleccionado = nd.id
                    WHERE ee.rubrica_id IN (?)
                `;

                const detalles = await new Promise((resolve, reject) => {
                    conexion.query(queryDetalles, [rubricaIds], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                detalles.forEach(d => {
                    if (!detallesMap[d.evaluacion_id]) detallesMap[d.evaluacion_id] = {};
                    detallesMap[d.evaluacion_id][d.criterio_id] = {
                        puntaje: d.puntaje_obtenido,
                        nivel: d.nombre_nivel
                    };
                });
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'IUJO - Sistema de Rúbricas';
            workbook.created = new Date();

            // Obtener logo
            let logoBuffer = null;
            try {
                logoBuffer = await getLogoBuffer();
            } catch (logoError) {
                console.error('Error al obtener logo:', logoError.message);
            }

            // Agrupar por carrera → semestre → sección → evaluación
            const agrupado = {};
            evaluaciones.forEach(ev => {
                const keyCarrera = ev.carrera_codigo;
                const keySemestre = `${keyCarrera}-S${ev.semestre}`;
                const keySeccion = `${keySemestre}-${ev.seccion_codigo}`;
                const keyEvaluacion = `${keySeccion}-E${ev.rubrica_id}`;

                if (!agrupado[keyCarrera]) {
                    agrupado[keyCarrera] = {
                        nombre: ev.carrera_nombre,
                        semestres: {}
                    };
                }
                if (!agrupado[keyCarrera].semestres[keySemestre]) {
                    agrupado[keyCarrera].semestres[keySemestre] = {
                        numero: ev.semestre,
                        secciones: {}
                    };
                }
                if (!agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion]) {
                    agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion] = {
                        codigo: ev.seccion_codigo,
                        materia: ev.materia_nombre,
                        horario: ev.seccion_horario,
                        aula: ev.seccion_aula,
                        evaluaciones: {}
                    };
                }
                if (!agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion].evaluaciones[keyEvaluacion]) {
                    agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion].evaluaciones[keyEvaluacion] = {
                        id: ev.rubrica_id,
                        nombre: ev.nombre_rubrica,
                        tipo: ev.tipo_evaluacion,
                        porcentaje: ev.porcentaje_evaluacion,
                        docente: `${ev.docente_nombre} ${ev.docente_apellido}`,
                        estudiantes: []
                    };
                }

                agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion].evaluaciones[keyEvaluacion].estudiantes.push({
                    id: ev.evaluacion_id,
                    cedula: ev.estudiante_cedula,
                    nombre: ev.estudiante_nombre,
                    apellido: ev.estudiante_apellido,
                    puntaje: ev.puntaje_total,
                    estado: ev.estado
                });
            });

            // Crear hojas por evaluación
            Object.values(agrupado).forEach(carrera => {
                Object.values(carrera.semestres).forEach(semestre => {
                    Object.values(semestre.secciones).forEach(seccion => {
                        Object.values(seccion.evaluaciones).forEach((evaluacion, evalIndex) => {

                            const sheetName = `${carrera.nombre.substring(0, 10)}-S${semestre.numero}-${seccion.codigo}-${evalIndex + 1}`;
                            const worksheet = workbook.addWorksheet(sheetName);

                            // LOGO Y ENCABEZADO INSTITUCIONAL
                            if (logoBuffer) {
                                try {
                                    const imageId = workbook.addImage({
                                        buffer: logoBuffer,
                                        extension: 'jpeg'
                                    });

                                    worksheet.addImage(imageId, {
                                        tl: { col: 0, row: 0 },
                                        ext: { width: 200 },
                                        editAs: 'oneCell'
                                    });
                                } catch (imgError) {
                                    console.error('Error al agregar imagen al Excel:', imgError);
                                }
                            }

                            for (let i = 1; i <= 5; i++) {
                                worksheet.getRow(i).height = 20;
                            }

                            worksheet.mergeCells('B1:H2');
                            const titleCell = worksheet.getCell('B1');
                            titleCell.value = 'Instituto Universitario Jesús Obrero (IUJO)';
                            titleCell.font = { size: 14, bold: true };
                            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

                            worksheet.mergeCells('B3:H3');
                            const subtitleCell = worksheet.getCell('B3');
                            subtitleCell.value = 'Extensión Barquisimeto';
                            subtitleCell.font = { size: 11, italic: true };
                            subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

                            worksheet.mergeCells('B4:H4');
                            const materiaCell = worksheet.getCell('B4');
                            materiaCell.value = `Materia: ${seccion.materia}`;
                            materiaCell.font = { size: 10, bold: true };
                            materiaCell.alignment = { horizontal: 'center', vertical: 'middle' };

                            worksheet.mergeCells('B5:H5');
                            const docenteCell = worksheet.getCell('B5');
                            docenteCell.value = `Docente: ${evaluacion.docente}`;
                            docenteCell.font = { size: 10 };
                            docenteCell.alignment = { horizontal: 'center', vertical: 'middle' };

                            worksheet.mergeCells('A6:H6');
                            const evaluacionTitleCell = worksheet.getCell('A6');
                            evaluacionTitleCell.value = evaluacion.nombre;
                            evaluacionTitleCell.font = { size: 12, bold: true };
                            evaluacionTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
                            evaluacionTitleCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFE0E0E0' }
                            };

                            worksheet.getCell('A7').value = `Valor: ${evaluacion.porcentaje}pts`;
                            worksheet.getCell('A7').font = { bold: true };
                            worksheet.getCell('B7').value = `Tipo: ${evaluacion.tipo}`;
                            worksheet.getCell('C7').value = `Sección: ${seccion.codigo}`;
                            worksheet.getCell('D7').value = `Horario: ${seccion.horario}`;
                            worksheet.getCell('E7').value = `Aula: ${seccion.aula}`;
                            worksheet.addRow([]);

                            // Construir encabezados dinámicos (SE ELIMINA la columna "Total sobre 100%")
                            const criteriosRubrica = criteriosMap[evaluacion.id] || [];
                            const headerValues = ['Nro', 'Cédula', 'Apellidos y Nombres'];

                            criteriosRubrica.forEach(c => {
                                headerValues.push(`${c.descripcion} (${c.puntaje_maximo}%)`);
                            });
                            headerValues.push('Total sobre 10%'); // solo el total sobre 10%

                            const headerRow = worksheet.getRow(9);
                            headerRow.values = headerValues;
                            headerRow.font = { bold: true, color: { argb: 'FF000000' } };
                            headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                            headerRow.height = 40;

                            headerRow.eachCell((cell) => {
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: 'FFD3D3D3' }
                                };
                                cell.border = {
                                    top: { style: 'thin' },
                                    left: { style: 'thin' },
                                    bottom: { style: 'thin' },
                                    right: { style: 'thin' }
                                };
                            });

                            worksheet.getColumn(1).width = 8;
                            worksheet.getColumn(2).width = 15;
                            worksheet.getColumn(3).width = 35;

                            // Ajustar ancho de columnas de criterios
                            for (let i = 0; i < criteriosRubrica.length; i++) {
                                worksheet.getColumn(4 + i).width = 20; // Más ancho para descripción
                            }

                            // Solo una columna adicional (Total sobre 10%)
                            worksheet.getColumn(4 + criteriosRubrica.length).width = 15;

                            evaluacion.estudiantes.forEach((estudiante, index) => {
                                const rowValues = [
                                    index + 1,
                                    estudiante.cedula,
                                    `${estudiante.apellido} ${estudiante.nombre}`.toUpperCase()
                                ];

                                // Puntajes por criterio
                                criteriosRubrica.forEach(c => {
                                    const detalle = detallesMap[estudiante.id]?.[c.id];
                                    if (detalle) {
                                        // Mostrar puntaje y nombre del nivel
                                        rowValues.push(`${parseFloat(detalle.puntaje).toFixed(2)}\n${detalle.nivel || ''}`);
                                    } else {
                                        rowValues.push('-');
                                    }
                                });

                                const puntajeObtenido = estudiante.puntaje !== null ? parseFloat(estudiante.puntaje).toFixed(2) : '0.00';
                                // calcular porcentaje para coloreado y estadística, pero NO se muestra como columna
                                const total100 = estudiante.puntaje !== null ? parseFloat(((estudiante.puntaje * 100) / evaluacion.porcentaje).toFixed(2)) : 0;

                                rowValues.push(puntajeObtenido); // solo el total sobre 10%

                                const row = worksheet.addRow(rowValues);

                                row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                                row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

                                const porcentaje = total100; // usar porcentaje para colores
                                let fillColor = 'FFFFFFFF';

                                if (porcentaje >= 80) {
                                    fillColor = 'FFD4EDDA';
                                } else if (porcentaje >= 60) {
                                    fillColor = 'FFFFFFFF';
                                } else if (porcentaje >= 40) {
                                    fillColor = 'FFFFF3CD';
                                } else if (porcentaje > 0) {
                                    fillColor = 'FFF8D7DA';
                                }

                                row.eachCell((cell) => {
                                    cell.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: fillColor }
                                    };
                                    cell.border = {
                                        top: { style: 'thin' },
                                        left: { style: 'thin' },
                                        bottom: { style: 'thin' },
                                        right: { style: 'thin' }
                                    };
                                });

                                // Resaltar la última columna (ahora Total sobre 10%)
                                row.getCell(rowValues.length).font = { bold: true };
                            });

                            const totalEstudiantes = evaluacion.estudiantes.length;
                            const completadas = evaluacion.estudiantes.filter(e => e.puntaje !== null).length;
                            const pendientes = totalEstudiantes - completadas;
                            worksheet.addRow([]);

                            const statsRow = worksheet.addRow([
                                'ESTADÍSTICAS:',
                                `Total: ${totalEstudiantes}`,
                                `Completadas: ${completadas}`,
                                `Pendientes: ${pendientes}`,
                                '',
                                ''
                            ]);

                            statsRow.font = { bold: true };
                            statsRow.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFFEB3B' }
                            };
                            statsRow.eachCell((cell) => {
                                cell.border = {
                                    top: { style: 'thin' },
                                    left: { style: 'thin' },
                                    bottom: { style: 'thin' },
                                    right: { style: 'thin' }
                                };
                            });

                            worksheet.addRow([]);
                            const footerRow = worksheet.addRow(['', '', `Generado: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`]);
                            worksheet.mergeCells(footerRow.number, 1, footerRow.number, headerValues.length);
                            footerRow.getCell(1).alignment = { horizontal: 'center' };
                            footerRow.getCell(1).font = { size: 9, italic: true };
                        });
                    });
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=evaluaciones_IUJO_${new Date().toISOString().split('T')[0]}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Error general al generar Excel:', error);
            return res.status(500).send('Error al generar Excel');
        }
    });
});

// ==================== EXPORTACIÓN PDF - FORMATO IUJO ====================
router.get('/api/teacher/evaluaciones/export/pdf', async (req, res) => {
    if (!req.session.login) {
        return res.status(401).send('No autorizado');
    }

    const docenteCedula = req.session.cedula;
    const rol = req.session.id_rol;

    let query;
    let queryParams = [];

    if (rol === 1) {
        query = `
            SELECT
                ee.id as evaluacion_id,
                ee.puntaje_total,
                e.cedula as estudiante_cedula,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                r.id as rubrica_id,
                r.nombre_rubrica,
                r.porcentaje_evaluacion,
                r.tipo_evaluacion,
                m.nombre as materia_nombre,
                m.semestre,
                c.nombre as carrera_nombre,
                c.codigo as carrera_codigo,
                s.codigo as seccion_codigo,
                s.horario as seccion_horario,
                s.aula as seccion_aula,
                d.nombre as docente_nombre,
                d.apellido as docente_apellido,
                CASE
                    WHEN ee.puntaje_total IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            INNER JOIN docente d ON r.docente_cedula = d.cedula
            WHERE e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1
            ORDER BY c.nombre, m.semestre, s.codigo, r.nombre_rubrica, e.apellido, e.nombre
        `;
    } else if (rol === 2) {
        query = `
            SELECT
                ee.id as evaluacion_id,
                ee.puntaje_total,
                e.cedula as estudiante_cedula,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                r.id as rubrica_id,
                r.nombre_rubrica,
                r.porcentaje_evaluacion,
                r.tipo_evaluacion,
                m.nombre as materia_nombre,
                m.semestre,
                c.nombre as carrera_nombre,
                c.codigo as carrera_codigo,
                s.codigo as seccion_codigo,
                s.horario as seccion_horario,
                s.aula as seccion_aula,
                d.nombre as docente_nombre,
                d.apellido as docente_apellido,
                CASE
                    WHEN ee.puntaje_total IS NOT NULL THEN 'Completada'
                    ELSE 'Pendiente'
                END as estado
            FROM evaluacion_estudiante ee
            INNER JOIN estudiante e ON ee.estudiante_cedula = e.cedula
            INNER JOIN rubrica_evaluacion r ON ee.rubrica_id = r.id
            INNER JOIN materia m ON r.materia_codigo = m.codigo
            INNER JOIN seccion s ON r.seccion_id = s.id
            INNER JOIN carrera c ON m.carrera_codigo = c.codigo
            INNER JOIN docente d ON r.docente_cedula = d.cedula
            INNER JOIN permisos p ON p.seccion_id = s.id
            WHERE e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1
            AND p.docente_cedula = ?
            AND p.activo = 1
            ORDER BY c.nombre, m.semestre, s.codigo, r.nombre_rubrica, e.apellido, e.nombre
        `;
        queryParams = [docenteCedula];
    } else {
        return res.status(401).send('No autorizado');
    }

    conexion.query(query, queryParams, async (error, evaluaciones) => {
        if (error) {
            console.error('Error al exportar PDF:', error);
            return res.status(500).send('Error al generar PDF');
        }

        try {
            // Obtener IDs de rúbricas para buscar criterios
            const rubricaIds = [...new Set(evaluaciones.map(e => e.rubrica_id))];
            let criteriosMap = {};
            let detallesMap = {};

            if (rubricaIds.length > 0) {
                // Obtener criterios
                const queryCriterios = `
                    SELECT id, rubrica_id, descripcion, puntaje_maximo, orden
                    FROM criterio_evaluacion
                    WHERE rubrica_id IN (?)
                    ORDER BY rubrica_id, orden
                `;

                const criterios = await new Promise((resolve, reject) => {
                    conexion.query(queryCriterios, [rubricaIds], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                criterios.forEach(c => {
                    if (!criteriosMap[c.rubrica_id]) criteriosMap[c.rubrica_id] = [];
                    criteriosMap[c.rubrica_id].push(c);
                });

                // Obtener detalles de evaluación (puntajes por criterio)
                const queryDetalles = `
                    SELECT de.evaluacion_id, de.criterio_id, de.puntaje_obtenido, nd.nombre_nivel
                    FROM detalle_evaluacion de
                    INNER JOIN evaluacion_estudiante ee ON de.evaluacion_id = ee.id
                    LEFT JOIN nivel_desempeno nd ON de.nivel_seleccionado = nd.id
                    WHERE ee.rubrica_id IN (?)
                `;

                const detalles = await new Promise((resolve, reject) => {
                    conexion.query(queryDetalles, [rubricaIds], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                detalles.forEach(d => {
                    if (!detallesMap[d.evaluacion_id]) detallesMap[d.evaluacion_id] = {};
                    detallesMap[d.evaluacion_id][d.criterio_id] = {
                        puntaje: d.puntaje_obtenido,
                        nivel: d.nombre_nivel
                    };
                });
            }

            // Obtener logo
            let logoBuffer = null;
            try {
                logoBuffer = await getLogoBuffer();
            } catch (logoError) {
                console.error('Error al obtener logo para PDF:', logoError.message);
            }

            // Configurar PDF en Landscape
            const doc = new PDFDocument({
                margin: 30,
                size: 'LETTER',
                layout: 'landscape',
                bufferPages: true
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=evaluaciones_IUJO_${new Date().toISOString().split('T')[0]}.pdf`);
            doc.pipe(res);

            // Agrupar por carrera → semestre → sección → evaluación
            const agrupado = {};
            evaluaciones.forEach(ev => {
                const keyCarrera = ev.carrera_codigo;
                const keySemestre = `${keyCarrera}-S${ev.semestre}`;
                const keySeccion = `${keySemestre}-${ev.seccion_codigo}`;
                const keyEvaluacion = `${keySeccion}-E${ev.rubrica_id}`;

                if (!agrupado[keyCarrera]) {
                    agrupado[keyCarrera] = { nombre: ev.carrera_nombre, semestres: {} };
                }
                if (!agrupado[keyCarrera].semestres[keySemestre]) {
                    agrupado[keyCarrera].semestres[keySemestre] = { numero: ev.semestre, secciones: {} };
                }
                if (!agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion]) {
                    agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion] = {
                        codigo: ev.seccion_codigo,
                        materia: ev.materia_nombre,
                        horario: ev.seccion_horario,
                        aula: ev.seccion_aula,
                        evaluaciones: {}
                    };
                }
                if (!agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion].evaluaciones[keyEvaluacion]) {
                    agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion].evaluaciones[keyEvaluacion] = {
                        id: ev.rubrica_id,
                        nombre: ev.nombre_rubrica,
                        tipo: ev.tipo_evaluacion,
                        porcentaje: ev.porcentaje_evaluacion,
                        docente: `${ev.docente_nombre} ${ev.docente_apellido}`,
                        estudiantes: []
                    };
                }

                agrupado[keyCarrera].semestres[keySemestre].secciones[keySeccion].evaluaciones[keyEvaluacion].estudiantes.push({
                    id: ev.evaluacion_id,
                    cedula: ev.estudiante_cedula,
                    nombre: ev.estudiante_nombre,
                    apellido: ev.estudiante_apellido,
                    puntaje: ev.puntaje_total
                });
            });

            // Función para agregar encabezado IUJO
            function addHeaderIUJO(evaluacion, seccion, materia) {
                if (logoBuffer) {
                    try {
                        doc.image(logoBuffer, 30, 30, {
                            width: 200,
                            align: 'left',
                            valign: 'center'
                        });
                    } catch (err) {
                        doc.fillColor('#000000')
                            .fontSize(28)
                            .font('Helvetica-Bold')
                            .text('IUJO', 30, 55, { width: 80, align: 'center' });
                    }
                } else {
                    doc.fillColor('#000000')
                        .fontSize(28)
                        .font('Helvetica-Bold')
                        .text('IUJO', 30, 55, { width: 80, align: 'center' });
                }

                const textX = 200;
                const pageWidth = doc.page.width;

                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor('#000000')
                    .text('Instituto Universitario Jesús Obrero (IUJO)', textX, 35);

                doc.fontSize(11)
                    .font('Helvetica')
                    .text('Extensión Barquisimeto', textX, 55);

                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text(`Materia: ${materia}`, textX, 75);

                doc.fontSize(9)
                    .font('Helvetica')
                    .text(`Docente: ${evaluacion.docente}`, textX, 90);

                doc.moveDown(4);
                doc.fontSize(11)
                    .font('Helvetica-Bold')
                    .fillColor('#000000')
                    .text(evaluacion.nombre, 30, 120, { align: 'center', width: pageWidth - 60 });

                doc.fontSize(8)
                    .font('Helvetica')
                    .text(`Valor: ${evaluacion.porcentaje}pts | Tipo: ${evaluacion.tipo} | Sección: ${seccion.codigo} | ${seccion.horario} | Aula: ${seccion.aula}`, 30, 135, { align: 'center', width: pageWidth - 60 });
                doc.moveDown(1);
            }

            let isFirstPage = true;

            Object.values(agrupado).forEach(carrera => {
                Object.values(carrera.semestres).forEach(semestre => {
                    Object.values(semestre.secciones).forEach(seccion => {
                        Object.values(seccion.evaluaciones).forEach((evaluacion, evalIdx) => {

                            if (!isFirstPage) doc.addPage();
                            isFirstPage = false;

                            addHeaderIUJO(evaluacion, seccion, seccion.materia);

                            const tableTop = 165;
                            const pageWidth = doc.page.width;
                            const availableWidth = pageWidth - 60;

                            // Definir columnas dinámicas (se elimina la columna "Total 100%")
                            const criteriosRubrica = criteriosMap[evaluacion.id] || [];
                            const fixedColsWidth = 250; // Nro + Cédula + Apellidos
                            const remainingWidth = availableWidth - fixedColsWidth - 50; // -50 para el total (solo Total 10%)
                            const criteriaColWidth = Math.min(remainingWidth / (criteriosRubrica.length || 1), 80);
                            const colWidths = [30, 70, 150]; // Nro, Cédula, Apellidos
                            criteriosRubrica.forEach(() => colWidths.push(criteriaColWidth));
                            colWidths.push(50); // Total 10% (ahora sólo una columna de totales)
                            const rowHeight = 35; // Más alto para descripciones

                            // Dibujar encabezado tabla
                            doc.rect(30, tableTop, colWidths.reduce((a,b) => a+b), rowHeight)
                                .fillAndStroke('#D3D3D3', '#000000');
                            doc.fillColor('#000000')
                                .fontSize(7)
                                .font('Helvetica-Bold');

                            let x = 35;
                            doc.text('Nro', x, tableTop + 12, { width: colWidths[0] - 10, align: 'center' });
                            x += colWidths[0];
                            doc.text('Cédula', x, tableTop + 12, { width: colWidths[1] - 10 });
                            x += colWidths[1];
                            doc.text('Apellidos y Nombres', x, tableTop + 12, { width: colWidths[2] - 10 });
                            x += colWidths[2];

                            criteriosRubrica.forEach((c, i) => {
                                doc.text(`${c.descripcion} (${c.puntaje_maximo}%)`, x, tableTop + 2, { 
                                    width: colWidths[3+i] - 4, 
                                    align: 'center',
                                    height: rowHeight - 4
                                });
                                x += colWidths[3+i];
                            });

                            // Sólo Total 10%
                            doc.text('Total 10%', x, tableTop + 6, { width: colWidths[colWidths.length-1] - 4, align: 'center' });
                            x += colWidths[colWidths.length-1];

                            let currentY = tableTop + rowHeight;

                            evaluacion.estudiantes.forEach((est, idx) => {
                                if (currentY > doc.page.height - 50) {
                                    doc.addPage();
                                    addHeaderIUJO(evaluacion, seccion, seccion.materia);
                                    currentY = 165 + rowHeight;
                                }

                                const puntaje = est.puntaje !== null ? parseFloat(est.puntaje).toFixed(2) : '0.00';
                                const total100 = est.puntaje !== null ?
                                    parseFloat(((est.puntaje * 100) / evaluacion.porcentaje).toFixed(2)) : 0;

                                let fillColor = '#FFFFFF';
                                if (total100 >= 80) fillColor = '#D4EDDA';
                                else if (total100 >= 60) fillColor = '#FFFFFF';
                                else if (total100 >= 40) fillColor = '#FFF3CD';
                                else if (total100 > 0) fillColor = '#F8D7DA';

                                doc.rect(30, currentY, colWidths.reduce((a,b) => a+b), 20)
                                    .fillAndStroke(fillColor, '#000000');

                                doc.fillColor('#000000')
                                    .fontSize(8)
                                    .font('Helvetica');

                                x = 35;
                                doc.text(`${idx + 1}`, x, currentY + 6, { width: colWidths[0] - 10, align: 'center' });
                                x += colWidths[0];
                                doc.text(est.cedula, x, currentY + 6, { width: colWidths[1] - 10 });
                                x += colWidths[1];
                                doc.text(`${est.apellido} ${est.nombre}`.toUpperCase(), x, currentY + 6, { width: colWidths[2] - 10, ellipsis: true });
                                x += colWidths[2];

                                // Puntajes por criterio
                                criteriosRubrica.forEach((c, i) => {
                                    const detalle = detallesMap[est.id]?.[c.id];
                                    const text = detalle ? `${parseFloat(detalle.puntaje).toFixed(2)} (${detalle.nivel || ''})` : '-';
                                    doc.text(text, x, currentY + 6, { width: colWidths[3+i] - 4, align: 'center' });
                                    x += colWidths[3+i];
                                });

                                // Mostrar solo el total sobre 10%
                                doc.font('Helvetica-Bold')
                                    .text(puntaje, x, currentY + 6, { width: colWidths[colWidths.length-1] - 4, align: 'center' });

                                currentY += 20;
                            });

                            // Estadísticas
                            currentY += 10;
                            const totalEstudiantes = evaluacion.estudiantes.length;
                            const completadas = evaluacion.estudiantes.filter(e => e.puntaje !== null).length;
                            const estudiantesCalificados = evaluacion.estudiantes.filter(e => e.puntaje !== null);
                            const promedioGeneral = estudiantesCalificados.length > 0 ?
                                (estudiantesCalificados.reduce((acc, e) => acc + e.puntaje, 0) / estudiantesCalificados.length).toFixed(2) : '0.00';
                            const promedioPorc = estudiantesCalificados.length > 0 ?
                                parseFloat((estudiantesCalificados.reduce((acc, e) => acc + ((e.puntaje * 100) / evaluacion.porcentaje), 0) / estudiantesCalificados.length).toFixed(2)) : 0;

                            doc.rect(30, currentY, colWidths.reduce((a,b) => a+b), 20)
                                .fillAndStroke('#FFEB3B', '#000000');

                            doc.fillColor('#000000')
                                .fontSize(8)
                                .font('Helvetica-Bold')
                                .text(`ESTADÍSTICAS: Total: ${totalEstudiantes} | Completadas: ${completadas} | Pendientes: ${totalEstudiantes - completadas} | Promedio: ${promedioGeneral} (${promedioPorc}%)`, 
                                    35, currentY + 6, { width: colWidths.reduce((a,b) => a+b) - 10 });

                            doc.fontSize(7)
                                .font('Helvetica')
                                .fillColor('#666666')
                                .text(`Generado: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 
                                    30, doc.page.height - 40, { align: 'center', width: doc.page.width - 60 });
                        });
                    });
                });
            });

            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .fillColor('#999999')
                    .text(`Página ${i + 1} de ${range.count}`, 30, doc.page.height - 25, { align: 'center', width: doc.page.width - 60 });
            }

            doc.end();
        } catch (error) {
            console.error('Error general al generar PDF:', error);
            return res.status(500).send('Error al generar PDF');
        }
    });
});

module.exports = router;