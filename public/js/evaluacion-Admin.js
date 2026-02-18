// Variables globales
let estudiantesSeleccionados = [];

// Variables para paginación y filtrado
let currentPage = 1;
let entriesPerPage = 5;
let allRows = []; // Todas las filas originales
let filteredRows = []; // Filas después de aplicar filtros
// Variables para fechas del sistema
let fechasSistema = [];
let configuracionSistema = {};

// Aplicar clases de estado cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    const estadoElements = document.querySelectorAll('.estado');

    estadoElements.forEach(element => {
        const estadoTexto = element.textContent.trim();
        const claseEstado = 'estado-' + estadoTexto.replace(/ /g, '-');
        element.classList.add(claseEstado);
    });
    
    // Inicializar datos
    allRows = Array.from(document.querySelectorAll('.evaluacion-row'));
    filteredRows = [...allRows]; // Inicialmente, todas las filas están filtradas
    inicializarPaginacion();
});

// Función para filtrar evaluaciones
function filtrarEvaluaciones() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const docenteFilter = document.getElementById('filterDocente')?.value || '';
    const estadoFilter = document.getElementById('filterEstado')?.value || '';
    
    // Filtrar sobre todas las filas originales
    filteredRows = allRows.filter(row => {
        // Obtener texto de todas las celdas para búsqueda general
        const rowText = row.textContent.toLowerCase();
        
        // Obtener docente del atributo data
        const docenteAttr = row.dataset.docente || '';
        
        // Filtrado de búsqueda
        const matchSearch = !searchTerm || rowText.includes(searchTerm);
        
        // Filtro por docente
        const matchDocente = !docenteFilter || docenteAttr === docenteFilter;
        
        // Filtro por estado - CORREGIDO: el estado está en la columna 7 (octava columna)
        let matchEstado = true;
        if (estadoFilter) {
            const estadoCell = row.cells[7]?.textContent.trim() || ''; // Columna de estado (índice 7)
            
            if (estadoFilter === 'Completada') {
                matchEstado = estadoCell.includes('Completada') || estadoCell === 'Completada';
            } else if (estadoFilter === 'Pendiente') {
                matchEstado = estadoCell === 'Pendiente';
            } else if (estadoFilter === 'En Progreso') {
                // Asumiendo que "En Progreso" podría mostrar algo como "3/5" o similar
                //matchEstado = estadoCell.includes('/') && !estadoCell.includes('Completada') && estadoCell !== 'Pendiente';
                matchEstado = estadoCell === 'En Progreso';
            }
        }

        return matchSearch && matchDocente && matchEstado;
    });
      // Reiniciar a la primera página
    currentPage = 1;
    
    // Actualizar la tabla con las filas filtradas
    updateTable();
}

// Event listeners para los filtros
document.addEventListener('DOMContentLoaded', function() {
    // Input de búsqueda
    document.getElementById('searchInput')?.addEventListener('input', filtrarEvaluaciones);
    
    // Filtro por docente
    document.getElementById('filterDocente')?.addEventListener('change', filtrarEvaluaciones);
    
    // Filtro por estado
    document.getElementById('filterEstado')?.addEventListener('change', filtrarEvaluaciones);
    
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
    //cargarRubricas();
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
                option.textContent = `Sección ${seccion.codigo} - ${seccion.horario}`;
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
        await cargarConfiguracionFechas(seccionId);
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
    const btnGuardar = document.getElementById('btnGuardarEvaluacion');
    
    if (estudiantesSeleccionados.length > 0) {
        btnGuardar.disabled = false;
    } else {
        btnGuardar.disabled = true;
    }
}

// Guardar evaluación
async function guardarEvaluacion() {
    const observaciones = document.getElementById('observaciones').value;

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
    // Event listener para el selector de entradas
    const entriesSelect = document.getElementById('entriesPerPage');
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function() {
            if (this.value === 'all') {
                entriesPerPage = filteredRows.length;
            } else {
                entriesPerPage = parseInt(this.value);
            }
            currentPage = 1;
            updateTable();
        });
    }
    
    // Inicializar la tabla
    updateTable();
}
// Actualizar tabla según paginación
function updateTable() {
    const totalEntries = filteredRows.length;
    
    // Ocultar todas las filas primero
    allRows.forEach(row => row.style.display = 'none');
    
    if (totalEntries === 0) {
        // Mostrar mensaje de "No hay resultados"
        document.getElementById('showingStart').textContent = '0';
        document.getElementById('showingEnd').textContent = '0';
        document.getElementById('totalEntries').textContent = '0';
        document.getElementById('paginationButtons').innerHTML = '';
        return;
    }
    
    // Calcular rango
    const start = (currentPage - 1) * entriesPerPage;
    const end = Math.min(start + entriesPerPage, totalEntries);
    
    // Mostrar filas del rango actual
    for (let i = start; i < end; i++) {
        if (filteredRows[i]) {
            filteredRows[i].style.display = '';
        }
    }
    
    // Actualizar información
    document.getElementById('showingStart').textContent = start + 1;
    document.getElementById('showingEnd').textContent = end;
    document.getElementById('totalEntries').textContent = totalEntries;
    
    // Generar botones de paginación
    generatePaginationButtons();
}

// Generar botones de paginación
function generatePaginationButtons() {
    const totalPages = Math.ceil(filteredRows.length / entriesPerPage);
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
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
    }
    
    // Páginas del rango
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
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
            dots.className = 'pagination-dots';
            dots.textContent = '...';
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

// Cargar configuración de fechas desde el backend
async function cargarConfiguracionFechas(seccionId) {
    try {
        console.log('haciendo peticion de horarios')
        // Aquí haces la petición a tu API para obtener la configuración
        const response = await fetch(`/api/seccion/${seccionId}/horario`);
        const data = await response.json()

        if (data.success && data.horarios.length > 0) {
            dias_num = data.horarios.map(horario => horario.dia_num + 1); //Porque en la BD 0 = Lunes
            dias = data.horarios.map(horario => horario.dia + 1);
            configuracionSistema = {
                ids: data.horarios.id,
                periodo: data.horarios[0].periodo,
                diasPermitidos: dias_num, // Ej: [1, 4] para Lunes y Jueves
                fechaInicio: data.horarios[0].fecha_inicio,
                fechaFin: data.horarios[0].fecha_fin,
                nombreDias: dias // Ej: ['Lunes', 'Jueves']
            };
            
            // Actualizar UI con la configuración
            actualizarInfoSistema();
            
            // Generar fechas disponibles según configuración
            generarFechasDisponibles();
        }
    } catch (error) {
        console.error('Error al cargar configuración de fechas:', error);
        mostrarErrorFechas();
    }
}

// Actualizar la información del sistema en la UI
function actualizarInfoSistema() {
    const periodoEl = document.getElementById('periodoAcademico');
    const diasEl = document.getElementById('diasEvaluacion');
    const rangoEl = document.getElementById('rangoFechas');
    
    if (periodoEl) {
        periodoEl.textContent = configuracionSistema.periodo || 'No disponible';
    }
    
    if (diasEl) {
        const nombreDias = configuracionSistema.nombreDias || 
                          configuracionSistema.diasPermitidos.map(dia => obtenerNombreDia(dia));
        diasEl.textContent = nombreDias.join(' y ');
    }
    
    if (rangoEl) {
        const fechaInicio = formatearFechaLocal(configuracionSistema.fechaInicio);
        const fechaFin = formatearFechaLocal(configuracionSistema.fechaFin);
        rangoEl.textContent = `${fechaInicio} - ${fechaFin}`;
    }
}

// Generar fechas disponibles según la configuración del sistema
function generarFechasDisponibles() {
    fechasSistema = [];
    
    const fechaInicio = new Date(configuracionSistema.fechaInicio);
    const fechaFin = new Date(configuracionSistema.fechaFin);
    const diasPermitidos = configuracionSistema.diasPermitidos;
    
    // Ajustar fechas
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);
    
    // Recorrer el rango de fechas
    const fechaActual = new Date(fechaInicio);
    while (fechaActual <= fechaFin) {
        const diaSemana = fechaActual.getDay();
        
        // Verificar si el día está permitido
        if (diasPermitidos.includes(diaSemana)) {
            fechasSistema.push({
                fecha: new Date(fechaActual),
                fechaStr: formatearFechaParaInput(fechaActual),
                fechaLocal: formatearFechaLocal(fechaActual),
                diaSemana: obtenerNombreDia(diaSemana),
                diaNumero: diaSemana
            });
        }
        
        // Avanzar un día
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    // Actualizar el select con las fechas generadas
    actualizarSelectFechas();
}

// Actualizar el select con las fechas disponibles
function actualizarSelectFechas() {
    const select = document.getElementById('fecha_evaluacion');
    if (!select) return;
    
    // Limpiar opciones existentes (mantener la primera)
    select.innerHTML = '<option value="">-- Seleccione una fecha --</option>';
    
    if (fechasSistema.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.disabled = true;
        option.textContent = 'No hay fechas disponibles en este período';
        select.appendChild(option);
        return;
    }
    
    // Agrupar fechas por mes para mejor organización
    const fechasPorMes = agruparFechasPorMes(fechasSistema);
    
    for (const [mes, fechas] of Object.entries(fechasPorMes)) {
        // Crear grupo de opciones
        const optgroup = document.createElement('optgroup');
        optgroup.label = mes;
        
        fechas.forEach(fecha => {
            const option = document.createElement('option');
            option.value = fecha.fechaStr;
            option.textContent = `${fecha.fechaLocal} (${fecha.diaSemana})`;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    }
}

// Agrupar fechas por mes
function agruparFechasPorMes(fechas) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const agrupadas = {};
    
    fechas.forEach(fecha => {
        const mes = meses[fecha.fecha.getMonth()];
        const año = fecha.fecha.getFullYear();
        const clave = `${mes} ${año}`;
        
        if (!agrupadas[clave]) {
            agrupadas[clave] = [];
        }
        
        agrupadas[clave].push(fecha);
    });
    
    return agrupadas;
}

// Función para obtener la fecha seleccionada
function getFechaSeleccionada() {
    const select = document.getElementById('fecha_evaluacion');
    if (!select.value) return null;
    
    const fechaSeleccionada = fechasSistema.find(f => f.fechaStr === select.value);
    return fechaSeleccionada || null;
}

// Función para filtrar por fecha seleccionada
function filtrarPorFechaSistema() {
    const fechaSeleccionada = getFechaSeleccionada();
    
    if (!fechaSeleccionada) {
        Swal.fire({
            icon: 'warning',
            title: 'Seleccione una fecha',
            text: 'Debe seleccionar una fecha para filtrar',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    // Aquí aplicas el filtro con la fecha seleccionada
    aplicarFiltroFecha(fechaSeleccionada.fechaStr);
}

// Función para aplicar el filtro (la conectas con tu sistema de filtrado existente)
function aplicarFiltroFecha(fechaStr) {
    // Aquí usas la fecha para filtrar tus evaluaciones
    // Por ejemplo, si tienes un sistema de filtrado:
    if (typeof filtrarEvaluaciones === 'function') {
        // Guardar la fecha en algún lado para usarla en el filtro
        window.fechaFiltro = fechaStr;
        filtrarEvaluaciones();
    }
    
    // O si necesitas recargar datos:
    // cargarEvaluacionesPorFecha(fechaStr);
}

// Funciones auxiliares
function formatearFechaParaInput(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatearFechaLocal(fecha) {
    if (!fecha) return '';
    if (typeof fecha === 'string') fecha = new Date(fecha);
    
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
}

function obtenerNombreDia(diaNumero) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[diaNumero] || '';
}

function mostrarErrorFechas() {
    const select = document.getElementById('fecha_evaluacion');
    if (select) {
        select.innerHTML = '<option value="">Error al cargar fechas</option>';
    }
}
/*
// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar configuración de fechas del sistema
    cargarConfiguracionFechas();
    
    // Agregar event listener para el select
    const selectFecha = document.getElementById('fecha_evaluacion');
    if (selectFecha) {
        selectFecha.addEventListener('change', function() {
            const fecha = getFechaSeleccionada();
            if (fecha) {
                // Opcional: actualizar algún indicador o habilitar botones
                console.log('Fecha seleccionada:', fecha);
            }
        });
    }
});*/