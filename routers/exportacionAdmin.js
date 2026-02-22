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

/**
 * Función para obtener el buffer del logo.
 */
async function getLogoBuffer() {
    const localPathJpg = path.join(__dirname, '..', 'public', 'img', 'logoiujo.jpg');
    const logoUrl = 'https://aulabqto.iujoac.org.ve/pluginfile.php/1/core_admin/logo/0x200/1685566539/logo%20iujo%20para%20moodle.png';

    try {
        await fs.promises.access(localPathJpg);
        const buffer = await fs.promises.readFile(localPathJpg);
        console.log('Logo local JPG encontrado y cargado.');
        return buffer;
    } catch (localErr) {
        console.warn('Logo local no encontrado, intentando descargar...', localErr.message);
    }

    try {
        const buffer = await downloadImage(logoUrl);
        console.log('Logo descargado exitosamente desde URL');
        return buffer;
    } catch (urlErr) {
        console.error('Error al descargar logo desde URL:', urlErr.message);
        return null;
    }
}

// ==================== EXPORTACIÓN EXCEL - ADMIN ====================
router.get('/admin/exportar/excel/:rubricaId', async (req, res) => {
    if (!req.session.login) {
        return res.status(401).send('No autorizado');
    }

    const { rubricaId } = req.params;

    const query = `
        SELECT
            ee.id as evaluacion_id,
            ee.puntaje_total,
            ee.observaciones,
            ee.fecha_evaluacion,
            e.cedula as estudiante_cedula,
            e.nombre as estudiante_nombre,
            e.apellido as estudiante_apellido,
            r.id as rubrica_id,
            r.nombre_rubrica,
            r.porcentaje_evaluacion,
            r.tipo_evaluacion,
            r.modalidad,
            r.fecha_evaluacion as fecha_rubrica,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            m.semestre,
            c.nombre as carrera_nombre,
            c.codigo as carrera_codigo,
            s.codigo as seccion_codigo,
            s.horario as seccion_horario,
            s.aula as seccion_aula,
            s.lapso_academico,
            d.nombre as docente_nombre,
            d.apellido as docente_apellido,
            d.cedula as docente_cedula,
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
        WHERE r.id = ? AND e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1 AND d.activo = 1
        ORDER BY e.apellido, e.nombre
    `;

    conexion.query(query, [rubricaId], async (error, evaluaciones) => {
        if (error) {
            console.error('Error al exportar Excel:', error);
            return res.status(500).send('Error al generar Excel');
        }

        if (evaluaciones.length === 0) {
            return res.status(404).send('No se encontraron evaluaciones para esta rúbrica');
        }

        try {
            // Obtener IDs de criterios
            const queryCriterios = `
                SELECT id, rubrica_id, descripcion, puntaje_maximo, orden
                FROM criterio_evaluacion
                WHERE rubrica_id = ?
                ORDER BY orden
            `;
            
            const criterios = await new Promise((resolve, reject) => {
                conexion.query(queryCriterios, [rubricaId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Obtener detalles de evaluación
            const queryDetalles = `
                SELECT de.evaluacion_id, de.criterio_id, de.puntaje_obtenido, nd.nombre_nivel
                FROM detalle_evaluacion de
                INNER JOIN evaluacion_estudiante ee ON de.evaluacion_id = ee.id
                LEFT JOIN nivel_desempeno nd ON de.nivel_seleccionado = nd.id
                WHERE ee.rubrica_id = ?
            `;

            const detalles = await new Promise((resolve, reject) => {
                conexion.query(queryDetalles, [rubricaId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            let detallesMap = {};
            detalles.forEach(d => {
                if (!detallesMap[d.evaluacion_id]) detallesMap[d.evaluacion_id] = {};
                detallesMap[d.evaluacion_id][d.criterio_id] = {
                    puntaje: d.puntaje_obtenido,
                    nivel: d.nombre_nivel
                };
            });

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'IUJO - Sistema de Rúbricas (Admin)';
            workbook.created = new Date();

            // Obtener logo
            let logoBuffer = null;
            try {
                logoBuffer = await getLogoBuffer();
            } catch (logoError) {
                console.error('Error al obtener logo:', logoError.message);
            }

            const info = evaluaciones[0];
            const worksheet = workbook.addWorksheet('Evaluación');

            // LOGO Y ENCABEZADO INSTITUCIONAL
            if (logoBuffer) {
                try {
                    const imageId = workbook.addImage({
                        buffer: logoBuffer,
                        extension: 'jpeg'
                    });
                    
                    worksheet.addImage(imageId, {
                        tl: { col: 0, row: 0 },
                        ext: { width: 200, height: 60 },
                        editAs: 'oneCell'
                    });
                } catch (imgError) {
                    console.error('Error al agregar imagen al Excel:', imgError);
                }
            }

            for (let i = 1; i <= 8; i++) {
                worksheet.getRow(i).height = 20;
            }

            worksheet.mergeCells('B1:H2');
            const titleCell = worksheet.getCell('B1');
            titleCell.value = 'Instituto Universitario Jesús Obrero (IUJO)';
            titleCell.font = { size: 14, bold: true };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('B3:H3');
            const subtitleCell = worksheet.getCell('B3');
            subtitleCell.value = 'Extensión Barquisimeto - Reporte Administrativo';
            subtitleCell.font = { size: 11, italic: true };
            subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            worksheet.mergeCells('A4:H4');
            const rubricaCell = worksheet.getCell('A4');
            rubricaCell.value = info.nombre_rubrica;
            rubricaCell.font = { size: 12, bold: true };
            rubricaCell.alignment = { horizontal: 'center', vertical: 'middle' };
            rubricaCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            worksheet.getCell('A5').value = `Carrera: ${info.carrera_nombre}`;
            worksheet.getCell('A5').font = { bold: true };
            
            worksheet.getCell('E5').value = `Código: ${info.carrera_codigo}`;
            
            worksheet.getCell('A6').value = `Materia: ${info.materia_nombre}`;
            worksheet.getCell('E6').value = `Código: ${info.materia_codigo}`;
            
            worksheet.getCell('A7').value = `Sección: ${info.seccion_codigo}`;
            worksheet.getCell('C7').value = `Semestre: ${info.semestre}`;
            worksheet.getCell('E7').value = `Lapso: ${info.lapso_academico}`;
            
            worksheet.getCell('A8').value = `Docente: ${info.docente_nombre} ${info.docente_apellido}`;
            worksheet.getCell('E8').value = `Cédula: ${info.docente_cedula}`;

            worksheet.addRow([]);

            // Construir encabezados dinámicos
            const headerValues = ['Nro', 'Cédula', 'Apellidos y Nombres'];
            
            criterios.forEach(c => {
                headerValues.push(`${c.descripcion} (${c.puntaje_maximo}%)`);
            });
            
            headerValues.push('Total (' + info.porcentaje_evaluacion + '%)');
            headerValues.push('Estado');
            headerValues.push('Fecha Evaluación');

            const headerRow = worksheet.getRow(10);
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
            
            for (let i = 0; i < criterios.length; i++) {
                worksheet.getColumn(4 + i).width = 20;
            }
            
            worksheet.getColumn(4 + criterios.length).width = 15;
            worksheet.getColumn(5 + criterios.length).width = 15;
            worksheet.getColumn(6 + criterios.length).width = 18;

            evaluaciones.forEach((estudiante, index) => {
                const rowValues = [
                    index + 1,
                    estudiante.estudiante_cedula,
                    `${estudiante.estudiante_apellido} ${estudiante.estudiante_nombre}`.toUpperCase()
                ];

                // Puntajes por criterio
                criterios.forEach(c => {
                    const detalle = detallesMap[estudiante.evaluacion_id]?.[c.id];
                    if (detalle) {
                        rowValues.push(`${parseFloat(detalle.puntaje).toFixed(2)}\n${detalle.nivel || ''}`);
                    } else {
                        rowValues.push('-');
                    }
                });

                const puntajeObtenido = estudiante.puntaje_total !== null ? parseFloat(estudiante.puntaje_total).toFixed(2) : '0.00';
                rowValues.push(puntajeObtenido);
                rowValues.push(estudiante.estado);
                
                const fechaEval = estudiante.fecha_evaluacion ? 
                    new Date(estudiante.fecha_evaluacion).toLocaleDateString('es-ES') : '-';
                rowValues.push(fechaEval);

                const row = worksheet.addRow(rowValues);

                row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
                
                const puntajeNum = estudiante.puntaje_total !== null ? parseFloat(estudiante.puntaje_total) : 0;
                let fillColor = 'FFFFFFFF';
                
                if (puntajeNum >= 8) {
                    fillColor = 'FFD4EDDA';
                } else if (puntajeNum >= 6) {
                    fillColor = 'FFFFFFFF';
                } else if (puntajeNum >= 4) {
                    fillColor = 'FFFFF3CD';
                } else if (puntajeNum > 0) {
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

                row.getCell(rowValues.length - 2).font = { bold: true };
            });

            const totalEstudiantes = evaluaciones.length;
            const completadas = evaluaciones.filter(e => e.puntaje_total !== null).length;
            const pendientes = totalEstudiantes - completadas;
            const promedio = evaluaciones.reduce((sum, e) => sum + (e.puntaje_total || 0), 0) / completadas || 0;
            
            worksheet.addRow([]);
            
            const statsRow = worksheet.addRow([
                'ESTADÍSTICAS:',
                `Total: ${totalEstudiantes}`,
                `Completadas: ${completadas}`,
                `Pendientes: ${pendientes}`,
                `Promedio: ${promedio.toFixed(2)}`,
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

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Evaluacion_Admin_${info.materia_codigo}_${info.seccion_codigo}_${new Date().toISOString().split('T')[0]}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Error general al generar Excel:', error);
            return res.status(500).send('Error al generar Excel');
        }
    });
});

// ==================== EXPORTACIÓN PDF - ADMIN ====================
router.get('/admin/exportar/pdf/:rubricaId', async (req, res) => {
    if (!req.session.login) {
        return res.status(401).send('No autorizado');
    }

    const { rubricaId } = req.params;

    const query = `
        SELECT
            ee.id as evaluacion_id,
            ee.puntaje_total,
            ee.observaciones,
            ee.fecha_evaluacion,
            e.cedula as estudiante_cedula,
            e.nombre as estudiante_nombre,
            e.apellido as estudiante_apellido,
            r.id as rubrica_id,
            r.nombre_rubrica,
            r.porcentaje_evaluacion,
            r.tipo_evaluacion,
            r.modalidad,
            r.fecha_evaluacion as fecha_rubrica,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            m.semestre,
            c.nombre as carrera_nombre,
            c.codigo as carrera_codigo,
            s.codigo as seccion_codigo,
            s.horario as seccion_horario,
            s.aula as seccion_aula,
            s.lapso_academico,
            d.nombre as docente_nombre,
            d.apellido as docente_apellido,
            d.cedula as docente_cedula,
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
        WHERE r.id = ? AND e.activo = 1 AND r.activo = 1 AND s.activo = 1 AND c.activo = 1 AND d.activo = 1
        ORDER BY e.apellido, e.nombre
    `;

    conexion.query(query, [rubricaId], async (error, evaluaciones) => {
        if (error) {
            console.error('Error al exportar PDF:', error);
            return res.status(500).send('Error al generar PDF');
        }

        if (evaluaciones.length === 0) {
            return res.status(404).send('No se encontraron evaluaciones para esta rúbrica');
        }

        try {
            // Obtener criterios
            const queryCriterios = `
                SELECT id, rubrica_id, descripcion, puntaje_maximo, orden
                FROM criterio_evaluacion
                WHERE rubrica_id = ?
                ORDER BY orden
            `;
            
            const criterios = await new Promise((resolve, reject) => {
                conexion.query(queryCriterios, [rubricaId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            // Obtener detalles
            const queryDetalles = `
                SELECT de.evaluacion_id, de.criterio_id, de.puntaje_obtenido, nd.nombre_nivel
                FROM detalle_evaluacion de
                INNER JOIN evaluacion_estudiante ee ON de.evaluacion_id = ee.id
                LEFT JOIN nivel_desempeno nd ON de.nivel_seleccionado = nd.id
                WHERE ee.rubrica_id = ?
            `;

            const detalles = await new Promise((resolve, reject) => {
                conexion.query(queryDetalles, [rubricaId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            let detallesMap = {};
            detalles.forEach(d => {
                if (!detallesMap[d.evaluacion_id]) detallesMap[d.evaluacion_id] = {};
                detallesMap[d.evaluacion_id][d.criterio_id] = {
                    puntaje: d.puntaje_obtenido,
                    nivel: d.nombre_nivel
                };
            });

            // Obtener logo
            let logoBuffer = null;
            try {
                logoBuffer = await getLogoBuffer();
            } catch (logoError) {
                console.error('Error al obtener logo para PDF:', logoError.message);
            }

            const doc = new PDFDocument({ 
                margin: 30, 
                size: 'LETTER',
                layout: 'landscape',
                bufferPages: true
            });
            
            const info = evaluaciones[0];

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Evaluacion_Admin_${info.materia_codigo}_${info.seccion_codigo}_${new Date().toISOString().split('T')[0]}.pdf`);

            doc.pipe(res);

            // Función para agregar encabezado
            function addHeader() {
                if (logoBuffer) {
                    try {
                        doc.image(logoBuffer, 30, 30, { 
                            width: 150,
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

                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text('Instituto Universitario Jesús Obrero (IUJO)', textX, 35);
                
                doc.fontSize(11)
                   .font('Helvetica')
                   .text('Extensión Barquisimeto - Reporte Administrativo', textX, 55);
                
                doc.fontSize(10)
                   .font('Helvetica-Bold')
                   .text(`Carrera: ${info.carrera_nombre} (${info.carrera_codigo})`, textX, 75);
                
                doc.fontSize(9)
                   .font('Helvetica')
                   .text(`Materia: ${info.materia_nombre} (${info.materia_codigo})`, textX, 90);

                doc.fontSize(9)
                   .text(`Docente: ${info.docente_nombre} ${info.docente_apellido} - CI: ${info.docente_cedula}`, textX, 105);

                doc.moveDown(4);
                doc.fontSize(11)
                   .font('Helvetica-Bold')
                   .fillColor('#000000')
                   .text(info.nombre_rubrica, 30, 120, { align: 'center', width: doc.page.width - 60 });
                
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(`Valor: ${info.porcentaje_evaluacion}% | Tipo: ${info.tipo_evaluacion} | Sección: ${info.seccion_codigo} | ${info.seccion_horario} | Aula: ${info.seccion_aula} | Lapso: ${info.lapso_academico}`, 
                         30, 135, { align: 'center', width: doc.page.width - 60 });
                
                doc.moveDown(1);
            }

            addHeader();

            const tableTop = 165;
            const availableWidth = doc.page.width - 60;
            
            const fixedColsWidth = 250;
            const remainingWidth = availableWidth - fixedColsWidth - 100;
            const criteriaColWidth = Math.min(remainingWidth / (criterios.length || 1), 80);
            
            const colWidths = [30, 70, 150];
            criterios.forEach(() => colWidths.push(criteriaColWidth));
            colWidths.push(50);
            colWidths.push(50);

            const rowHeight = 35;

            // Encabezado tabla
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
            
            criterios.forEach((c, i) => {
                doc.text(`${c.descripcion} (${c.puntaje_maximo}%)`, x, tableTop + 2, { 
                    width: colWidths[3+i] - 4, 
                    align: 'center',
                    height: rowHeight - 4
                });
                x += colWidths[3+i];
            });

            doc.text('Total', x, tableTop + 12, { width: colWidths[colWidths.length-2] - 4, align: 'center' });
            x += colWidths[colWidths.length-2];
            doc.text('Estado', x, tableTop + 12, { width: colWidths[colWidths.length-1] - 4, align: 'center' });

            let currentY = tableTop + rowHeight;

            evaluaciones.forEach((est, idx) => {
                if (currentY > doc.page.height - 50) {
                    doc.addPage();
                    addHeader();
                    currentY = 165 + rowHeight;
                }

                const puntaje = est.puntaje_total !== null ? parseFloat(est.puntaje_total).toFixed(2) : '0.00';

                let fillColor = '#FFFFFF';
                if (est.puntaje_total !== null && est.puntaje_total >= 8) fillColor = '#D4EDDA';
                else if (est.puntaje_total !== null && est.puntaje_total >= 6) fillColor = '#FFFFFF';
                else if (est.puntaje_total !== null && est.puntaje_total >= 4) fillColor = '#FFF3CD';
                else if (est.puntaje_total !== null && est.puntaje_total > 0) fillColor = '#F8D7DA';

                doc.rect(30, currentY, colWidths.reduce((a,b) => a+b), 20)
                   .fillAndStroke(fillColor, '#000000');

                doc.fillColor('#000000')
                   .fontSize(7)
                   .font('Helvetica');

                x = 35;
                doc.text(`${idx + 1}`, x, currentY + 6, { width: colWidths[0] - 10, align: 'center' });
                x += colWidths[0];
                doc.text(est.estudiante_cedula, x, currentY + 6, { width: colWidths[1] - 10 });
                x += colWidths[1];
                doc.text(`${est.estudiante_apellido} ${est.estudiante_nombre}`.toUpperCase(), x, currentY + 6, { width: colWidths[2] - 10, ellipsis: true });
                x += colWidths[2];

                criterios.forEach((c, i) => {
                    const detalle = detallesMap[est.evaluacion_id]?.[c.id];
                    const text = detalle ? `${parseFloat(detalle.puntaje).toFixed(2)}` : '-';
                    doc.text(text, x, currentY + 6, { width: colWidths[3+i] - 4, align: 'center' });
                    x += colWidths[3+i];
                });

                doc.font('Helvetica-Bold')
                   .text(puntaje, x, currentY + 6, { width: colWidths[colWidths.length-2] - 4, align: 'center' });
                x += colWidths[colWidths.length-2];

                doc.font('Helvetica')
                   .fontSize(6)
                   .text(est.estado, x, currentY + 6, { width: colWidths[colWidths.length-1] - 4, align: 'center' });

                currentY += 20;
            });

            // Estadísticas
            const totalEstudiantes = evaluaciones.length;
            const completadas = evaluaciones.filter(e => e.puntaje_total !== null).length;
            const pendientes = totalEstudiantes - completadas;
            const promedio = evaluaciones.reduce((sum, e) => sum + (e.puntaje_total || 0), 0) / completadas || 0;

            currentY += 10;
            if (currentY > doc.page.height - 80) {
                doc.addPage();
                currentY = 50;
            }

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(`ESTADÍSTICAS: Total: ${totalEstudiantes} | Completadas: ${completadas} | Pendientes: ${pendientes} | Promedio: ${promedio.toFixed(2)}`, 
                     30, currentY, { width: doc.page.width - 60 });

            // Pie de página
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(7)
                   .font('Helvetica')
                   .text(`Página ${i + 1} de ${range.count}`, 30, doc.page.height - 20);
            }
            doc.end();
        } catch (error) {
            console.error('Error general al generar PDF:', error);
            return res.status(500).send('Error al generar PDF');
        }
    });
});


// API: Obtener detalles completos de una evaluación
router.get('/api/evaluacion/detalles/:rubricaId', (req, res) => {
    if(!req.session.login){
        return res.json({ success: false, message: 'No autorizado' });
    }

    const { rubricaId } = req.params;

    // Consulta para información de la rúbrica
    const queryInfo = `
                            SELECT
                				r.id AS rubrica_id,
                                r.nombre_rubrica,
                                e.contenido,
                                e.competencias,
                                e.instrumentos,
                                e.ponderacion AS porcentaje_evaluacion,
	               				GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                                CASE
                                    WHEN e.cantidad_personas=1 THEN 'Individual'
                                    WHEN e.cantidad_personas=2 THEN 'En Pareja'
                                    ELSE 'Grupal'
                                END AS modalidad,
                                m.nombre AS materia_nombre,
                				m.codigo AS materia_codigo,
                                pp.num_semestre AS semestre,
                                c.nombre AS carrera_nombre,
                                c.codigo AS carrera_codigo,
                                CONCAT(pp.codigo_carrera, '-', pp.codigo_materia, ' ', s.letra) AS seccion_codigo,
                                IFNULL(GROUP_CONCAT(DISTINCT CONCAT(hs.dia, ' (', hs.hora_inicio, '-', hs.hora_cierre, ' (', hs.aula, ')', ')') SEPARATOR ', '), 'No encontrado') AS seccion_horario,
                                pp.codigo_periodo AS lapso_academico,
                                u.nombre AS docente_nombre,
                                u.apeliido AS docente_apellido,
                                u.cedula AS docente_cedula,
                				e.fecha_evaluacion,
                				r.fecha_creacion
                            FROM rubrica r
                            INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                            INNER JOIN evaluacion e ON ru.id_eval = e.id
                			INNER JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
                            INNER JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
                            INNER JOIN seccion s ON e.id_seccion = s.id
                            INNER JOIN plan_periodo pp ON s.id_materia_plan = pp.id
                            INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
                            INNER JOIN materia m ON pp.codigo_materia = m.codigo
                            INNER JOIN permiso_docente pd ON s.id = pd.id_seccion
                			INNER JOIN usuario_docente ud ON pd.docente_cedula = ud.cedula_usuario
                			INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                            LEFT JOIN horario_seccion hs ON s.id = hs.id_seccion
                            WHERE e.id = 2 
                            AND r.activo = 1
                            GROUP BY r.id
                            ORDER BY fecha_creacion DESC;
    `;

    // Consulta para criterios
    const queryCriterios = `
        SELECT
            cr.id,
            cr.descripcion,
            cr.puntaje_maximo,
            cr.orden
        FROM criterio_rubrica cr
        WHERE cr.rubrica_id = ?
        ORDER BY cr.orden
    `;

    // Consulta para estudiantes evaluados
    const queryEstudiantes = `
        SELECT
            e.id AS evaluacion_id,
            COALESCE(er.puntaje_total, 0) as puntaje_total,
            IFNULL(er.fecha_evaluado, 'Sin Evaluar') as fecha_evaluacion,
            IFNULL(er.observaciones, 'Sin comentarios.') AS observaciones,
            u.cedula AS estudiante_cedula,
            u.nombre AS estudiante_nombre,
            u.apeliido AS estudiante_apellido,
            CASE
                WHEN er.id IS NOT NULL AND er.puntaje_total > 0 THEN 'Completada'
                WHEN er.id IS NOT NULL AND er.puntaje_total = 0 THEN 'En Progreso'
                ELSE 'Pendiente'
            END AS estado
        FROM seccion s
        INNER JOIN inscripcion_seccion ins ON ins.id_seccion = s.id
        INNER JOIN usuario u ON u.cedula = ins.cedula_estudiante
        INNER JOIN evaluacion e ON e.id_seccion = s.id
        LEFT JOIN (
            SELECT 
                er.id,
                er.cedula_evaluado,
                er.id_evaluacion,
                er.fecha_evaluado,
                er.observaciones,
                COALESCE(SUM(de.puntaje_obtenido), 0) as puntaje_total
            FROM evaluacion_realizada er
            LEFT JOIN detalle_evaluacion de ON de.evaluacion_r_id = er.id
            GROUP BY er.id
        ) er ON er.id_evaluacion = e.id AND er.cedula_evaluado = u.cedula
        WHERE e.id = ? AND u.activo = 1
        ORDER BY u.nombre, u.apeliido;
    `;

    // Ejecutar las consultas PENDIENTEEEEE: CAMBIAR RUBRICAID POR E.ID EN EL FRONT Y EL FETCH
    conexion.query(queryInfo, [rubricaId], (error, infoResults) => {
        if (error) {
            console.error('Error al obtener información:', error);
            return res.json({ success: false, message: 'Error al obtener información' });
        }

        if (infoResults.length === 0) {
            return res.json({ success: false, message: 'Rúbrica no encontrada' });
        }

        conexion.query(queryCriterios, [rubricaId], (error, criterios) => {
            if (error) {
                console.error('Error al obtener criterios:', error);
                return res.json({ success: false, message: 'Error al obtener criterios' });
            }

            conexion.query(queryEstudiantes, [rubricaId], (error, estudiantes) => {
                if (error) {
                    console.error('Error al obtener estudiantes:', error);
                    return res.json({ success: false, message: 'Error al obtener estudiantes' });
                }

                res.json({
                    success: true,
                    info: infoResults[0],
                    criterios: criterios,
                    estudiantes: estudiantes
                });
            });
        });
    });
});

module.exports = router;