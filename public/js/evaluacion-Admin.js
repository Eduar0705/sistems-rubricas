// Variables globales
let estudiantesSeleccionados = [];

// Variables para paginación
let currentPage = 1;
let entriesPerPage = 5;
let allRows = [];

// Aplicar clases de estado cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    const estadoElements = document.querySelectorAll('.estado');

    estadoElements.forEach(element => {
        const estadoTexto = element.textContent.trim();
        const claseEstado = 'estado-' + estadoTexto.replace(/ /g, '-');
        element.classList.add(claseEstado);
    });
});

// Función para filtrar evaluaciones (para tabla)
function filtrarEvaluaciones() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const docenteFilter = document.getElementById('filterDocente')?.value || '';
    const estadoFilter = document.getElementById('filterEstado')?.value || '';
    
    // Filtrar allRows en lugar de las filas del DOM
    const filteredRows = allRows.filter(row => {
        // Obtener texto de todas las celdas
        const rowText = row.textContent.toLowerCase();
        const docenteAttr = row.dataset.docente || '';
        
        // Filtrado de búsqueda
        const matchSearch = !searchTerm || rowText.includes(searchTerm);
        
        // Filtro por docente
        const matchDocente = !docenteFilter || docenteAttr === docenteFilter;
        
        // Filtro por estado
        let matchEstado = true;
        if (estadoFilter) {
            const estadoCell = row.cells[7]?.textContent || ''; // Columna de estado
            if (estadoFilter === 'Completada') {
                matchEstado = estadoCell.includes('Completada') || estadoCell === 'Completada';
            } else if (estadoFilter === 'Pendiente') {
                matchEstado = estadoCell === 'Pendiente';
            } else if (estadoFilter === 'En Progreso') {
                matchEstado = estadoCell.includes('/') && !estadoCell.includes('Completada') && estadoCell !== 'Pendiente';
            }
        }

        return matchSearch && matchDocente && matchEstado;
    });
    
    // Actualizar allRows con las filas filtradas
    allRows = filteredRows;
    currentPage = 1;
    updateTable();
}

// Event listeners para los filtros
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchInput')?.addEventListener('input', () => {
        // Resetear allRows antes de filtrar
        allRows = Array.from(document.querySelectorAll('.evaluacion-row'));
        filtrarEvaluaciones();
    });
    document.getElementById('filterDocente')?.addEventListener('change', () => {
        allRows = Array.from(document.querySelectorAll('.evaluacion-row'));
        filtrarEvaluaciones();
    });
    document.getElementById('filterEstado')?.addEventListener('change', () => {
        allRows = Array.from(document.querySelectorAll('.evaluacion-row'));
        filtrarEvaluaciones();
    });
    
    // Inicializar paginación
    inicializarPaginacion();
});

// Funciones para los botones
function verDetalles(evaluacionId) {
    openModalDetalles(evaluacionId);
}

function evaluar(evaluacionId) {
    window.location.href = `/admin/evaluar/${evaluacionId}`;
}

// Funciones del modal
function openModalEvaluacion() {
    document.getElementById('modalAddEvaluacion').classList.add('active');
    document.body.style.overflow = 'hidden';
    cargarRubricas();
    cargarCarreras();
}

function closeModalEvaluacion() {
    document.getElementById('modalAddEvaluacion').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('formAddEvaluacion').reset();
    document.getElementById('rubricaInfo').style.display = 'none';
    document.getElementById('materia_codigo').disabled = true;
    document.getElementById('seccion_id').disabled = true;
    document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione carrera, materia y sección para cargar estudiantes</div>';
    document.getElementById('btnGuardarEvaluacion').disabled = true;
    estudiantesSeleccionados = [];
}

// Cargar rúbricas disponibles
async function cargarRubricas() {
    try {
        const response = await fetch('/api/rubricas/activas');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('rubrica_id');
            select.innerHTML = '<option value="">Seleccione una rúbrica</option>';
            
            data.rubricas.forEach(rubrica => {
                const option = document.createElement('option');
                option.value = rubrica.id;
                option.textContent = `${rubrica.nombre_rubrica} - ${rubrica.materia_nombre}`;
                option.dataset.rubrica = JSON.stringify(rubrica);
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar rúbricas:', error);
        Swal.fire('Error', 'No se pudieron cargar las rúbricas', 'error');
    }
}

// Cargar carreras
async function cargarCarreras() {
    try {
        const response = await fetch('/api/carreras');
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('carrera_codigo');
            select.innerHTML = '<option value="">Seleccione una carrera</option>';
            
            data.carreras.forEach(carrera => {
                const option = document.createElement('option');
                option.value = carrera.codigo;
                option.textContent = carrera.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar carreras:', error);
        Swal.fire('Error', 'No se pudieron cargar las carreras', 'error');
    }
}

// Evento cuando se selecciona una rúbrica
document.getElementById('rubrica_id')?.addEventListener('change', async function() {
    const selectedOption = this.options[this.selectedIndex];
    
    if (selectedOption.value) {
        const rubrica = JSON.parse(selectedOption.dataset.rubrica);
        mostrarInfoRubrica(rubrica);
        await aplicarDatosRubricaEnFormulario(rubrica);
    } else {
        document.getElementById('rubricaInfo').style.display = 'none';
    }
    verificarFormularioCompleto();
});

// Mostrar información de la rúbrica seleccionada
function mostrarInfoRubrica(rubrica) {
    document.getElementById('rubricaCarrera').textContent = rubrica.carrera_nombre || '-';

    const carreraCodigoEl = document.getElementById('rubricaCarreraCodigo');
    if (carreraCodigoEl) {
        carreraCodigoEl.textContent = rubrica.carrera_codigo || '-';
    }

    document.getElementById('rubricaSemestre').textContent = rubrica.semestre ? `Semestre ${rubrica.semestre}` : '-';
    document.getElementById('rubricaMateria').textContent = rubrica.materia_nombre || '-';

    const materiaCodigoEl = document.getElementById('rubricaMateriaCodigo');
    if (materiaCodigoEl) {
        materiaCodigoEl.textContent = rubrica.materia_codigo || '-';
    }

    document.getElementById('rubricaSeccion').textContent = rubrica.seccion_codigo || '-';

    const lapsoEl = document.getElementById('rubricaLapso');
    if (lapsoEl) {
        lapsoEl.textContent = rubrica.seccion_lapso || '-';
    }

    const docenteEl = document.getElementById('rubricaDocente');
    if (docenteEl) {
        if (rubrica.docente_nombre) {
            const apellido = rubrica.docente_apellido ? ` ${rubrica.docente_apellido}` : '';
            docenteEl.textContent = `${rubrica.docente_nombre}${apellido}`;
        } else {
            docenteEl.textContent = '-';
        }
    }

    document.getElementById('rubricaTipo').textContent = rubrica.tipo_evaluacion;
    document.getElementById('rubricaPorcentaje').textContent = rubrica.porcentaje_evaluacion + '%';
    document.getElementById('rubricaModalidad').textContent = rubrica.modalidad + 
        (rubrica.cantidad_personas > 1 ? ` (${rubrica.cantidad_personas} personas)` : '');
    document.getElementById('rubricaInfo').style.display = 'block';
}

// Sincronizar selects de carrera/materia/sección a partir de la rúbrica seleccionada
async function aplicarDatosRubricaEnFormulario(rubrica) {
    const carreraSelect = document.getElementById('carrera_codigo');
    const materiaSelect = document.getElementById('materia_codigo');
    const seccionSelect = document.getElementById('seccion_id');

    if (!carreraSelect || !materiaSelect || !seccionSelect) {
        return;
    }

    try {
        // Nos aseguramos de tener las carreras cargadas
        await cargarCarreras();

        if (rubrica.carrera_codigo) {
            carreraSelect.value = rubrica.carrera_codigo;
        }

        if (rubrica.carrera_codigo) {
            materiaSelect.disabled = false;
            await cargarMaterias(rubrica.carrera_codigo);
            if (rubrica.materia_codigo) {
                materiaSelect.value = rubrica.materia_codigo;
            }
        }

        if (rubrica.materia_codigo) {
            seccionSelect.disabled = false;
            await cargarSecciones(rubrica.materia_codigo);
            if (rubrica.seccion_id) {
                seccionSelect.value = rubrica.seccion_id;
            }
        }

        // Si ya tenemos sección seleccionada, cargamos los estudiantes asociados
        if (seccionSelect.value) {
            await cargarEstudiantes(seccionSelect.value);
        }
    } catch (error) {
        console.error('Error al aplicar datos de la rúbrica en el formulario:', error);
    }
}

// Evento cuando se selecciona una carrera
document.getElementById('carrera_codigo')?.addEventListener('change', async function() {
    const carreraCodigo = this.value;
    const materiaSelect = document.getElementById('materia_codigo');
    const seccionSelect = document.getElementById('seccion_id');
    
    if (carreraCodigo) {
        materiaSelect.disabled = false;
        await cargarMaterias(carreraCodigo);
        
        // Reset materia y sección
        materiaSelect.value = '';
        seccionSelect.disabled = true;
        seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
        document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione materia y sección para cargar estudiantes</div>';
    } else {
        materiaSelect.disabled = true;
        materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';
        seccionSelect.disabled = true;
        seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
        document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione carrera, materia y sección para cargar estudiantes</div>';
    }
    verificarFormularioCompleto();
});

// Cargar materias por carrera
async function cargarMaterias(carreraCodigo) {
    try {
        const response = await fetch(`/api/carrera/${carreraCodigo}/materias`);
        const data = await response.json();
        
        const select = document.getElementById('materia_codigo');
        select.innerHTML = '<option value="">Seleccione una materia</option>';
        
        if (data.success && data.materias.length > 0) {
            data.materias.forEach(materia => {
                const option = document.createElement('option');
                option.value = materia.codigo;
                option.textContent = `${materia.nombre} (Semestre ${materia.semestre})`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No hay materias disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar materias:', error);
        Swal.fire('Error', 'No se pudieron cargar las materias', 'error');
    }
}

// Evento cuando se selecciona una materia
document.getElementById('materia_codigo')?.addEventListener('change', async function() {
    const materiaCodigo = this.value;
    const seccionSelect = document.getElementById('seccion_id');
    
    if (materiaCodigo) {
        seccionSelect.disabled = false;
        await cargarSecciones(materiaCodigo);
    } else {
        seccionSelect.disabled = true;
        seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
        document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione una sección para cargar estudiantes</div>';
    }
    verificarFormularioCompleto();
});

// Cargar secciones por materia
async function cargarSecciones(materiaCodigo) {
    try {
        const response = await fetch(`/api/materia/${materiaCodigo}/secciones`);
        const data = await response.json();
        
        const select = document.getElementById('seccion_id');
        select.innerHTML = '<option value="">Seleccione una sección</option>';
        
        if (data.success && data.secciones.length > 0) {
            data.secciones.forEach(seccion => {
                const option = document.createElement('option');
                option.value = seccion.id;
                option.textContent = `Sección ${seccion.codigo} - ${seccion.horario} (${seccion.aula})`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No hay secciones disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar secciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las secciones', 'error');
    }
}

// Evento cuando se selecciona una sección
document.getElementById('seccion_id')?.addEventListener('change', async function() {
    const seccionId = this.value;
    
    if (seccionId) {
        await cargarEstudiantes(seccionId);
    } else {
        document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione una sección para cargar estudiantes</div>';
    }
    verificarFormularioCompleto();
});

// Cargar estudiantes de la sección
async function cargarEstudiantes(seccionId) {
    document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-spinner fa-spin"></i> Cargando estudiantes...</div>';
    
    try {
        const response = await fetch(`/api/seccion/${seccionId}/estudiantes`);
        const data = await response.json();
        
        if (data.success && data.estudiantes.length > 0) {
            estudiantesSeleccionados = data.estudiantes.map(e => e.cedula);
            mostrarEstudiantes(data.estudiantes);
        } else {
            document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-exclamation-circle"></i> No hay estudiantes inscritos en esta sección</div>';
            estudiantesSeleccionados = [];
        }
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-exclamation-triangle"></i> Error al cargar estudiantes</div>';
        estudiantesSeleccionados = [];
    }
    verificarFormularioCompleto();
}

// Mostrar lista de estudiantes
function mostrarEstudiantes(estudiantes) {
    const container = document.getElementById('estudiantesPreview');
    
    let html = `
        <div class="estudiantes-header">
            <i class="fas fa-users"></i>
            <span>Se crearán evaluaciones para <strong>${estudiantes.length}</strong> estudiante(s)</span>
        </div>
        <div class="estudiantes-list-preview">
    `;

    estudiantes.forEach(estudiante => {
        const iniciales = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
        html += `
            <div class="estudiante-preview-item">
                <div class="estudiante-avatar-small">${iniciales}</div>
                <div class="estudiante-info-preview">
                    <div class="estudiante-nombre-preview">${estudiante.nombre} ${estudiante.apellido}</div>
                    <div class="estudiante-cedula-preview">CI: ${estudiante.cedula}</div>
                </div>
                <i class="fas fa-check-circle estudiante-check"></i>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Verificar si el formulario está completo
function verificarFormularioCompleto() {
    const rubricaId = document.getElementById('rubrica_id').value;
    const btnGuardar = document.getElementById('btnGuardarEvaluacion');
    
    if (rubricaId && estudiantesSeleccionados.length > 0) {
        btnGuardar.disabled = false;
    } else {
        btnGuardar.disabled = true;
    }
}

// Guardar evaluación
async function guardarEvaluacion() {
    const rubricaId = document.getElementById('rubrica_id').value;
    const observaciones = document.getElementById('observaciones').value;

    // Validaciones
    if (!rubricaId) {
        Swal.fire('Error', 'Debe seleccionar una rúbrica', 'error');
        return;
    }

    if (estudiantesSeleccionados.length === 0) {
        Swal.fire('Error', 'No hay estudiantes seleccionados', 'error');
        return;
    }

    // Confirmar creación
    const result = await Swal.fire({
        title: '¿Crear evaluaciones?',
        html: `Se crearán <strong>${estudiantesSeleccionados.length}</strong> evaluación(es) para los estudiantes de la sección seleccionada`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#667eea'
    });

    if (!result.isConfirmed) return;

    // Mostrar loading
    Swal.fire({
        title: 'Creando evaluaciones...',
        html: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('/api/evaluaciones/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rubrica_id: rubricaId,
                estudiantes: estudiantesSeleccionados,
                observaciones: observaciones
            })
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Evaluaciones creadas!',
                html: `Se crearon <strong>${data.cantidad}</strong> evaluación(es) correctamente`,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#667eea'
            }).then(() => {
                closeModalEvaluacion();
                location.reload();
            });
        } else {
            Swal.fire('Error', data.message || 'No se pudieron crear las evaluaciones', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Ocurrió un error al crear las evaluaciones', 'error');
    }
}

// Cerrar modal con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('modalAddEvaluacion');
        if (modal && modal.classList.contains('active')) {
            closeModalEvaluacion();
        }
    }
});

// Cerrar modal al hacer clic fuera
document.getElementById('modalAddEvaluacion')?.addEventListener('click', function(event) {
    if (event.target === this) {
        closeModalEvaluacion();
    }
});

// Funciones del modal de detalles
async function openModalDetalles(evaluacionId) {
    const modal = document.getElementById('modalVerDetalles');
    const modalBody = modal.querySelector('.modal-body-detalles');

    // Mostrar loading
    modalBody.innerHTML = `
        <div class="loading-detalles">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Cargando detalles...</h3>
            <p>Por favor espere</p>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(`/api/evaluacion/${evaluacionId}/detalles`);
        const data = await response.json();

        if (data.success) {
            mostrarDetallesEvaluacion(data);
        } else {
            modalBody.innerHTML = `
                <div class="loading-detalles">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar detalles</h3>
                    <p>${data.message || 'No se pudieron cargar los detalles de la evaluación'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        modalBody.innerHTML = `
            <div class="loading-detalles">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error de conexión</h3>
                <p>No se pudieron cargar los detalles de la evaluación</p>
            </div>
        `;
    }
}

function closeModalDetalles() {
    document.getElementById('modalVerDetalles').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function mostrarDetallesEvaluacion(data) {
    const modalBody = document.getElementById('modalVerDetalles').querySelector('.modal-body-detalles');
    
    // For now, just show a simple message since we're showing rubric-level data
    modalBody.innerHTML = `
        <div class="detalles-evaluacion">
            <div class="rubrica-info-detalles">
                <h3>${data.nombre_rubrica || 'Detalles de Evaluación'}</h3>
                <p>Esta vista muestra evaluaciones agrupadas por docente y rúbrica.</p>
                <p>Para ver detalles individuales de estudiantes, utilice la vista de evaluaciones del docente.</p>
            </div>
        </div>
    `;
}

// Cerrar modal de detalles con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalDetalles = document.getElementById('modalVerDetalles');
        if (modalDetalles && modalDetalles.classList.contains('active')) {
            closeModalDetalles();
        }
    }
});

// Cerrar modal de detalles al hacer clic fuera
document.getElementById('modalVerDetalles')?.addEventListener('click', function(event) {
    if (event.target === this) {
        closeModalDetalles();
    }
});

// ============================================
// PAGINACIÓN
// ============================================

function inicializarPaginacion() {
    // Guardar todas las filas
    allRows = Array.from(document.querySelectorAll('.evaluacion-row'));
    
    // Event listener para el selector de entradas
    const entriesSelect = document.getElementById('entriesPerPage');
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function() {
            entriesPerPage = this.value === 'all' ? allRows.length : parseInt(this.value);
            currentPage = 1;
            updateTable();
        });
    }
    
    // Inicializar la tabla
    updateTable();
}

// Actualizar tabla según paginación
function updateTable() {
    const totalEntries = allRows.length;
    
    if (totalEntries === 0) return;
    
    // Ocultar todas las filas
    allRows.forEach(row => row.style.display = 'none');
    
    // Calcular rango
    const start = (currentPage - 1) * entriesPerPage;
    const end = entriesPerPage === totalEntries ? totalEntries : Math.min(start + entriesPerPage, totalEntries);
    
    // Mostrar filas del rango actual
    for (let i = start; i < end; i++) {
        if (allRows[i]) {
            allRows[i].style.display = '';
        }
    }
    
    // Actualizar información
    const showingStart = document.getElementById('showingStart');
    const showingEnd = document.getElementById('showingEnd');
    const totalEntriesEl = document.getElementById('totalEntries');
    
    if (showingStart) showingStart.textContent = totalEntries > 0 ? start + 1 : 0;
    if (showingEnd) showingEnd.textContent = end;
    if (totalEntriesEl) totalEntriesEl.textContent = totalEntries;
    
    // Generar botones de paginación
    generatePaginationButtons();
}

// Generar botones de paginación
function generatePaginationButtons() {
    const totalPages = Math.ceil(allRows.length / entriesPerPage);
    const paginationContainer = document.getElementById('paginationButtons');
    
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="fa fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    };
    paginationContainer.appendChild(prevBtn);
    
    // Botones de páginas
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Primera página
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => {
            currentPage = 1;
            updateTable();
        };
        paginationContainer.appendChild(firstBtn);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 8px';
            paginationContainer.appendChild(dots);
        }
    }
    
    // Páginas del rango
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            updateTable();
        };
        paginationContainer.appendChild(pageBtn);
    }
    
    // Última página
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 8px';
            paginationContainer.appendChild(dots);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => {
            currentPage = totalPages;
            updateTable();
        };
        paginationContainer.appendChild(lastBtn);
    }
    
    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="fa fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    };
    paginationContainer.appendChild(nextBtn);
}