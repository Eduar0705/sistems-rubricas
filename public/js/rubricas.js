// ============================================================
// VALIDACIÓN DE CRITERIOS Y NIVELES
// ============================================================

function validarEstructuraCriterios(criterios) {
    if (!Array.isArray(criterios)) {
        return { valido: false, mensaje: 'Los criterios deben ser un array' };
    }
    
    for (let i = 0; i < criterios.length; i++) {
        const criterio = criterios[i];
        
        if (!criterio.description || criterio.description.trim() === '') {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita descripción` };
        }
        
        if (!criterio.maxScore || criterio.maxScore <= 0) {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita puntaje máximo válido` };
        }
        
        if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita al menos un nivel` };
        }
        
        for (let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];
            
            if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                return { valido: false, mensaje: `El nivel ${j + 1} del criterio ${i + 1} necesita nombre` };
            }
            
            if (nivel.puntaje === undefined || nivel.puntaje === null) {
                return { valido: false, mensaje: `El nivel ${j + 1} del criterio ${i + 1} necesita puntaje` };
            }
            
            if (parseFloat(nivel.puntaje) > parseFloat(criterio.maxScore)) {
                return { valido: false, mensaje: `El puntaje del nivel "${nivel.nombre_nivel}" (${nivel.puntaje}) excede el puntaje máximo del criterio (${criterio.maxScore})` };
            }
        }
    }
    
    return { valido: true };
}

function validarPuntajesEdicion() {
    const porcentajeEvaluacion = parseFloat(document.getElementById('evalPercent')?.value) || 0;
    const criterios = document.querySelectorAll('.criteria-container');
    let sumaCriterios = 0;

    criterios.forEach((criterioCard) => {
        const puntajeMaximoInput = criterioCard.querySelector(`input[onchange*="maxScore"]`);
        const puntajeMaximo = parseFloat(puntajeMaximoInput?.value) || 0;
        sumaCriterios += puntajeMaximo;

        // Validar niveles del criterio
        const puntajesNiveles = criterioCard.querySelectorAll(`input[onchange*="puntaje"]`);
        puntajesNiveles.forEach(puntajeInput => {
            const puntajeNivel = parseFloat(puntajeInput.value) || 0;

            if (puntajeNivel > puntajeMaximo) {
                puntajeInput.style.borderColor = '#d32f2f';
                puntajeInput.title = `El puntaje del nivel no puede exceder ${puntajeMaximo}`;
            } else {
                puntajeInput.style.borderColor = '#ddd';
                puntajeInput.title = '';
            }
        });
    });

    // Validar suma de criterios
    const evalPercentInput = document.getElementById('evalPercent');
    if (evalPercentInput) {
        if (sumaCriterios > porcentajeEvaluacion) {
            evalPercentInput.style.borderColor = '#d32f2f';
            evalPercentInput.title = `La suma de criterios (${sumaCriterios}) excede el porcentaje (${porcentajeEvaluacion})`;
        } else {
            evalPercentInput.style.borderColor = '#ddd';
            evalPercentInput.title = '';
        }
    }
}

function agregarValidacionTiempoRealEdicion() {
    const evalPercent = document.getElementById('evalPercent');
    if (evalPercent) {
        evalPercent.addEventListener('input', validarPuntajesEdicion);
    }

    // Observer para detectar cambios en el DOM
    const observer = new MutationObserver(function() {
        validarPuntajesEdicion();
    });

    const criteriaContainer = document.getElementById('criteriaContainer');
    if (criteriaContainer) {
        observer.observe(criteriaContainer, { 
            childList: true, 
            subtree: true,
            attributes: false
        });
    }
}

// ============================================================
// BÚSQUEDA Y FILTROS
// ============================================================

function aplicarFiltros() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const selectedProfessor = document.getElementById('professorFilter')?.value.toLowerCase() || '';
        const tbody = document.getElementById('rubricasTableBody');
        
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const professorName = row.getAttribute('data-professor')?.toLowerCase() || '';
            
            const matchesSearch = searchTerm === '' || text.includes(searchTerm);
            const matchesProfessor = selectedProfessor === '' || professorName.includes(selectedProfessor);
            
            const isVisible = matchesSearch && matchesProfessor;
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        // Actualizar el array global y resetear paginación
        allRows = Array.from(rows).filter(row => row.style.display !== 'none');
        currentPage = 1;
        updatePagination();
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
    }
}

// Event listeners
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', aplicarFiltros);
}

const professorFilter = document.getElementById('professorFilter');
if (professorFilter) {
    professorFilter.addEventListener('change', aplicarFiltros);
}

// ============================================================
// PAGINACIÓN
// ============================================================

let currentPage = 1;
let itemsPerPage = 10;
let allRows = [];

function initializePagination() {
    const tbody = document.getElementById('rubricasTableBody');
    if (!tbody) return;
    
    allRows = Array.from(tbody.querySelectorAll('tr'));
    
    const entriesSelect = document.getElementById('entriesPerPage');
    if (!entriesSelect) return;
    
    const selectValue = entriesSelect.value;
    
    if (selectValue === 'todos') {
        itemsPerPage = Math.max(allRows.length, 1);
    } else {
        itemsPerPage = parseInt(selectValue) || 10;
    }

    entriesSelect.addEventListener('change', function() {
        if (this.value === 'todos') {
            itemsPerPage = Math.max(allRows.length, 1);
        } else {
            itemsPerPage = parseInt(this.value) || 10;
        }
        currentPage = 1;
        updatePagination();
    });

    updatePagination();
}

function updatePagination() {
    const totalItems = allRows.length;
    const infoEntries = document.getElementById('infoEntries');
    const paginacion = document.getElementById('paginacion');
    
    if (totalItems === 0) {
        if (infoEntries) {
            infoEntries.textContent = 'No hay rúbricas para mostrar';
        }
        if (paginacion) {
            paginacion.style.display = 'none';
        }
        return;
    }
    
    if (paginacion) {
        paginacion.style.display = 'flex';
    }
    
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    
    // Ajustar currentPage si está fuera de rango
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    // Mostrar filas de la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    allRows.forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });

    // Actualizar info de entradas
    const showing = Math.min(endIndex, totalItems);
    if (infoEntries) {
        infoEntries.textContent = `Mostrando ${startIndex + 1} a ${showing} de ${totalItems} rúbricas`;
    }

    // Generar números de página
    generatePageNumbers(totalPages);

    // Actualizar botones anterior/siguiente
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (btnAnterior) {
        btnAnterior.disabled = currentPage === 1;
    }
    if (btnSiguiente) {
        btnSiguiente.disabled = currentPage === totalPages;
    }
}

function generatePageNumbers(totalPages) {
    const pageNumbersContainer = document.getElementById('numerosPagina');
    if (!pageNumbersContainer) return;
    
    pageNumbersContainer.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.style.padding = '8px 12px';
        pageButton.style.border = '1px solid #ddd';
        pageButton.style.borderRadius = '6px';
        pageButton.style.background = i === currentPage ? '#007bff' : 'white';
        pageButton.style.color = i === currentPage ? 'white' : 'black';
        pageButton.style.cursor = 'pointer';
        pageButton.style.margin = '0 2px';

        pageButton.addEventListener('click', () => {
            currentPage = i;
            updatePagination();
        });

        pageNumbersContainer.appendChild(pageButton);
    }
}

// Event listeners para botones de paginación
const btnAnterior = document.getElementById('btnAnterior');
if (btnAnterior) {
    btnAnterior.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });
}

const btnSiguiente = document.getElementById('btnSiguiente');
if (btnSiguiente) {
    btnSiguiente.addEventListener('click', function() {
        const totalPages = Math.ceil(allRows.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
}

// ============================================================
// CARGAR PROFESORES
// ============================================================

function loadProfesores() {
    fetch('/admin/rubricas/profesores')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const professorFilter = document.getElementById('professorFilter');
                if (professorFilter) {
                    data.profesores.forEach(profesor => {
                        const option = document.createElement('option');
                        option.value = profesor.docente_nombre;
                        option.textContent = profesor.docente_nombre;
                        professorFilter.appendChild(option);
                    });
                }
            }
        })
        .catch(error => console.error('Error cargando profesores:', error));
}

// ============================================================
// VER E IMPRIMIR RÚBRICA
// ============================================================

function verRubrica(id) {
    Swal.fire({
        title: 'Cargando rúbrica...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(`/admin/rubricas/detalle/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar la rúbrica');
            }
            return response.json();
        })
        .then(data => {
            if(data.success) {
                imprimirRubrica(data.rubrica, data.criterios);
            } else {
                Swal.fire('Error', data.message || 'No se pudo cargar la rúbrica', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar la rúbrica', 'error');
        });
}

function organizarNivelesPorNombre(criterios) {
    if (!criterios || criterios.length === 0) {
        return { nombres: ['Sobresaliente', 'Notable', 'Aprobado', 'Insuficiente'] };
    }
    
    // Obtener el criterio con más niveles
    const criterioConMasNiveles = criterios.reduce((max, criterio) => {
        const nivelesCount = (criterio.niveles && Array.isArray(criterio.niveles)) ? criterio.niveles.length : 0;
        const maxCount = (max.niveles && Array.isArray(max.niveles)) ? max.niveles.length : 0;
        return nivelesCount > maxCount ? criterio : max;
    }, criterios[0]);
    
    if (!criterioConMasNiveles.niveles || criterioConMasNiveles.niveles.length === 0) {
        return { nombres: ['Sobresaliente', 'Notable', 'Aprobado', 'Insuficiente'] };
    }
    
    // Ordenar por puntaje descendente
    const nivelesOrdenados = [...criterioConMasNiveles.niveles].sort((a, b) => {
        const puntajeA = parseFloat(a.puntaje) || 0;
        const puntajeB = parseFloat(b.puntaje) || 0;
        return puntajeB - puntajeA;
    });
    
    return { 
        nombres: nivelesOrdenados.map(n => n.nombre_nivel || 'Sin nombre')
    };
}

function imprimirRubrica(rubrica, criterios) {
    Swal.close();
    
    if (!rubrica || !criterios) {
        Swal.fire('Error', 'Datos incompletos para imprimir', 'error');
        return;
    }
    
    const numNiveles = (criterios.length > 0 && criterios[0].niveles) ? criterios[0].niveles.length : 4;
    const nivelesOrganizados = organizarNivelesPorNombre(criterios);
    
    const ventanaImpresion = window.open('', '_blank', 'width=1200,height=900');
    
    if (!ventanaImpresion) {
        Swal.fire('Error', 'No se pudo abrir la ventana de impresión. Verifique que las ventanas emergentes estén habilitadas.', 'error');
        return;
    }
    
    const htmlImpresion = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${rubrica.nombre_rubrica || 'Rúbrica'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; padding: 20px; font-size: 10px; line-height: 1.3; }
        .header-container { display: flex; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #000; }
        .logo-section { width: 150px; margin-right: 15px; }
        .title-section { flex: 1; }
        .main-title { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-table td { border: 1px solid #000; padding: 4px 8px; font-size: 10px; }
        .info-label { font-weight: bold; background-color: #e8e8e8; width: 130px; }
        .competencias-section { margin-bottom: 12px; }
        .competencias-table { width: 100%; border-collapse: collapse; }
        .competencias-table td { border: 1px solid #000; padding: 6px 8px; }
        .competencias-label { font-weight: bold; background-color: #e8e8e8; width: 130px; }
        .student-section { margin-bottom: 12px; }
        .student-table { width: 100%; border-collapse: collapse; }
        .student-table td { border: 1px solid #000; padding: 6px 8px; }
        .student-label { font-weight: bold; width: 130px; background-color: #e8e8e8; }
        .rubrica-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .rubrica-table th, .rubrica-table td { border: 1px solid #000; padding: 6px; text-align: left; vertical-align: top; font-size: 9px; }
        .rubrica-table th { background-color: #2c3e50; color: white; font-weight: bold; text-align: center; font-size: 10px; }
        .criterio-cell { font-weight: bold; background-color: #f0f0f0; width: 18%; }
        .nivel-cell { width: ${numNiveles > 0 ? Math.floor(82 / numNiveles) : 20}%; }
        .puntaje { display: block; margin-top: 4px; font-size: 9px; color: #d35400; font-weight: bold; }
        @media print {
            body { padding: 10px; }
            @page { margin: 15mm; size: landscape; }
            .no-print { display: none; }
        }
        .print-button { position: fixed; top: 20px; right: 20px; padding: 12px 25px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1000; }
        .print-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <button onclick="window.print()" class="print-button no-print">
        <i class="fas fa-print"></i> Imprimir
    </button>
    <div class="header-container">
        <div class="logo-section">
            <img src="../img/IUJO.gif" alt="Logo" style="max-width: 100%; max-height: 100%;" onerror="this.style.display='none'">
        </div>
        <div class="title-section">
            <div class="main-title">${(rubrica.nombre_rubrica || 'RÚBRICA').toUpperCase()}</div>
        </div>
    </div>
    <table class="info-table">
        <tr>
            <td class="info-label">Docente:</td><td>${rubrica.docente_nombre || 'N/A'}</td>
            <td class="info-label">Unidad Curricular:</td><td>${rubrica.materia_nombre || 'N/A'}</td>
        </tr>
        <tr>
            <td class="info-label">Carrera:</td><td>${rubrica.carrera_nombre || 'N/A'}</td>
            <td class="info-label">Sección:</td><td>${rubrica.seccion_codigo || 'N/A'}</td>
        </tr>
        <tr>
            <td class="info-label">Fecha:</td><td>${rubrica.fecha_evaluacion ? new Date(rubrica.fecha_evaluacion).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td class="info-label">Lapso:</td><td>${rubrica.lapso_academico || 'N/A'}</td>
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
    </div>` : ''}
    <div class="student-section">
        <table class="student-table">
            <tr>
                <td class="student-label">Nombre del estudiante:</td><td style="width: 50%;"></td>
                <td class="student-label">Observaciones:</td><td style="width: 30%;"></td>
            </tr>
        </table>
    </div>
    <table class="rubrica-table">
        <thead>
            <tr>
                <th style="width: 18%;">Criterios de Evaluación</th>
                ${nivelesOrganizados.nombres.map(nombre => `<th class="nivel-cell">${nombre}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${criterios.map(criterio => {
                const nivelesDelCriterio = nivelesOrganizados.nombres.map(nombreNivel => {
                    if (!criterio.niveles || !Array.isArray(criterio.niveles)) {
                        return { descripcion: '', puntaje: 0 };
                    }
                    const nivel = criterio.niveles.find(n => 
                        n.nombre_nivel && n.nombre_nivel.toLowerCase().includes(nombreNivel.toLowerCase().split(' ')[0])
                    );
                    return nivel || { descripcion: '', puntaje: 0 };
                });
                return `
                    <tr>
                        <td class="criterio-cell">
                            ${criterio.descripcion || 'Sin descripción'}
                            <span class="puntaje">(${criterio.puntaje_maximo || 0} puntos)</span>
                        </td>
                        ${nivelesDelCriterio.map(nivel => `
                            <td class="nivel-cell">
                                ${nivel.descripcion || ''}
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
</html>`;
    
    try {
        ventanaImpresion.document.write(htmlImpresion);
        ventanaImpresion.document.close();
    } catch (error) {
        console.error('Error al generar vista de impresión:', error);
        Swal.fire('Error', 'No se pudo generar la vista de impresión', 'error');
    }
}

// ============================================================
// MODAL DE EDICIÓN
// ============================================================

let rubricData = { criteria: [] };

function openModal(rubricId) {
    if (rubricId) {
        loadRubricData(rubricId);
    } else {
        resetModal();
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.add('active');
    }
}

function loadRubricData(rubricId) {
    fetch(`/admin/rubricas/editar/${rubricId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                populateModal(data);
                const modalOverlay = document.getElementById('modalOverlay');
                if (modalOverlay) modalOverlay.classList.add('active');
            } else {
                Swal.fire('Error', data.message || 'Error al cargar', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar la rúbrica', 'error');
        });
}

function populateModal(data) {
    const rubrica = data.rubrica;
    const campos = {
        rubricId: rubrica.id,
        rubricName: rubrica.nombre_rubrica,
        evalDate: rubrica.fecha_evaluacion ? rubrica.fecha_evaluacion.split('T')[0] : '',
        evalPercent: rubrica.porcentaje_evaluacion,
        evalType: rubrica.tipo_evaluacion,
        competencies: rubrica.competencias || '',
        instructions: rubrica.instrucciones || ''
    };

    Object.keys(campos).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = campos[id];
    });

    loadMateriasYSecciones(() => {
        const subjectSelect = document.getElementById('subject');
        const sectionSelect = document.getElementById('section');
        if (subjectSelect) subjectSelect.value = rubrica.materia_codigo;
        if (sectionSelect) sectionSelect.value = rubrica.seccion_id;
    });

    rubricData.criteria = data.criterios.map(criterio => ({
        id: criterio.id,
        description: criterio.descripcion,
        maxScore: criterio.puntaje_maximo,
        order: criterio.orden,
        niveles: (criterio.niveles || []).map(nivel => ({
            nombre_nivel: nivel.nombre_nivel,
            descripcion: nivel.descripcion,
            puntaje: nivel.puntaje,
            orden: nivel.orden
        }))
    }));

    renderCriteria();
}

function loadMateriasYSecciones(callback) {
    fetch('/admin/opciones')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar opciones');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const materiaSelect = document.getElementById('subject');
                if (materiaSelect) {
                    materiaSelect.innerHTML = '<option value="">Seleccionar materia</option>';
                    data.materias.forEach(materia => {
                        materiaSelect.innerHTML += `<option value="${materia.codigo}">${materia.nombre}</option>`;
                    });
                }

                const seccionSelect = document.getElementById('section');
                if (seccionSelect) {
                    seccionSelect.innerHTML = '<option value="">Seleccionar sección</option>';
                    data.secciones.forEach(seccion => {
                        seccionSelect.innerHTML += `<option value="${seccion.id}">${seccion.codigo} - ${seccion.materia_codigo}</option>`;
                    });
                }

                if (callback) callback();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar las opciones', 'error');
        });
}

function resetModal() {
    const rubricForm = document.getElementById('rubricForm');
    if (rubricForm) rubricForm.reset();
    const rubricId = document.getElementById('rubricId');
    if (rubricId) rubricId.value = '';
    rubricData.criteria = [];
    loadMateriasYSecciones();
    renderCriteria();
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

const modalOverlay = document.getElementById('modalOverlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// ============================================================
// GESTIÓN DE CRITERIOS Y NIVELES
// ============================================================

function addCriteria() {
    rubricData.criteria.push({
        id: null,
        description: '',
        maxScore: 10,
        order: rubricData.criteria.length + 1,
        niveles: [
            { nombre_nivel: 'Sobresaliente', descripcion: '', puntaje: 10, orden: 1 },
            { nombre_nivel: 'Notable', descripcion: '', puntaje: 8, orden: 2 },
            { nombre_nivel: 'Aprobado', descripcion: '', puntaje: 6, orden: 3 },
            { nombre_nivel: 'Insuficiente', descripcion: '', puntaje: 4, orden: 4 }
        ]
    });
    renderCriteria();
}

function deleteCriteria(index) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminará el criterio y todos sus niveles",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            rubricData.criteria.splice(index, 1);
            renderCriteria();
            Swal.fire('Eliminado', 'El criterio ha sido eliminado', 'success');
        }
    });
}

function renderCriteria() {
    const container = document.getElementById('criteriaContainer');
    if (!container) return;
    
    if (rubricData.criteria.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No hay criterios. Haga clic en "Agregar Criterio".</p>';
        return;
    }

    container.innerHTML = rubricData.criteria.map((criteria, index) => `
        <div class="criteria-container">
            <div class="criteria-header">
                <div class="criteria-main">
                    <div class="form-group">
                        <label>Descripción del criterio</label>
                        <input type="text" placeholder="Descripción del criterio"
                            value="${criteria.description || ''}"
                            onchange="updateCriteria(${index}, 'description', this.value)">
                    </div>
                </div>
                <button type="button" class="criteria-delete" onclick="deleteCriteria(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="criteria-fields">
                <div class="form-group">
                    <label>Puntaje Máximo</label>
                    <input type="number" value="${criteria.maxScore || 10}" min="1"
                        onchange="updateCriteria(${index}, 'maxScore', this.value)">
                </div>
                <div class="form-group">
                    <label>Orden</label>
                    <input type="number" value="${criteria.order || index + 1}" min="1"
                        onchange="updateCriteria(${index}, 'order', this.value)">
                </div>
            </div>
            
            <div class="section-title" style="font-size: 14px; margin-top: 15px;">
                <span class="section-title-icon"><i class="fas fa-star"></i></span>
                Niveles de Desempeño
            </div>
            <div id="niveles-${index}"></div>
            <div class="add-button-section">
                <button type="button" class="btn btn-add btn-small" onclick="addNivelToCriteria(${index})">
                    + Agregar Nivel
                </button>
            </div>
        </div>
    `).join('');

    rubricData.criteria.forEach((criteria, index) => {
        renderNivelesDeCriterio(index);
    });
    
    setTimeout(validarPuntajesEdicion, 100);
}

function updateCriteria(index, field, value) {
    if (!rubricData.criteria[index]) return;
    
    if (field === 'description') {
        rubricData.criteria[index][field] = value;
    } else {
        const numValue = parseInt(value) || 0;
        rubricData.criteria[index][field] = numValue;
    }
    
    validarPuntajesEdicion();
}

function addNivelToCriteria(criteriaIndex) {
    if (!rubricData.criteria[criteriaIndex]) return;
    
    if (!rubricData.criteria[criteriaIndex].niveles) {
        rubricData.criteria[criteriaIndex].niveles = [];
    }

    const niveles = rubricData.criteria[criteriaIndex].niveles;
    const defaultNames = ['Sobresaliente', 'Notable', 'Aprobado', 'Insuficiente', 'Reprobado'];
    const nextName = defaultNames[niveles.length] || `Nivel ${niveles.length + 1}`;

    niveles.push({
        nombre_nivel: nextName,
        descripcion: '',
        puntaje: niveles.length + 1,
        orden: niveles.length + 1
    });

    renderNivelesDeCriterio(criteriaIndex);
}

function deleteNivelFromCriteria(criteriaIndex, nivelIndex) {
    if (!rubricData.criteria[criteriaIndex] || !rubricData.criteria[criteriaIndex].niveles) return;
    
    if (rubricData.criteria[criteriaIndex].niveles.length <= 1) {
        Swal.fire('Error', 'Debe mantener al menos un nivel por criterio', 'error');
        return;
    }
    
    rubricData.criteria[criteriaIndex].niveles.splice(nivelIndex, 1);
    renderNivelesDeCriterio(criteriaIndex);
}

function renderNivelesDeCriterio(criteriaIndex) {
    const container = document.getElementById(`niveles-${criteriaIndex}`);
    if (!container) return;
    
    const niveles = rubricData.criteria[criteriaIndex]?.niveles || [];
    
    if (niveles.length === 0) {
        container.innerHTML = '<p class="placeholder-text" style="font-size: 12px; margin: 10px 0;">No hay niveles. Agregue al menos uno.</p>';
        return;
    }
    
    container.innerHTML = niveles.map((nivel, nivelIndex) => `
        <div class="performance-level">
            <div class="performance-header">
                <div class="form-group">
                    <input type="text" placeholder="Nombre (ej: Sobresaliente)"
                        value="${nivel.nombre_nivel || ''}"
                        onchange="updateNivel(${criteriaIndex}, ${nivelIndex}, 'nombre_nivel', this.value)">
                </div>
                <div class="performance-score">
                    <label>Puntaje</label>
                    <input type="number" value="${nivel.puntaje || 0}" min="0"
                        onchange="updateNivel(${criteriaIndex}, ${nivelIndex}, 'puntaje', this.value)">
                </div>
                <div class="form-group performance-order">
                    <input type="number" value="${nivel.orden || nivelIndex + 1}" min="1"
                        onchange="updateNivel(${criteriaIndex}, ${nivelIndex}, 'orden', this.value)">
                </div>
                <button type="button" class="criteria-delete" onclick="deleteNivelFromCriteria(${criteriaIndex}, ${nivelIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-group">
                <label>Descripción del nivel</label>
                <textarea placeholder="Descripción..."
                    onchange="updateNivel(${criteriaIndex}, ${nivelIndex}, 'descripcion', this.value)">${nivel.descripcion || ''}</textarea>
            </div>
        </div>
    `).join('');
    
    setTimeout(validarPuntajesEdicion, 100);
}

function updateNivel(criteriaIndex, nivelIndex, field, value) {
    if (!rubricData.criteria[criteriaIndex] || !rubricData.criteria[criteriaIndex].niveles[nivelIndex]) return;
    
    const nivel = rubricData.criteria[criteriaIndex].niveles[nivelIndex];
    
    if (field === 'puntaje' || field === 'orden') {
        nivel[field] = parseInt(value) || 0;
    } else {
        nivel[field] = value;
    }
    
    validarPuntajesEdicion();
}

// ============================================================
// ENVÍO DEL FORMULARIO
// ============================================================

const rubricForm = document.getElementById('rubricForm');
if (rubricForm) {
    rubricForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validar campos básicos
        const nombreRubrica = document.getElementById('rubricName')?.value.trim();
        const materiaId = document.getElementById('subject')?.value;
        const seccionId = document.getElementById('section')?.value;
        const fechaEval = document.getElementById('evalDate')?.value;
        const porcentaje = parseFloat(document.getElementById('evalPercent')?.value);
        const tipoEval = document.getElementById('evalType')?.value;

        if (!nombreRubrica) {
            Swal.fire('Error', 'El nombre de la rúbrica es obligatorio', 'error');
            return;
        }

        if (!materiaId) {
            Swal.fire('Error', 'Debe seleccionar una materia', 'error');
            return;
        }

        if (!seccionId) {
            Swal.fire('Error', 'Debe seleccionar una sección', 'error');
            return;
        }

        if (!fechaEval) {
            Swal.fire('Error', 'La fecha de evaluación es obligatoria', 'error');
            return;
        }

        if (!porcentaje || porcentaje <= 0 || porcentaje > 100) {
            Swal.fire('Error', 'El porcentaje debe estar entre 1 y 100', 'error');
            return;
        }

        if (!tipoEval) {
            Swal.fire('Error', 'Debe seleccionar un tipo de evaluación', 'error');
            return;
        }

        // Validar criterios
        if (!rubricData.criteria || rubricData.criteria.length === 0) {
            Swal.fire('Error', 'Debe agregar al menos un criterio', 'error');
            return;
        }

        // Validar estructura de criterios
        const validacion = validarEstructuraCriterios(rubricData.criteria);
        if (!validacion.valido) {
            Swal.fire('Error', validacion.mensaje, 'error');
            return;
        }

        // Validar suma de puntajes
        const sumaPuntajes = rubricData.criteria.reduce((sum, c) => sum + (parseFloat(c.maxScore) || 0), 0);
        if (sumaPuntajes > porcentaje) {
            Swal.fire('Error', 
                `La suma de puntajes máximos (${sumaPuntajes}) no puede exceder el porcentaje de evaluación (${porcentaje})`, 
                'error');
            return;
        }

        // Preparar datos
        const criteriosData = rubricData.criteria.map((criterio, index) => ({
            id: criterio.id,
            descripcion: criterio.description,
            puntaje_maximo: parseFloat(criterio.maxScore),
            orden: criterio.order || index + 1,
            niveles: (criterio.niveles || []).map((nivel, idx) => ({
                nombre_nivel: nivel.nombre_nivel,
                descripcion: nivel.descripcion,
                puntaje: parseFloat(nivel.puntaje),
                orden: nivel.orden || idx + 1
            }))
        }));

        const formData = new FormData(this);
        const data = {
            id: formData.get('id'),
            nombre_rubrica: nombreRubrica,
            materia_codigo: materiaId,
            seccion_id: seccionId,
            fecha_evaluacion: fechaEval,
            porcentaje_evaluacion: porcentaje,
            tipo_evaluacion: tipoEval,
            competencias: formData.get('competencias') || '',
            instrucciones: formData.get('instrucciones') || '',
            criterios: criteriosData
        };

        // Loading
        Swal.fire({
            title: 'Actualizando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar como JSON
        fetch('/updateRubrica', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            return response.json();
        })
        .then(result => {
            if (result && result.success === false) {
                Swal.fire('Error', result.message || 'No se pudo actualizar la rúbrica', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo actualizar la rúbrica. Verifique su conexión.', 'error');
        });
    });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    try {
        loadProfesores();
        initializePagination();
        agregarValidacionTiempoRealEdicion();
    } catch (error) {
        console.error('Error en inicialización:', error);
    }
});