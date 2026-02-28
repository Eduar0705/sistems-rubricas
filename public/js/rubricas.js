// ============================================================
// VARIABLES GLOBALES PARA EDICIÓN
// ============================================================
let criterioCountEdit = 0;
let porcentajeEvaluacionEdit = 10;
let carrerasDataEdit = [];
let estrategias_eval = null;

// ============================================================
// BÚSQUEDA Y FILTROS
// ============================================================
async function cargarEstrategias() {
    try {
        const response = await fetch('/api/estrategias_eval');
        const data = await response.json();

        if (data.success) {
            const div = document.getElementById('estrategias_eval');
            div.innerHTML = ''
            const labelHTML = ``;
            let checkboxesHTML = '';
            data.estrategias_eval.forEach(estrategia => {
                checkboxesHTML += `
                    <div class="estrategia-item">
                        <input type="checkbox" 
                               class="form-check-input" 
                               id="estrategia_${estrategia.id}" 
                               value="${estrategia.id}"
                               name="estrategias[]"
                               ${estrategia.ponderable == 0 ? `onclick="verificarPonderacion(${estrategia.id})"` : 'onclick="verificarFormularioCompleto()"'}
                               disabled>
                        <label class="form-check-label" 
                               for="estrategia_${estrategia.id}">
                            ${estrategia.nombre}
                        </label>
                    </div>
                `;
            });

            div.innerHTML = labelHTML + checkboxesHTML;
            return data.estrategias_eval
        }
    } catch (error) {
        console.error('Error al cargar carreras:', error);
        Swal.fire('Error', 'No se pudieron cargar las carreras', 'error');
    }
}
function aplicarFiltros() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
        const selectedProfessor = document.getElementById('professorFilter')?.value.toLowerCase() || '';
        const tbody = document.getElementById('rubricasTableBody');

        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            // Obtener el nombre de la rúbrica específicamente (primera columna)
            const rubricNameCell = row.querySelector('td:first-child .table-cell-main');
            const rubricName = rubricNameCell ? rubricNameCell.textContent.toLowerCase().trim() : '';
            const professorName = row.getAttribute('data-professor')?.toLowerCase() || '';

            // Filtrado más preciso: buscar en el nombre de la rúbrica específicamente
            let matchesSearch = true;
            if (searchTerm !== '') {
                // Si hay término de búsqueda, debe coincidir exactamente con el nombre de la rúbrica
                // o al menos contener las palabras completas del término de búsqueda
                const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
                matchesSearch = searchWords.every(word =>
                    rubricName.includes(word) || rubricName === searchTerm
                );
            }

            const matchesProfessor = selectedProfessor === '' || professorName.includes(selectedProfessor);

            const isVisible = matchesSearch && matchesProfessor;
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        // Actualizar el array global y resetear paginación
        allRows = Array.from(rows).filter(row => row.style.display !== 'none');
        currentPage = 1;
        updatePagination();

        // Actualizar el contador de entradas mostradas
        const infoEntries = document.getElementById('infoEntries');
        if (infoEntries) {
            if (visibleCount === 0 && (searchTerm !== '' || selectedProfessor !== '')) {
                infoEntries.textContent = 'No se encontraron rúbricas que coincidan con los filtros aplicados';
            } else {
                const totalRows = rows.length;
                infoEntries.textContent = `Mostrando ${visibleCount} de ${totalRows} rúbricas`;
            }
        }
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
// VER E IMPRIMIR RÚBRICA
// ============================================================

function verRubrica(id) {
    const rubroute = window.location.pathname.includes('/teacher/') ? 'teacher' : 'admin';

    Swal.fire({
        title: 'Cargando rúbrica...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(`/${rubroute}/rubricas/detalle/${id}`)
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
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'No se pudo cargar la rúbrica',
                    icon: 'error'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la rúbrica',
                icon: 'error'
            });
        });
}

function editarRubrica(id) {
    openModal(id);
}

function organizarNivelesPorNombre(criterios) {
    if (!criterios || criterios.length === 0) {
        return { nombres: ['Sobresaliente', 'Notable', 'Aprobado', 'Insuficiente'] };
    }
    
    const criterioConMasNiveles = criterios.reduce((max, criterio) => {
        const nivelesCount = (criterio.niveles && Array.isArray(criterio.niveles)) ? criterio.niveles.length : 0;
        const maxCount = (max.niveles && Array.isArray(max.niveles)) ? max.niveles.length : 0;
        return nivelesCount > maxCount ? criterio : max;
    }, criterios[0]);
    
    if (!criterioConMasNiveles.niveles || criterioConMasNiveles.niveles.length === 0) {
        return { nombres: ['Sobresaliente', 'Notable', 'Aprobado', 'Insuficiente'] };
    }
    
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
        .student-label { font-weight: bold; width: 330px; background-color: #e8e8e8; }
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
            ${[1,2,3,4,5,6].map(i => `
                <tr>
                    <td class="student-label">Nombre :</td>
                    <td style="width: 50%;"></td>
                    <td class="student-label">Observaciones:</td>
                    <td style="width: 30%;"></td>
                </tr>
            `).join('')}
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
// MODAL DE EDICIÓN - ABRIR Y CERRAR
// ============================================================

function openModal(rubricId) {
    if (rubricId) {
        loadRubricData(rubricId);
    } else {
        resetModalEdit();
    }
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetModalEdit();
}

// Cerrar modal al hacer clic en el overlay
const modalOverlay = document.getElementById('modalOverlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// ============================================================
// CARGAR DATOS DE LA RÚBRICA
// ============================================================

async function loadRubricData(rubricId) {
    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        zIndex: 9999,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/admin/rubricas/editar/${rubricId}`);
        if (!response.ok) throw new Error('Error al cargar');
        
        const data = await response.json();
        Swal.close();
        
        if (data.success) {
            populateModalEdit(data);
            // Cargar estrategias y guardarlas globalmente
            const estrategias = await cargarEstrategias();
            estrategias_eval = estrategias; // Guardar global
            cargarEstrategiasEdit(estrategias_eval, data.rubrica.estrategias);
        } else {
            Swal.fire('Error', data.message || 'Error al cargar la rúbrica', 'error');
        }
    } catch (error) {
        Swal.close();
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo cargar la rúbrica', 'error');
    }
}
function formatearFechaParaInput(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
// ============================================================
// SISTEMA DE SELECCIÓN JERÁRQUICO PARA EDICIÓN (MODIFICADO CON PROMESAS)
// ============================================================
function cargarEstrategiasEdit(listaEstrategias, seleccionadas = []) {
    const container = document.getElementById('estrategias_eval');
    seleccionadas = seleccionadas.map(selecc => selecc.id)
    container.innerHTML = '';
    listaEstrategias.forEach(est => {
        const label = document.createElement('label');
        label.className = 'estrategia-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.disabled = true;
        checkbox.value = est.id;
        checkbox.checked = seleccionadas.includes(est.id);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`  ${est.nombre}`));
        container.appendChild(label);
    });
}
function cargarCarrerasEdit(callback, valorSeleccionar = null) {
    fetch(`/admin/carreras`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const carreraSelect = document.getElementById('carreraEdit');
                if (!carreraSelect) {
                    if (callback) callback();
                    return;
                }
                carreraSelect.innerHTML = '<option value="">Seleccione una carrera</option>';

                data.carreras.forEach(carrera => {
                    carreraSelect.innerHTML += `<option value="${carrera.codigo}">${carrera.nombre}</option>`;
                });

                carrerasDataEdit = data.carreras;
                
                // Si hay valor a seleccionar, asignarlo
                if (valorSeleccionar) {
                    carreraSelect.value = valorSeleccionar;
                }
                
                if (callback) callback();
            } else {
                if (callback) callback();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (callback) callback();
        });
}

function cargarSemestresEdit(carreraCode, callback, valorSeleccionar = null) {
    const semestreSelect = document.getElementById('semestreEdit');
    semestreSelect.innerHTML = '<option value="">Cargando...</option>';
    semestreSelect.disabled = true;

    fetch(`/api/admin/semestres/${carreraCode}`)
        .then(response => response.json())
        .then(semestres => {
            semestreSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
            if (semestres && semestres.length > 0) {
                semestres.forEach(sem => {
                    semestreSelect.innerHTML += `<option value="${sem}">Semestre ${sem}</option>`;
                });
                semestreSelect.disabled = false;
                
                // Si hay valor a seleccionar, asignarlo
                if (valorSeleccionar) {
                    semestreSelect.value = valorSeleccionar;
                }
            } else {
                semestreSelect.innerHTML = '<option value="">No hay semestres</option>';
            }
            if (callback) callback();
        })
        .catch(error => {
            console.error('Error:', error);
            semestreSelect.innerHTML = '<option value="">Error al cargar</option>';
            if (callback) callback();
        });
}

function cargarMateriasEdit(carreraCode, semestre, callback, valorSeleccionar = null) {
    const materiaSelect = document.getElementById('materiaEdit');
    materiaSelect.innerHTML = '<option value="">Cargando...</option>';
    materiaSelect.disabled = true;

    fetch(`/api/admin/materias/${carreraCode}/${semestre}`)
        .then(response => response.json())
        .then(materias => {
            materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';
            if (materias && materias.length > 0) {
                materias.forEach(mat => {
                    materiaSelect.innerHTML += `<option value="${mat.codigo}">${mat.nombre}</option>`;
                });
                materiaSelect.disabled = false;
                
                // Si hay valor a seleccionar, asignarlo
                if (valorSeleccionar) {
                    materiaSelect.value = valorSeleccionar;
                }
            } else {
                materiaSelect.innerHTML = '<option value="">No hay materias</option>';
            }
            if (callback) callback();
        })
        .catch(error => {
            console.error('Error:', error);
            materiaSelect.innerHTML = '<option value="">Error al cargar</option>';
            if (callback) callback();
        });
}

function cargarSeccionesEdit(materiaCode, carreraCode, callback, valorSeleccionar = null) {    
    const seccionSelect = document.getElementById('seccionEdit');
    seccionSelect.innerHTML = '<option value="">Cargando...</option>';
    seccionSelect.disabled = true;
    fetch(`/api/admin/secciones/${materiaCode}/${carreraCode}`)
        .then(response => response.json())
        .then(secciones => {
            seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
            if (secciones && secciones.length > 0) {
                secciones.forEach(sec => {
                    const info = `${sec.codigo} - ${sec.lapso_academico}${sec.horario ? ' - ' + sec.horario : ''}`;
                    seccionSelect.innerHTML += `<option value="${sec.id}">${info}</option>`;
                });
                seccionSelect.disabled = false;
                
                // Si hay valor a seleccionar, asignarlo
                if (valorSeleccionar) {
                    seccionSelect.value = valorSeleccionar;
                }
            } else {
                seccionSelect.innerHTML = '<option value="">No hay secciones</option>';
            }
            if (callback) callback();
        })
        .catch(error => {
            console.error('Error:', error);
            seccionSelect.innerHTML = '<option value="">Error al cargar</option>';
            if (callback) callback();
        });
}

// NUEVA FUNCIÓN: Cargar evaluaciones
function cargarEvaluacionesEdit(seccionId, callback, valorSeleccionar = null) {
    const evalSelect = document.getElementById('evaluacionEdit');
    if (!evalSelect) {
        if (callback) callback();
        return;
    }
    
    evalSelect.innerHTML = '<option value="">Cargando...</option>';
    evalSelect.disabled = true;

    fetch(`/admin/evaluaciones_con_rubrica/${seccionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.evaluaciones && data.evaluaciones.length > 0) {
                evalSelect.innerHTML = '<option value="">Seleccione una evaluación</option>';
                data.evaluaciones.forEach(evalu => {
                    const info = `${evalu.contenido_evaluacion} ${evalu.tipo_evaluacion ? '- ' + evalu.tipo_evaluacion : ''}`;
                    evalSelect.innerHTML += `<option value="${evalu.evaluacion_id}">${info}</option>`;
                });
                evalSelect.disabled = false;
                
                // Si hay valor a seleccionar, asignarlo
                if (valorSeleccionar) {
                    evalSelect.value = valorSeleccionar;
                }
            } else {
                evalSelect.innerHTML = '<option value="">No hay evaluaciones</option>';
                Swal.fire('Sin evaluaciones', 'No se encontraron evaluaciones sin rúbrica para esta sección.', 'info');
            }
            if (callback) callback();
        })
        .catch(error => {
            console.error('Error:', error);
            evalSelect.innerHTML = '<option value="">Error al cargar</option>';
            if (callback) callback();
        });
}
function cargarTiposRubrica(valorSeleccionar = null) {
    const tipo_r_select = document.getElementById('tipoRubrica');
    if (!tipo_r_select) {
        return;
    }
    tipo_r_select.innerHTML = '<option value="">Cargando...</option>';
    tipo_r_select.disabled = true;
    fetch(`/admin/tipos_rubrica/`)
        .then(response => response.json())
        .then(tipos_r => {
            if (tipos_r && tipos_r.length > 0) {
                tipo_r_select.innerHTML = '<option value="">Seleccione el tipo de rubrica</option>';
                tipos_r.forEach(tipo_r => {
                    const info = `${tipo_r.nombre}`;
                    tipo_r_select.innerHTML += `<option value="${tipo_r.id}">${info}</option>`;
                });
                tipo_r_select.disabled = false;
                
                // Si hay valor a seleccionar, asignarlo
                if (valorSeleccionar) {
                    tipo_r_select.value = valorSeleccionar;
                }
            } else {
                tipo_r_select.innerHTML = '<option value="">No hay tipos de rubrica</option>';
                Swal.fire('Sin tipos de rubrica', 'No se encontraron ciertos datos para el formulario, ¡vuelva  a intentarlo!', 'info');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tipo_r_select.innerHTML = '<option value="">Error al cargar</option>';
        });
}

function populateModalEdit(data) {
    const rubrica = data.rubrica;

    // Llenar campos básicos
    document.getElementById('rubricaIdEdit').value = rubrica.id;
    document.getElementById('nombreRubricaEdit').value = rubrica.nombre_rubrica;
    document.getElementById('fechaEvaluacionEdit').value = rubrica.fecha_evaluacion ? rubrica.fecha_evaluacion.split('T')[0] : '';
    document.getElementById('porcentajeEdit').value = rubrica.porcentaje_evaluacion;
    document.getElementById('docenteCreadorEdit').value = rubrica.docente_nombre || '';
    document.getElementById('competenciasEdit').value = rubrica.competencias || '';
    document.getElementById('instrumentosEdit').value = rubrica.instrumentos || '';
    document.getElementById('instruccionesEdit').value = rubrica.instrucciones || '';
    cargarTiposRubrica(rubrica.id_tipo)
    // 1. Primero cargar carreras (sin valor a seleccionar aún porque no tenemos carreraData)
    cargarCarrerasEdit(() => {
        // 2. Buscar la carrera correspondiente a la materia
        fetch(`/admin/rubricas/carrera-materia/${rubrica.materia_codigo}`)
            .then(response => response.json())
            .then(carreraData => {
                if (carreraData.success) {
                    // 3. Seleccionar la carrera
                    const carreraSelect = document.getElementById('carreraEdit');
                    carreraSelect.value = carreraData.carrera_codigo;
                    
                    // 4. Cargar semestres y seleccionar el correcto
                    cargarSemestresEdit(carreraData.carrera_codigo, () => {
                        const semestreSelect = document.getElementById('semestreEdit');
                        semestreSelect.value = carreraData.semestre;
                        
                        // 5. Cargar materias y seleccionar la correcta
                        cargarMateriasEdit(carreraData.carrera_codigo, carreraData.semestre, () => {
                            const materiaSelect = document.getElementById('materiaEdit');
                            materiaSelect.value = rubrica.materia_codigo;
                            
                            // 6. Cargar secciones y seleccionar la correcta
                            cargarSeccionesEdit(rubrica.materia_codigo, carreraData.carrera_codigo, () => {
                                const seccionSelect = document.getElementById('seccionEdit');
                                seccionSelect.value = rubrica.seccion_id;
                                
                                // 7. FINALMENTE: Cargar evaluaciones de la sección seleccionada
                                //    y seleccionar la evaluación correspondiente si existe
                                if (rubrica.evaluacion_id) {
                                    cargarEvaluacionesEdit(rubrica.seccion_id, () => {
                                        const evalSelect = document.getElementById('evaluacionEdit');
                                        evalSelect.value = rubrica.evaluacion_id;
                                    }, rubrica.evaluacion_id);
                                } else {
                                    // Si no hay evaluación asociada, cargar las disponibles sin seleccionar
                                    cargarEvaluacionesEdit(rubrica.seccion_id);
                                }
                            });
                        });
                    });
                }
            });
    });

    // Cargar criterios y niveles
    criterioCountEdit = 0;
    document.getElementById('criteriosListEdit').innerHTML = '';

    data.criterios.forEach(criterio => {
        agregarCriterioEditConDatos(
            criterio.descripcion,
            criterio.puntaje_maximo,
            criterio.orden,
            criterio.niveles
        );
    });
}

// ============================================================
// GESTIÓN DE CRITERIOS PARA EDICIÓN
// ============================================================

function agregarCriterioEdit() {
    criterioCountEdit++;
    const porcentaje = parseFloat(document.getElementById('porcentajeEdit')?.value) || 10;
    const numCriteriosActuales = document.querySelectorAll('#criteriosListEdit .criterio-card').length + 1;
    const puntajeSugerido = Math.max(1, (porcentaje / numCriteriosActuales).toFixed(2));
    
    const criterioHTML = `
        <div class="criterio-card" data-criterio="${criterioCountEdit}">
            <div class="criterio-header">
                <div class="form-group">
                    <input type="text" class="form-input criterio-descripcion" 
                        placeholder="Descripción del criterio (Ej: Análisis de datos)" required>
                </div>
                <button type="button" class="btn-icon" onclick="eliminarCriterioEdit(${criterioCountEdit})" title="Eliminar Criterio">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="criterio-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Puntaje Máximo * (mín: 1)</label>
                        <input type="number" class="form-input criterio-puntaje" 
                            min="1" step="0.01" placeholder="${puntajeSugerido}" value="${puntajeSugerido}" required>
                    </div>
                    <div class="form-group">
                        <label>Orden</label>
                        <input type="number" class="form-input criterio-orden" 
                            value="${criterioCountEdit}" min="1" required>
                    </div>
                </div>

                <div class="niveles-section">
                    <div class="niveles-header">
                        <h4><i class="fas fa-star"></i> Niveles de Desempeño</h4>
                        <button type="button" class="btn-add" onclick="agregarNivelEdit(${criterioCountEdit})">
                            <i class="fas fa-plus"></i> Agregar Nivel
                        </button>
                    </div>
                    <div class="niveles-list" id="niveles-edit-${criterioCountEdit}">
                        <!-- Niveles se agregan aquí -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('criteriosListEdit').insertAdjacentHTML('beforeend', criterioHTML);
    
    // Agregar niveles por defecto
    const puntajeMaximo = parseFloat(puntajeSugerido);
    agregarNivelEdit(criterioCountEdit, 'Sobresaliente', puntajeMaximo.toFixed(2), 1);
    agregarNivelEdit(criterioCountEdit, 'Notable', (puntajeMaximo * 0.8).toFixed(2), 2);
    agregarNivelEdit(criterioCountEdit, 'Aprobado', (puntajeMaximo * 0.6).toFixed(2), 3);
    agregarNivelEdit(criterioCountEdit, 'Insuficiente', Math.max(0.25, (puntajeMaximo * 0.4)).toFixed(2), 4);
    
    calcularDistribucionAutomaticaEdit();
}

function agregarCriterioEditConDatos(descripcion, puntaje, orden, niveles) {
    criterioCountEdit++;
    
    const criterioHTML = `
        <div class="criterio-card" data-criterio="${criterioCountEdit}">
            <div class="criterio-header">
                <div class="form-group">
                    <input type="text" class="form-input criterio-descripcion" 
                        value="${descripcion}" placeholder="Descripción del criterio" required>
                </div>
                <button type="button" class="btn-icon" onclick="eliminarCriterioEdit(${criterioCountEdit})" title="Eliminar Criterio">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="criterio-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Puntaje Máximo * (mín: 1)</label>
                        <input type="number" class="form-input criterio-puntaje" 
                            min="1" step="0.01" value="${puntaje}" required>
                    </div>
                    <div class="form-group">
                        <label>Orden</label>
                        <input type="number" class="form-input criterio-orden" 
                            value="${orden}" min="1" required>
                    </div>
                </div>

                <div class="niveles-section">
                    <div class="niveles-header">
                        <h4><i class="fas fa-star"></i> Niveles de Desempeño</h4>
                        <button type="button" class="btn-add" onclick="agregarNivelEdit(${criterioCountEdit})">
                            <i class="fas fa-plus"></i> Agregar Nivel
                        </button>
                    </div>
                    <div class="niveles-list" id="niveles-edit-${criterioCountEdit}">
                        <!-- Niveles se agregan aquí -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('criteriosListEdit').insertAdjacentHTML('beforeend', criterioHTML);
    
    // Agregar los niveles existentes
    if (niveles && niveles.length > 0) {
        niveles.forEach(nivel => {
            agregarNivelEdit(
                criterioCountEdit,
                nivel.nombre_nivel,
                nivel.puntaje,
                nivel.orden,
                nivel.descripcion
            );
        });
    }
}

function eliminarCriterioEdit(id) {
    const criterioCard = document.querySelector(`#criteriosListEdit [data-criterio="${id}"]`);
    if (!criterioCard) return;
    
    const criteriosRestantes = document.querySelectorAll('#criteriosListEdit .criterio-card').length;
    
    if (criteriosRestantes <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'No se puede eliminar',
            text: 'Debe mantener al menos un criterio de evaluación'
        });
        return;
    }
    
    Swal.fire({
        title: '¿Eliminar criterio?',
        text: 'Se eliminarán todos los niveles de este criterio y se redistribuirán los puntajes',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            criterioCard.remove();
            calcularDistribucionAutomaticaEdit();
            Swal.fire('Eliminado', 'El criterio ha sido eliminado', 'success');
        }
    });
}

// ============================================================
// GESTIÓN DE NIVELES PARA EDICIÓN
// ============================================================

function agregarNivelEdit(criterioId, nombreDefault = '', puntajeDefault = '', ordenDefault = '', descripcionDefault = '') {
    const nivelesContainer = document.getElementById(`niveles-edit-${criterioId}`);
    if (!nivelesContainer) return;
    
    const nivelCount = nivelesContainer.querySelectorAll('.nivel-item').length + 1;
    const orden = ordenDefault || nivelCount;
    const nombre = nombreDefault || '';
    const puntaje = puntajeDefault || '0.25';
    const descripcion = descripcionDefault || '';
    
    const nivelHTML = `
        <div class="nivel-item">
            <div class="nivel-header">
                <input type="text" class="form-input nivel-nombre" 
                    placeholder="Nombre del nivel" value="${nombre}" required>
                <input type="number" class="form-input small-input nivel-puntaje" 
                    placeholder="Puntaje" value="${puntaje}" min="0.25" step="0.01" required>
                <input type="number" class="form-input small-input nivel-orden" 
                    placeholder="Orden" value="${orden}" min="1" required>
                <button type="button" class="btn-icon" onclick="eliminarNivelEdit(this, ${criterioId})" title="Eliminar Nivel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <textarea class="form-textarea nivel-descripcion" rows="2" 
                    placeholder="Descripción del nivel de desempeño..." required>${descripcion}</textarea>
            </div>
        </div>
    `;
    
    nivelesContainer.insertAdjacentHTML('beforeend', nivelHTML);
    setTimeout(validarPuntajesEdit, 100);
}

function eliminarNivelEdit(button, criterioId) {
    const nivelItem = button.closest('.nivel-item');
    const nivelesContainer = document.getElementById(`niveles-edit-${criterioId}`);
    
    if (!nivelItem || !nivelesContainer) return;
    
    const nivelesRestantes = nivelesContainer.querySelectorAll('.nivel-item').length;
    
    if (nivelesRestantes <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'No se puede eliminar',
            text: 'Cada criterio debe tener al menos un nivel de desempeño'
        });
        return;
    }
    
    nivelItem.remove();
    setTimeout(validarPuntajesEdit, 100);
}

// ============================================================
// DISTRIBUCIÓN Y VALIDACIÓN PARA EDICIÓN
// ============================================================

function actualizarPuntajesNivelesEdit(criterioCard, puntajeMaximoCriterio) {
    const niveles = criterioCard.querySelectorAll('.nivel-item');
    const numNiveles = niveles.length;

    if (numNiveles === 0) return;

    // Distribuir puntaje entre niveles de manera descendente
    niveles.forEach((nivelItem, index) => {
        const puntajeInput = nivelItem.querySelector('.nivel-puntaje');
        if (puntajeInput) {
            const factorDistribucion = (numNiveles - index) / numNiveles;
            let puntaje = puntajeMaximoCriterio * factorDistribucion;
            puntaje = Math.max(0.25, Math.round(puntaje * 100) / 100);
            puntajeInput.value = puntaje.toFixed(2);
        }
    });
}

function calcularDistribucionAutomaticaEdit() {
    const porcentajeInput = document.getElementById('porcentajeEdit');
    if (!porcentajeInput) return;

    porcentajeEvaluacionEdit = parseFloat(porcentajeInput.value) || 10;

    // Validar porcentaje mínimo
    if (porcentajeEvaluacionEdit < 5) {
        porcentajeInput.value = 5;
        porcentajeEvaluacionEdit = 5;
    }

    const criterios = document.querySelectorAll('#criteriosListEdit .criterio-card');
    const numCriterios = criterios.length;

    if (numCriterios === 0) return;

    // Calcular puntaje por criterio (mínimo 1 punto)
    const puntajePorCriterio = Math.max(1, Math.floor((porcentajeEvaluacionEdit / numCriterios) * 100) / 100);

    // Actualizar puntajes de criterios
    criterios.forEach((criterioCard, index) => {
        const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
        if (puntajeInput) {
            puntajeInput.value = puntajePorCriterio.toFixed(2);
            actualizarPuntajesNivelesEdit(criterioCard, puntajePorCriterio);
        }
    });

    mostrarInfoDistribucionEdit(numCriterios, puntajePorCriterio);
    validarPuntajesEdit();
}

function mostrarInfoDistribucionEdit(numCriterios, puntajePorCriterio) {
    const infoDiv = document.getElementById('distribucionInfoEdit');
    const textoSpan = document.getElementById('distribucionTextoEdit');
    
    if (infoDiv && textoSpan) {
        const total = (numCriterios * puntajePorCriterio).toFixed(2);
        textoSpan.textContent = `Distribución automática: ${numCriterios} criterio(s) × ${puntajePorCriterio.toFixed(2)} puntos = ${total} puntos de ${porcentajeEvaluacionEdit}%`;
        infoDiv.style.display = 'block';
    }
}

function validarPuntajesEdit() {
    const porcentajeInput = document.getElementById('porcentajeEdit');
    const criterios = document.querySelectorAll('#criteriosListEdit .criterio-card');
    let sumaCriterios = 0;
    let hayError = false;

    criterios.forEach((criterioCard) => {
        const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
        const puntajeMaximo = parseFloat(puntajeInput?.value) || 0;
        
        if (puntajeMaximo < 1) {
            puntajeInput.style.borderColor = '#e74c3c';
            puntajeInput.title = 'El puntaje mínimo por criterio es 1 punto';
            hayError = true;
        } else {
            sumaCriterios += puntajeMaximo;
            puntajeInput.style.borderColor = '#e0e0e0';
            puntajeInput.title = '';
        }

        const niveles = criterioCard.querySelectorAll('.nivel-item');
        niveles.forEach(nivelItem => {
            const puntajeNivelInput = nivelItem.querySelector('.nivel-puntaje');
            const puntajeNivel = parseFloat(puntajeNivelInput?.value) || 0;

            if (puntajeNivel < 0.25) {
                puntajeNivelInput.style.borderColor = '#e74c3c';
                puntajeNivelInput.title = 'El puntaje mínimo por nivel es 0.25';
                hayError = true;
            } else if (puntajeNivel > puntajeMaximo) {
                puntajeNivelInput.style.borderColor = '#e74c3c';
                puntajeNivelInput.title = `El puntaje del nivel no puede exceder ${puntajeMaximo}`;
                hayError = true;
            } else {
                puntajeNivelInput.style.borderColor = '#e0e0e0';
                puntajeNivelInput.title = '';
            }
        });
    });

    if (porcentajeInput) {
        const porcentaje = parseFloat(porcentajeInput.value) || 0;
        
        if (porcentaje < 5) {
            porcentajeInput.style.borderColor = '#e74c3c';
            porcentajeInput.title = 'El porcentaje mínimo es 5%';
            hayError = true;
        } else if (sumaCriterios > porcentaje) {
            porcentajeInput.style.borderColor = '#e74c3c';
            porcentajeInput.title = `La suma de puntajes (${sumaCriterios.toFixed(2)}) excede el porcentaje (${porcentaje})`;
            hayError = true;
        } else {
            porcentajeInput.style.borderColor = '#e0e0e0';
            porcentajeInput.title = '';
        }
    }

    return !hayError;
}

// ============================================================
// ENVÍO DEL FORMULARIO DE EDICIÓN
// ============================================================

const rubricaFormEdit = document.getElementById('rubricaFormEdit');
if (rubricaFormEdit) {
    rubricaFormEdit.addEventListener('submit', async function(e) {
        e.preventDefault();

        // ============================================================
        // VALIDACIONES DEL FRONTEND (rápidas)
        // ============================================================
        
        const id = document.getElementById('rubricaIdEdit')?.value;
        const nombreRubrica = document.getElementById('nombreRubricaEdit')?.value.trim();
        const tipoRubrica = document.getElementById('tipoRubrica')?.value; // Mismo ID que en creación
        const instrucciones = document.getElementById('instruccionesEdit')?.value.trim();
        const idEval = document.getElementById('evaluacionEdit')?.value;
        const porcentaje = parseFloat(document.getElementById('porcentajeEdit')?.value);

        // Resetear bordes rojos
        document.querySelectorAll('.error-border').forEach(el => {
            el.classList.remove('error-border');
        });

        if (!id) {
            Swal.fire('Error', 'ID de rúbrica no encontrado', 'error');
            return;
        }

        if (!nombreRubrica) {
            Swal.fire('Error', 'El nombre de la rúbrica es obligatorio', 'error');
            document.getElementById('nombreRubricaEdit').classList.add('error-border');
            return;
        }

        if (!tipoRubrica) {
            Swal.fire('Error', 'Debe seleccionar un tipo de Rúbrica', 'error');
            document.getElementById('tipoRubrica').classList.add('error-border');
            return;
        }

        if (!instrucciones) {
            Swal.fire('Error', 'Las instrucciones son obligatorias', 'error');
            document.getElementById('instruccionesEdit').classList.add('error-border');
            return;
        }

        if (!idEval) {
            Swal.fire('Error', 'Debe seleccionar una evaluación', 'error');
            document.getElementById('evaluacionEdit').classList.add('error-border');
            return;
        }
        
        // Validar que haya al menos un criterio
        const criterios = document.querySelectorAll('#criteriosListEdit .criterio-card');
        if(criterios.length === 0) {
            Swal.fire('Error', 'Debe agregar al menos un criterio de evaluación', 'error');
            return;
        }
        
        // ============================================================
        // RECOPILAR DATOS DE LA RÚBRICA
        // ============================================================
        const rubricaData = {
            id: id,
            nombre_rubrica: nombreRubrica,
            id_evaluacion: idEval,
            tipo_rubrica: tipoRubrica,
            instrucciones: instrucciones,
            porcentaje: porcentaje,
            criterios: [],
            estrategias: [] // Para los checkboxes
        };
        
        // Recopilar criterios y niveles
        criterios.forEach((criterioCard) => {
            const descripcionInput = criterioCard.querySelector('.criterio-descripcion');
            const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
            const ordenInput = criterioCard.querySelector('.criterio-orden');
            
            const criterio = {
                descripcion: descripcionInput?.value.trim() || '',
                puntaje_maximo: parseFloat(puntajeInput?.value) || 0,
                orden: parseInt(ordenInput?.value) || 0,
                niveles: []
            };
            
            const niveles = criterioCard.querySelectorAll('.nivel-item');
            niveles.forEach(nivelItem => {
                const nombreInput = nivelItem.querySelector('.nivel-nombre');
                const descripcionInput = nivelItem.querySelector('.nivel-descripcion');
                const puntajeInput = nivelItem.querySelector('.nivel-puntaje');
                const ordenInput = nivelItem.querySelector('.nivel-orden');
                
                const nivel = {
                    nombre_nivel: nombreInput?.value.trim() || '',
                    descripcion: descripcionInput?.value.trim() || '',
                    puntaje: parseFloat(puntajeInput?.value) || 0,
                    orden: parseInt(ordenInput?.value) || 0
                };
                criterio.niveles.push(nivel);
            });
            
            rubricaData.criterios.push(criterio);
        });

        // Recopilar estrategias seleccionadas (checkboxes)
        const checkboxes = document.querySelectorAll('#estrategias_eval input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            rubricaData.estrategias.push(cb.value);
        });
        
        // ============================================================
        // VALIDACIONES DE CONSISTENCIA (mismas que en creación)
        // ============================================================
        let sumaPuntajes = 0;
        for (let i = 0; i < rubricaData.criterios.length; i++) {
            const criterio = rubricaData.criterios[i];
            
            if (!criterio.descripcion) {
                Swal.fire('Error', `El criterio ${i + 1} necesita descripción`, 'error');
                return;
            }
            
            if (criterio.puntaje_maximo < 0.1) {
                Swal.fire('Error', `El criterio ${i + 1} necesita un puntaje mínimo de 0.1 puntos`, 'error');
                return;
            }
            
            sumaPuntajes += criterio.puntaje_maximo;

            if (!criterio.niveles || criterio.niveles.length === 0) {
                Swal.fire('Error', `El criterio ${i + 1} necesita al menos un nivel`, 'error');
                return;
            }
            
            for (let j = 0; j < criterio.niveles.length; j++) {
                const nivel = criterio.niveles[j];
                
                if (!nivel.nombre_nivel) {
                    Swal.fire('Error', `El nivel ${j + 1} del criterio ${i + 1} necesita nombre`, 'error');
                    return;
                }
                
                if (!nivel.descripcion) {
                    Swal.fire('Error', `El nivel "${nivel.nombre_nivel}" necesita descripción`, 'error');
                    return;
                }
                
                if (nivel.puntaje < 0.025) {
                    Swal.fire('Error', `El nivel "${nivel.nombre_nivel}" necesita un puntaje mínimo de 0.925`, 'error');
                    return;
                }
                
                if (nivel.puntaje > criterio.puntaje_maximo) {
                    Swal.fire('Error', `El puntaje del nivel "${nivel.nombre_nivel}" excede el máximo del criterio`, 'error');
                    return;
                }
            }
        }

        // Validar suma de puntajes EXACTAMENTE IGUAL al porcentaje
        if (Math.abs(sumaPuntajes - porcentaje) > 0.01) {
            Swal.fire('Error', 
                `La suma de puntajes (${sumaPuntajes.toFixed(2)}) debe ser EXACTAMENTE IGUAL al porcentaje de evaluación (${porcentaje}%)`, 
                'error');
            return;
        }
        
        // ============================================================
        // MOSTRAR LOADING
        // ============================================================
        Swal.fire({
            title: 'Actualizando rúbrica...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // ============================================================
        // PREPARAR DATOS PARA ENVIAR (mismo formato que creación)
        // ============================================================
        const datosParaEnviar = {
            id: rubricaData.id,
            nombre_rubrica: rubricaData.nombre_rubrica,
            id_evaluacion: rubricaData.id_evaluacion,
            tipo_rubrica: rubricaData.tipo_rubrica,
            instrucciones: rubricaData.instrucciones,
            porcentaje: rubricaData.porcentaje,
            criterios: JSON.stringify(rubricaData.criterios), // igual que en creación
            estrategias: rubricaData.estrategias // array de IDs
        };
        
        try {
            // ============================================================
            // ENVÍO CON FETCH (cambia la URL por tu endpoint de actualización)
            // ============================================================
            const response = await fetch(`/rubrica/actualizar/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosParaEnviar)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizada!',
                    html: `
                        ${result.mensaje || 'Rúbrica actualizada correctamente'}<br>
                        <small>Criterios: ${result.datos?.criterios || rubricaData.criterios.length} | Puntaje total: ${result.datos?.sumaPuntajes || sumaPuntajes.toFixed(2)}/${porcentaje}</small>
                    `
                }).then(() => {
                    window.location.href = '/teacher/rubricas'; // Redirige a la lista
                });
            } else {
                // Error controlado del servidor
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.mensaje || 'No se pudo actualizar la rúbrica'
                });
                
                // Resaltar campo específico si viene en la respuesta
                if (result.campo) {
                    const elemento = document.querySelector(`[name="${result.campo}"], #${result.campo}`);
                    if (elemento) {
                        elemento.classList.add('error-border');
                        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Verifique su conexión.'
            });
        }
    });
}

// ============================================================
// RESETEAR MODAL
// ============================================================

function resetModalEdit() {
    const form = document.getElementById('rubricaFormEdit');
    if (form) form.reset();
    
    document.getElementById('rubricaIdEdit').value = '';
    document.getElementById('criteriosListEdit').innerHTML = '';
    
    criterioCountEdit = 0;
    porcentajeEvaluacionEdit = 10;
    
    // Resetear selects
    document.getElementById('semestreEdit').disabled = true;
    document.getElementById('materiaEdit').disabled = true;
    document.getElementById('seccionEdit').disabled = true;
    
    const distribucionInfo = document.getElementById('distribucionInfoEdit');
    if (distribucionInfo) {
        distribucionInfo.style.display = 'none';
    }
}

// ============================================================
// ELIMINAR RÚBRICA
// ============================================================

function eliminarRubrica(id) {
    Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción eliminará permanentemente la rúbrica, sus criterios y niveles de desempeño. No se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Eliminando rúbrica...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Realizar la petición DELETE
            fetch(`/admin/deleteRubrica/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminada!',
                        text: data.message || 'La rúbrica ha sido eliminada correctamente',
                        confirmButtonColor: '#3085d6'
                    }).then(() => {
                        // Recargar la página para actualizar la lista
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'No se pudo eliminar la rúbrica'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar la rúbrica'
                });
            });
        }
    });
}

// ============================================================
// EVENT LISTENERS PARA CASCADA DE SELECTS
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Cargar estrategias globalmente
    estrategias_eval = await cargarEstrategias();
    
    const carreraEditSelect = document.getElementById('carreraEdit');
    const semestreEditSelect = document.getElementById('semestreEdit');
    const materiaEditSelect = document.getElementById('materiaEdit');
    const seccionEditSelect = document.getElementById('seccionEdit');
    const evalEditSelect = document.getElementById('evaluacionEdit');
    const fechaInputEdit = document.getElementById('fechaEvaluacionEdit');
    const porcentajeInputEdit = document.getElementById('porcentajeEdit');
    const competenciasTextAreaEdit = document.getElementById('competenciasEdit');
    const instrumentosTextAreaEdit = document.getElementById('instrumentosEdit');

    // Función para limpiar todos los campos de evaluación y actualizar checkboxes
function limpiarCamposEvaluacion(estrategiasSeleccionadas = []) {
    fechaInputEdit.value = '';
    porcentajeInputEdit.value = '';
    competenciasTextAreaEdit.value = '';
    instrumentosTextAreaEdit.value = '';
    
    // Restaurar placeholders
    fechaInputEdit.placeholder = 'dd/mm/aaaa';
    porcentajeInputEdit.placeholder = 'Mínimo 5%';
    
    // ACTUALIZAR CHECKBOXES CON LAS ESTRATEGIAS SELECCIONADAS
    if (estrategias_eval) {
        cargarEstrategiasEdit(estrategias_eval, estrategiasSeleccionadas);
    }
}

    // Función para resetear selects dependientes (excepto el actual)
    function resetearSelects(hasta) {
        if (hasta <= 1) { // carrera
            semestreEditSelect.innerHTML = '<option value="">Primero seleccione una carrera</option>';
            materiaEditSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
            seccionEditSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
            evalEditSelect.innerHTML = '<option value="">Primero seleccione una sección</option>';
            semestreEditSelect.disabled = true;
            materiaEditSelect.disabled = true;
            seccionEditSelect.disabled = true;
            evalEditSelect.disabled = true;
        }
        if (hasta <= 2) { // semestre
            materiaEditSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
            seccionEditSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
            evalEditSelect.innerHTML = '<option value="">Primero seleccione una sección</option>';
            materiaEditSelect.disabled = true;
            seccionEditSelect.disabled = true;
            evalEditSelect.disabled = true;
        }
        if (hasta <= 3) { // materia
            seccionEditSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
            evalEditSelect.innerHTML = '<option value="">Primero seleccione una sección</option>';
            seccionEditSelect.disabled = true;
            evalEditSelect.disabled = true;
        }
        if (hasta <= 4) { // sección
            evalEditSelect.innerHTML = '<option value="">Primero seleccione una sección</option>';
            evalEditSelect.disabled = true;
        }
    }

    // Cuando cambia la carrera
    if (carreraEditSelect) {
        carreraEditSelect.addEventListener('change', async function() {
            const carreraCode = this.value;
            
            // Resetear selects dependientes (carrera afecta a todos los siguientes)
            resetearSelects(1);
            // Limpiar campos de evaluación
            limpiarCamposEvaluacion();

            if (!carreraCode) {
                semestreEditSelect.innerHTML = '<option value="">Primero seleccione una carrera</option>';
                return;
            }

            try {
                const response = await fetch(`/api/semestres/${carreraCode}`);
                const semestres = await response.json();
                
                semestreEditSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
                if (semestres && semestres.length > 0) {
                    semestres.forEach(sem => {
                        semestreEditSelect.innerHTML += `<option value="${sem}">Semestre ${sem}</option>`;
                    });
                    semestreEditSelect.disabled = false;
                } else {
                    semestreEditSelect.innerHTML = '<option value="">No hay semestres disponibles</option>';
                }
            } catch (error) {
                console.error('Error:', error);
                semestreEditSelect.innerHTML = '<option value="">Error al cargar semestres</option>';
                Swal.fire('Error', 'No se pudieron cargar los semestres', 'error');
            }
        });
    }

    // Cuando cambia el semestre
    if (semestreEditSelect) {
        semestreEditSelect.addEventListener('change', async function() {
            const carreraCode = carreraEditSelect.value;
            const semestre = this.value;
            
            // Resetear selects dependientes (semestre afecta a materia, sección, evaluación)
            resetearSelects(2);
            // Limpiar campos de evaluación
            limpiarCamposEvaluacion();

            if (!semestre) {
                materiaEditSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
                return;
            }

            try {
                const response = await fetch(`/api/materias/${carreraCode}/${semestre}`);
                const materias = await response.json();
                
                materiaEditSelect.innerHTML = '<option value="">Seleccione una materia</option>';
                if (materias && materias.length > 0) {
                    materias.forEach(mat => {
                        materiaEditSelect.innerHTML += `<option value="${mat.codigo}">${mat.nombre}</option>`;
                    });
                    materiaEditSelect.disabled = false;
                } else {
                    materiaEditSelect.innerHTML = '<option value="">No hay materias disponibles</option>';
                }
            } catch (error) {
                console.error('Error:', error);
                materiaEditSelect.innerHTML = '<option value="">Error al cargar materias</option>';
                Swal.fire('Error', 'No se pudieron cargar las materias', 'error');
            }
        });
    }

    // Cuando cambia la materia
    if (materiaEditSelect) {
        materiaEditSelect.addEventListener('change', async function() {
            const materiaCode = this.value;
            
            // Resetear selects dependientes (materia afecta a sección y evaluación)
            resetearSelects(3);
            // Limpiar campos de evaluación
            limpiarCamposEvaluacion();

            if (!materiaCode) {
                seccionEditSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
                return;
            }

            try {
                const response = await fetch(`/api/secciones/${materiaCode}/${carreraEditSelect.value}`);
                const secciones = await response.json();
                
                seccionEditSelect.innerHTML = '<option value="">Seleccione una sección</option>';
                if (secciones && secciones.length > 0) {
                    secciones.forEach(sec => {
                        const info = `${sec.codigo} - ${sec.lapso_academico}${sec.horario ? ' - ' + sec.horario : ''}`;
                        seccionEditSelect.innerHTML += `<option value="${sec.id}">${info}</option>`;
                    });
                    seccionEditSelect.disabled = false;
                } else {
                    seccionEditSelect.innerHTML = '<option value="">No hay secciones disponibles</option>';
                }
            } catch (error) {
                console.error('Error:', error);
                seccionEditSelect.innerHTML = '<option value="">Error al cargar secciones</option>';
                Swal.fire('Error', 'No se pudieron cargar las secciones', 'error');
            }
        });
    }

    // Cuando cambia la sección
if (seccionEditSelect) {
    seccionEditSelect.addEventListener('change', async function() {
        const seccionId = this.value;
        
        // Resetear select de evaluación
        resetearSelects(4);
        // Limpiar campos de evaluación y checkboxes (sin estrategias seleccionadas)
        limpiarCamposEvaluacion([]); // Pasamos array vacío porque no hay evaluación seleccionada

        if (!seccionId) {
            evalEditSelect.innerHTML = '<option value="">Primero seleccione una sección</option>';
            return;
        }

        try {
            const response = await fetch(`/admin/evaluaciones_con_rubrica/${seccionId}`);
            const data = await response.json();
            
            if (data.evaluaciones && data.evaluaciones.length > 0) {
                evalEditSelect.innerHTML = '<option value="">Seleccione una evaluación</option>';
                data.evaluaciones.forEach(evalu => {
                    const info = `${evalu.contenido_evaluacion} ${evalu.tipo_evaluacion ? '- ' + evalu.tipo_evaluacion : ''}`;
                    evalEditSelect.innerHTML += `<option value="${evalu.evaluacion_id}">${info}</option>`;
                });
                evalEditSelect.disabled = false;
            } else {
                evalEditSelect.innerHTML = '<option value="">No hay evaluaciones disponibles</option>';
                Swal.fire('Sin evaluaciones', 'No se encontraron evaluaciones para esta sección.', 'info');
            }
        } catch (error) {
            console.error('Error:', error);
            evalEditSelect.innerHTML = '<option value="">Error al cargar evaluaciones</option>';
            Swal.fire('Error', 'No se pudieron cargar las evaluaciones', 'error');
        }
    });
}

// Cuando cambia la evaluación
if (evalEditSelect) {
    evalEditSelect.addEventListener('change', async function() {
        const evalId = this.value;
        
        // Si no hay evaluación seleccionada, limpiar campos y checkboxes
        if (!evalId) {
            limpiarCamposEvaluacion([]); // Pasamos array vacío para limpiar checkboxes
            return;
        }

        // Mostrar carga
        fechaInputEdit.value = '';
        porcentajeInputEdit.value = '';
        competenciasTextAreaEdit.value = 'Cargando...';
        instrumentosTextAreaEdit.value = 'Cargando...';
        fechaInputEdit.placeholder = 'Cargando...';
        porcentajeInputEdit.placeholder = 'Cargando...';

        try {
            const response = await fetch(`/api/evaluacion/${evalId}`);
            const data = await response.json();

            if (data.evaluacion) {
                fechaInputEdit.value = formatearFechaParaInput(new Date(data.evaluacion.fecha_evaluacion));
                porcentajeInputEdit.value = data.evaluacion.porcentaje;
                competenciasTextAreaEdit.value = data.evaluacion.competencias || '';
                instrumentosTextAreaEdit.value = data.evaluacion.instrumentos || '';
                
                // Restaurar placeholders
                fechaInputEdit.placeholder = 'dd/mm/aaaa';
                porcentajeInputEdit.placeholder = 'Mínimo 5%';
                
                // ACTUALIZAR CHECKBOXES CON LAS ESTRATEGIAS DE LA EVALUACIÓN SELECCIONADA
                if (estrategias_eval) {
                    cargarEstrategiasEdit(estrategias_eval, data.evaluacion.estrategias || []);
                }
                
                // Recalcular distribución
                if (typeof calcularDistribucionAutomaticaEdit === 'function') {
                    calcularDistribucionAutomaticaEdit();
                }
            } else {
                Swal.fire('Error', 'No se pudo cargar la evaluación', 'error');
                limpiarCamposEvaluacion([]); // Pasamos array vacío
            }
        } catch (error) {
            console.error('Error al cargar evaluación:', error);
            Swal.fire('Error', 'No se pudo cargar la evaluación', 'error');
            limpiarCamposEvaluacion([]); // Pasamos array vacío
        }
    });
}

    // Listener para calcular distribución al cambiar porcentaje
    if (porcentajeInputEdit) {
        porcentajeInputEdit.addEventListener('input', calcularDistribucionAutomaticaEdit);
    }

    // Inicializar paginación y cargar datos
    try {
        initializePagination();
    } catch (error) {
        console.error('Error en inicialización:', error);
    }
});
