// Función para salir
function Exit(){
    Swal.fire({
        icon: 'warning',
        title: 'Validación',
        text: '¿Estás seguro que deseas salir?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if(result.isConfirmed){
            window.location.href = '/login'
        }
    });
}

// Búsqueda en tiempo real
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Función para ver rúbrica
function verRubrica(id) {
    Swal.fire({
        title: 'Cargando rúbrica...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(`/admin/rubricas/detalle/${id}`)
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                imprimirRubrica(data.rubrica, data.criterios);
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar la rúbrica', 'error');
        });
}

// Función para imprimir rúbrica en formato profesional
function imprimirRubrica(rubrica, criterios) {
    Swal.close();
    
    // Determinar cuántos niveles tiene la rúbrica
    const numNiveles = criterios.length > 0 ? criterios[0].niveles.length : 4;
    
    // Organizar niveles por nombre común
    const nivelesOrganizados = organizarNivelesPorNombre(criterios);
    
    const ventanaImpresion = window.open('', '_blank', 'width=1200,height=900');
    
    const htmlImpresion = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${rubrica.nombre_rubrica}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            font-size: 10px;
            line-height: 1.3;
        }
        
        .header-container {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
        }
        
        .logo-section {
            width: 150px;
            margin-right: 15px;
        }
        
        .logo-placeholder {
            width: 140px;
            height: 45px;
            border: 2px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            color: #666;
            background: #f5f5f5;
        }
        
        .title-section {
            flex: 1;
        }
        
        .main-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        
        .info-table td {
            border: 1px solid #000;
            padding: 4px 8px;
            font-size: 10px;
        }
        
        .info-label {
            font-weight: bold;
            background-color: #e8e8e8;
            width: 130px;
        }
        
        .competencias-section {
            margin-bottom: 12px;
        }
        
        .competencias-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .competencias-table td {
            border: 1px solid #000;
            padding: 6px 8px;
        }
        
        .competencias-label {
            font-weight: bold;
            background-color: #e8e8e8;
            width: 130px;
        }
        
        .competencias-content {
            font-size: 10px;
            line-height: 1.4;
        }
        
        .student-section {
            margin-bottom: 12px;
        }
        
        .student-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .student-table td {
            border: 1px solid #000;
            padding: 6px 8px;
        }
        
        .student-label {
            font-weight: bold;
            width: 130px;
            background-color: #e8e8e8;
        }
        
        .rubrica-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .rubrica-table th,
        .rubrica-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            font-size: 9px;
        }
        
        .rubrica-table th {
            background-color: #2c3e50;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
        }
        
        .criterio-cell {
            font-weight: bold;
            background-color: #f0f0f0;
            width: 18%;
        }
        
        .nivel-cell {
            width: ${numNiveles > 0 ? Math.floor(82 / numNiveles) : 20}%;
        }
        
        .puntaje {
            display: block;
            margin-top: 4px;
            font-size: 9px;
            color: #d35400;
            font-weight: bold;
        }
        
        @media print {
            body {
                padding: 10px;
            }
            
            @page {
                margin: 15mm;
                size: landscape;
            }
            
            .no-print {
                display: none;
            }
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 25px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="print-button no-print">
        <i class="fas fa-print"></i> Imprimir
    </button>

    <div class="header-container">
        <div class="logo-section">
            <img src="../img/IUJO.gif" alt="Logo" style="max-width: 100%; max-height: 100%;">
        </div>
        <div class="title-section">
            <div class="main-title">
                ${rubrica.nombre_rubrica.toUpperCase()}
            </div>
        </div>
    </div>
    
    <table class="info-table">
        <tr>
            <td class="info-label">Docente:</td>
            <td>${rubrica.docente_nombre}</td>
            <td class="info-label">Unidad Curricular:</td>
            <td>${rubrica.materia_nombre}</td>
        </tr>
        <tr>
            <td class="info-label">Carrera:</td>
            <td>${rubrica.carrera_nombre}</td>
            <td class="info-label">Sección:</td>
            <td>${rubrica.seccion_codigo}</td>
        </tr>
        <tr>
            <td class="info-label">Fecha:</td>
            <td>${new Date(rubrica.fecha_evaluacion).toLocaleDateString('es-ES')}</td>
            <td class="info-label">Lapso:</td>
            <td>${rubrica.lapso_academico}</td>
        </tr>
    </table>
    
    ${rubrica.competencias ? `
    <div class="competencias-section">
        <table class="competencias-table">
            <tr>
                <td class="competencias-label">Competencias:</td>
                <td class="competencias-content">${rubrica.competencias}</td>
            </tr>
        </table>
    </div>
    ` : ''}
    
    <div class="student-section">
        <table class="student-table">
            <tr>
                <td class="student-label">Nombre del estudiante:</td>
                <td style="width: 50%;"></td>
                <td class="student-label">Observaciones:</td>
                <td style="width: 30%;"></td>
            </tr>
        </table>
    </div>
    
    <table class="rubrica-table">
        <thead>
            <tr>
                <th style="width: 18%;">Criterios de Evaluación</th>
                ${nivelesOrganizados.nombres.map(nombre => `
                    <th class="nivel-cell">${nombre}</th>
                `).join('')}
            </tr>
        </thead>
        <tbody>
            ${criterios.map(criterio => {
                const nivelesDelCriterio = nivelesOrganizados.nombres.map(nombreNivel => {
                    const nivel = criterio.niveles.find(n => 
                        n.nombre_nivel.toLowerCase().includes(nombreNivel.toLowerCase().split(' ')[0])
                    );
                    return nivel || { descripcion: '', puntaje: 0 };
                });
                
                return `
                    <tr>
                        <td class="criterio-cell">
                            ${criterio.descripcion}
                            <span class="puntaje">(${criterio.puntaje_maximo} puntos)</span>
                        </td>
                        ${nivelesDelCriterio.map(nivel => `
                            <td class="nivel-cell">
                                ${nivel.descripcion}
                                ${nivel.puntaje > 0 ? `<span class="puntaje">(${nivel.puntaje} puntos)</span>` : ''}
                            </td>
                        `).join('')}
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</body>
</html>
    `;
    
    ventanaImpresion.document.write(htmlImpresion);
    ventanaImpresion.document.close();
}

// Función auxiliar para organizar niveles por nombre común
function organizarNivelesPorNombre(criterios) {
    if(criterios.length === 0) return { nombres: [] };
    
    // Obtener los nombres de nivel del primer criterio como base
    const primerCriterio = criterios[0];
    const nombresBase = primerCriterio.niveles.map(n => n.nombre_nivel);
    
    // Detectar patrones comunes
    const nombresComunes = [];
    const patrones = ['sobresaliente', 'notable', 'aprobado', 'insuficiente', 'excelente', 'bueno', 'regular', 'deficiente'];
    
    nombresBase.forEach(nombre => {
        const nombreLower = nombre.toLowerCase();
        const patronEncontrado = patrones.find(p => nombreLower.includes(p));
        if(patronEncontrado && !nombresComunes.some(n => n.toLowerCase().includes(patronEncontrado))) {
            nombresComunes.push(nombre);
        }
    });
    
    // Si no encontramos patrones, usar los nombres tal cual
    if(nombresComunes.length === 0) {
        return { nombres: nombresBase };
    }
    
    return { nombres: nombresComunes };
}