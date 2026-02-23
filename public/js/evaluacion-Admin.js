// Variables globales
let estudiantesSeleccionados = [];
// Variables para paginación y filtrado
let currentPage = 1;
let entriesPerPage = 5;
let allRows = []; // Todas las filas originales
let filteredRows = []; // Filas después de aplicar filtros
let configuracionFechas = null;
let fechasSistema = [];
let horariosSeccion = []; // Guardar todos los horarios de la sección

// Aplicar clases de estado cuando se cargue la página
document.addEventListener('DOMContentLoaded', function () {
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

        // Filtro por estado
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
document.addEventListener('DOMContentLoaded', function () {
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
// Modificar la función de apertura del modal de creación
function openModalEvaluacion() {
    document.getElementById('evaluacion_id').value = '';
    document.querySelector('#modalAddEvaluacion .modal-header-evaluacion h2').innerHTML = '<i class="fas fa-clipboard-check"></i> Nueva Evaluación';
    document.getElementById('btnGuardarEvaluacion').innerHTML = '<i class="fas fa-save"></i> Crear Evaluación';
    document.getElementById('btnGuardarEvaluacion').onclick = guardarEvaluacion;
    document.getElementById('modalAddEvaluacion').classList.add('active');
    document.body.style.overflow = 'hidden';
    cargarEstrategias();
    cargarCarreras();
}

function closeModalEvaluacion() {
    document.getElementById('modalAddEvaluacion').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('formAddEvaluacion').reset();
    document.getElementById('materia_codigo').disabled = true;
    document.getElementById('seccion_id').disabled = true;
    document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione carrera, materia y sección para cargar estudiantes</div>';
    document.getElementById('btnGuardarEvaluacion').disabled = true;
    estudiantesSeleccionados = [];
}
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
                               class="form-check-input estrategia-item" 
                               id="estrategia_${estrategia.id}" 
                               value="${estrategia.id}"
                               name="estrategias[]"
                               ${estrategia.ponderable == 0 ? `onclick="verificarPonderacion(${estrategia.id})"` : 'onclick="verificarFormularioCompleto()"'}>
                        <label class="form-check-label" 
                               for="estrategia_${estrategia.id}">
                            ${estrategia.nombre}
                        </label>
                    </div>
                `;
            });

            div.innerHTML = labelHTML + checkboxesHTML;
        }
    } catch (error) {
        console.error('Error al cargar carreras:', error);
        Swal.fire('Error', 'No se pudieron cargar las carreras', 'error');
    }
}
function verificarPonderacion(id_chckbx) {
    checkbox_no_ponderable = document.getElementById(`estrategia_${id_chckbx}`);
    const input_pond = document.getElementById('porcentaje_evaluacion')
    if (checkbox_no_ponderable.checked) {
        input_pond.disabled = true;
        input_pond.value = 0;
    }
    else {
        input_pond.value = 5;
        input_pond.disabled = false;
    }
    verificarFormularioCompleto();
}
/* Cargar rúbricas disponibles
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
*/

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
document.getElementById('carrera_codigo')?.addEventListener('change', async function () {
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
document.getElementById('materia_codigo')?.addEventListener('change', async function () {
    const carreraCodigo = document.getElementById('carrera_codigo').value
    const materiaCodigo = this.value;
    const seccionSelect = document.getElementById('seccion_id');

    if (materiaCodigo) {
        seccionSelect.disabled = false;
        await cargarSecciones(materiaCodigo, carreraCodigo);
    } else {
        seccionSelect.disabled = true;
        seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
        document.getElementById('estudiantesPreview').innerHTML = '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione una sección para cargar estudiantes</div>';
    }
    verificarFormularioCompleto();
});

// Cargar secciones por materia
async function cargarSecciones(materiaCodigo, carreraCodigo) {
    try {
        const response = await fetch(`/api/materia/${materiaCodigo}/${carreraCodigo}/secciones`);
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
// Eventos
document.getElementById('seccion_id')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('fecha_evaluacion_select')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('fecha_evaluacion_date')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('hora_eval_inicio')?.addEventListener('change', verificarFormularioCompleto);
document.getElementById('hora_eval_fin')?.addEventListener('change', verificarFormularioCompleto);
document.getElementById('contenido')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('competencias')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('instrumentos')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('tipo_horario')?.addEventListener('change', verificarFormularioCompleto);
document.getElementById('fecha_evaluacion_select')?.addEventListener('change', verificarFormularioCompleto);
document.getElementById('fecha_evaluacion_date')?.addEventListener('change', verificarFormularioCompleto);
document.getElementById('evidencia_aprendizaje')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('indicadores_competencia')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('actividades_aprendizaje')?.addEventListener('input', verificarFormularioCompleto);
document.getElementById('recursos_herramientas')?.addEventListener('input', verificarFormularioCompleto);

// Evento cuando se selecciona una sección
document.getElementById('seccion_id')?.addEventListener('change', async function () {
    const seccionId = this.value;

    if (seccionId) {
        await cargarEstudiantes(seccionId);
        await cargarConfiguracionFechas(seccionId);
        document.getElementById('tipo_horario').disabled = false;
    } else {
        select_tipo_horario = document.getElementById('tipo_horario');
        select_tipo_horario.value = '';
        select_tipo_horario.disabled = true;
        date_input = document.getElementById('fecha_evaluacion_date')
        date_input.value = ''; date_input.disabled = true;
        date_select = document.getElementById('fecha_evaluacion_select')
        date_select.value = ''; date_select.disabled = true;
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
function condicionarFormularioCompleto() {
    let checkboxes_estrags = Array.from(document
        .getElementById('estrategias_eval')
        .querySelectorAll('input[type="checkbox"]'))
        .filter(estrategia_eval => estrategia_eval.checked)
        .map(estrategia_eval => estrategia_eval.value); //obtiene las checkbox
    const porcentaje_eval = document.getElementById('porcentaje_evaluacion').value;
    const fecha_evaluacion_date = document.getElementById('fecha_evaluacion_date').value;
    const hora_eval_inicio = document.getElementById('hora_eval_inicio').value;
    const hora_eval_fin = document.getElementById('hora_eval_fin').value;
    const cant_personas = document.getElementById('cant_personas').value;
    const id_seccion = document.getElementById('seccion_id').value;
    const fecha_evaluacion_select = document.getElementById('fecha_evaluacion_select').value;
    const contenido = document.getElementById('contenido').value;
    const competencias = document.getElementById('competencias').value;
    const instrumentos = document.getElementById('instrumentos').value;

    return ((fecha_evaluacion_date && hora_eval_inicio && hora_eval_fin) || fecha_evaluacion_select)
        && cant_personas && id_seccion && contenido && porcentaje_eval && competencias && instrumentos
        && checkboxes_estrags.length > 0

}
// Verificar si el formulario está completo
function verificarFormularioCompleto() {
    const btnGuardar = document.getElementById('btnGuardarEvaluacion');
    if (condicionarFormularioCompleto()) {
        btnGuardar.disabled = false;
    } else {
        btnGuardar.disabled = true;
    }
}

// Guardar evaluación
async function guardarEvaluacion() {
    const checkboxes_estrags = Array.from(document
        .getElementById('estrategias_eval')
        .querySelectorAll('input[type="checkbox"]'))
        .filter(estrategia_eval => estrategia_eval.checked)
        .map(estrategia_eval => estrategia_eval.value); //obtiene las checkbox
    const porcentaje_eval = document.getElementById('porcentaje_evaluacion').value;
    const tipo_horario = document.getElementById('tipo_horario').value
    const cant_personas = document.getElementById('cant_personas').value;
    const id_seccion = document.getElementById('seccion_id').value;
    const contenido = document.getElementById('contenido').value;
    const competencias = document.getElementById('competencias').value;
    const instrumentos = document.getElementById('instrumentos').value;
    const observaciones = document.getElementById('observaciones').value;
    const fecha_evaluacion_date = document.getElementById('fecha_evaluacion_date').value;
    const hora_eval_inicio = document.getElementById('hora_eval_inicio').value;
    const hora_eval_fin = document.getElementById('hora_eval_fin').value;
    let horario = "";
    let fecha_evaluacion = "";
    if (tipo_horario == "Sección") {
        const fecha_evaluacion_select = document.getElementById('fecha_evaluacion_select').value;
        horario = fecha_evaluacion_select;
        fecha_evaluacion = JSON.parse(fecha_evaluacion_select);
    }
    else if (tipo_horario == "Otro") {
        horario = fecha_evaluacion_date && hora_eval_inicio && hora_eval_fin;
        fecha_evaluacion = fecha_evaluacion_date
    }
    if (!
        (horario && cant_personas && id_seccion && contenido && porcentaje_eval && competencias && instrumentos
            && checkboxes_estrags.length > 0)
    ) {
        Swal.fire('Error', 'No todos los campos obligatorios fueron llenados. Por favor, asegurese de haber respondido los no opcionales.', 'error');
        return;
    }

    // Confirmar creación
    const result = await Swal.fire({
        title: '¿Crear evaluaciones?',
        html: `Se creará la evaluación para los <strong>${estudiantesSeleccionados.length}</strong> estudiantes de la sección seleccionada`,
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
        if (tipo_horario == "Sección") {
            const response = await fetch('/api/evaluaciones/crear_en_horario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    observaciones: observaciones,
                    fecha_evaluacion: fecha_evaluacion.fecha,
                    id_horario: fecha_evaluacion.horarioId,
                    id_seccion: id_seccion,
                    cant_personas: cant_personas,
                    contenido: contenido,
                    competencias: competencias,
                    instrumentos: instrumentos,
                    porcentaje: porcentaje_eval,
                    estrategias_eval: checkboxes_estrags
                })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Evaluaciones creadas!',
                    html: `Se creó la evaluación correctamente`,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    closeModalEvaluacion();
                    location.reload();
                });
            } else {
                Swal.fire('Error', data.message || 'No se pudieron crear las evaluaciones', 'error');
            }
        }
        else if (tipo_horario == "Otro") {
            const response = await fetch('/api/evaluaciones/crear_fuera_de_horario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    observaciones: observaciones,
                    fecha_evaluacion: fecha_evaluacion,
                    hora_eval_inicio: hora_eval_inicio,
                    hora_eval_fin: hora_eval_fin,
                    id_seccion: id_seccion,
                    cant_personas: cant_personas,
                    contenido: contenido,
                    competencias: competencias,
                    instrumentos: instrumentos,
                    porcentaje: porcentaje_eval,
                    estrategias_eval: checkboxes_estrags
                })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Evaluaciones creadas!',
                    html: `Se creó la evaluación correctamente`,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    closeModalEvaluacion();
                    location.reload();
                });
            } else {
                Swal.fire('Error', data.message || 'No se pudieron crear las evaluaciones', 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Ocurrió un error al crear las evaluaciones', 'error');
    }
}

// Cerrar modal con ESC
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('modalAddEvaluacion');
        if (modal && modal.classList.contains('active')) {
            closeModalEvaluacion();
        }
    }
});

// Cerrar modal al hacer clic fuera
document.getElementById('modalAddEvaluacion')?.addEventListener('click', function (event) {
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
// Funciones para edición
function openEditModal(evaluacionId) {
    document.getElementById('modalAddEvaluacion').classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('evaluacion_id').value = evaluacionId;
    document.querySelector('#modalAddEvaluacion .modal-header-evaluacion h2').innerHTML = '<i class="fas fa-edit"></i> Editar Evaluación';
    document.getElementById('btnGuardarEvaluacion').innerHTML = '<i class="fas fa-save"></i> Actualizar Evaluación';
    document.getElementById('btnGuardarEvaluacion').onclick = actualizarEvaluacion;

    // Mostrar loading mientras se cargan datos
    document.getElementById('estrategias_eval').innerHTML = '<div class="loading">Cargando...</div>';

    Promise.all([
        fetch('/api/estrategias_eval').then(r => r.json()),
        fetch(`/api/evaluacion/${evaluacionId}`).then(r => r.json())
    ]).then(([estrategiasResp, evaluacionResp]) => {
        if (estrategiasResp.success && evaluacionResp.success) {
            cargarEstrategiasEdit(estrategiasResp.estrategias_eval, evaluacionResp.evaluacion.estrategias);
            cargarDatosEvaluacionEdit(evaluacionResp.evaluacion);
        } else {
            Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
            closeModalEvaluacion();
        }
    }).catch(error => {
        console.error('Error:', error);
        Swal.fire('Error', 'Error al cargar datos', 'error');
        closeModalEvaluacion();
    });
}

function cargarEstrategiasEdit(listaEstrategias, seleccionadas = []) {
    const container = document.getElementById('estrategias_eval');
    container.innerHTML = '';
    listaEstrategias.forEach(est => {
        const label = document.createElement('label');
        label.className = 'estrategia-checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = est.id;
        checkbox.checked = seleccionadas.includes(est.id);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(est.nombre));
        container.appendChild(label);
    });
}

function cargarDatosEvaluacionEdit(evaluacion) {
    document.getElementById('contenido').value = evaluacion.contenido;
    document.getElementById('porcentaje_evaluacion').value = evaluacion.porcentaje;
    document.getElementById('cant_personas').value = evaluacion.cantidad_personas;
    document.getElementById('competencias').value = evaluacion.competencias || '';
    document.getElementById('instrumentos').value = evaluacion.instrumentos || '';

    // Cargar cascada de carrera, materia, sección
    cargarCarrerasYSeleccionarEdit(evaluacion.carrera_codigo, evaluacion.materia_codigo, evaluacion.seccion_id, evaluacion);
}

function cargarCarrerasYSeleccionarEdit(carreraCodigo, materiaCodigo, seccionId, evaluacion) {
    fetch('/api/carreras')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const selectCarrera = document.getElementById('carrera_codigo');
                selectCarrera.innerHTML = '<option value="">Seleccione una carrera</option>';
                data.carreras.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.codigo;
                    option.textContent = c.nombre;
                    if (c.codigo === carreraCodigo) option.selected = true;
                    selectCarrera.appendChild(option);
                });
                // Disparar cambio para cargar materias
                if (carreraCodigo) {
                    cargarMateriasYSeleccionarEdit(carreraCodigo, materiaCodigo, seccionId, evaluacion);
                }
            }
        });
}

function cargarMateriasYSeleccionarEdit(carreraCodigo, materiaCodigo, seccionId, evaluacion) {
    fetch(`/api/carrera/${carreraCodigo}/materias`)
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const selectMateria = document.getElementById('materia_codigo');
                selectMateria.disabled = false;
                selectMateria.innerHTML = '<option value="">Seleccione una materia</option>';
                data.materias.forEach(m => {
                    const option = document.createElement('option');
                    option.value = m.codigo;
                    option.textContent = `${m.nombre} (Semestre ${m.semestre})`;
                    if (m.codigo === materiaCodigo) option.selected = true;
                    selectMateria.appendChild(option);
                });
                if (materiaCodigo) {
                    cargarSeccionesYSeleccionarEdit(materiaCodigo, seccionId, evaluacion);
                }
            }
        });
}

async function cargarSeccionesYSeleccionarEdit(materiaCodigo, seccionId, evaluacion) {
    try {
        const response = await fetch(`/api/materia/${materiaCodigo}/secciones`);
        const data = await response.json();

        if (data.success) {
            const selectSeccion = document.getElementById('seccion_id');
            selectSeccion.disabled = false;
            selectSeccion.innerHTML = '<option value="">Seleccione una sección</option>';

            data.secciones.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = `Sección ${s.codigo} - ${s.horario}`;
                if (s.id === seccionId) option.selected = true;
                selectSeccion.appendChild(option);
            });

            if (seccionId) {
                await cargarEstudiantes(seccionId);
                await cargarConfiguracionFechas(seccionId);
                document.getElementById('tipo_horario').disabled = false;
                await cargarHorarioYFechaEdit(evaluacion);
            }
        }
    } catch (error) {
        console.error('Error en cargarSeccionesYSeleccionarEdit:', error);
    }
}

async function cargarHorarioYFechaEdit(evaluacion) {
    const tipoHorario = document.getElementById('tipo_horario');
    tipoHorario.disabled = false;
    tipoHorario.value = evaluacion.tipo_horario;

    cambiarTipoHorario();

    if (evaluacion.tipo_horario === 'Sección') {
        const selectFecha = document.getElementById('fecha_evaluacion_select');
        let par_conseguido = false
        // Buscar y seleccionar la opción correcta
        for (let i = 0; i < selectFecha.options.length; i++) {
            const opcion = selectFecha.options[i];
            if (opcion.value) {
                try {
                    const data = JSON.parse(opcion.value);
                    if (data.fecha == formatearFechaParaInput(new Date(evaluacion.fecha_evaluacion))) {
                        opcion.selected = true;
                        selectFecha.dispatchEvent(new Event('change', { bubbles: true }));
                        par_conseguido = true;
                        break;
                    }
                } catch (e) { }
            }
        }
        if (!par_conseguido) {
            const option = document.createElement('option');
            valor_json = {
                fecha: formatearFechaLocal(new Date(evaluacion.fecha_evaluacion)),
                horarioId: evaluacion.id_horario,
                diaNumero: evaluacion.dia_num,
                horaInicio: evaluacion.hora_inicio,
                horaCierre: evaluacion.hora_cierre
            };
            option.value = JSON.stringify(valor_json);
            option.textContent = `${valor_json.fecha} (${evaluacion.dia}) - ${valor_json.horaInicio} a ${valor_json.horaCierre} - Aula: ${evaluacion.aula}`;
            new_opcion = selectFecha.appendChild(option);
            new_opcion.selected = true;
            actualizarInputsHoras(valor_json.horaInicio, valor_json.horaCierre)
        }
    } else if (evaluacion.tipo_horario === 'Otro') {
        document.getElementById('fecha_evaluacion_date').value = evaluacion.fecha_evaluacion.split('T')[0];
        document.getElementById('hora_eval_inicio').value = evaluacion.hora_inicio;
        document.getElementById('hora_eval_fin').value = evaluacion.hora_cierre;
    }
    verificarFormularioCompleto();
}

function actualizarEvaluacion() {
    const evaluacionId = document.getElementById('evaluacion_id').value;
    if (!evaluacionId) return;

    const data = {
        contenido: document.getElementById('contenido').value,
        estrategias_eval: Array.from(document.querySelectorAll('#estrategias_eval input:checked')).map(cb => cb.value),
        porcentaje: document.getElementById('porcentaje_evaluacion').value,
        cant_personas: document.getElementById('cant_personas').value,
        id_seccion: document.getElementById('seccion_id').value,
        fecha_evaluacion: document.getElementById('fecha_evaluacion_select').style.display !== 'none' ? JSON.parse(document.getElementById('fecha_evaluacion_select').value).fecha : document.getElementById('fecha_evaluacion_date').value,
        tipo_horario: document.getElementById('tipo_horario').value,
        competencias: document.getElementById('competencias').value,
        instrumentos: document.getElementById('instrumentos').value
    };

    if (data.tipo_horario === 'Sección') {
        data.id_horario = JSON.parse(document.getElementById('fecha_evaluacion_select').value).horarioId;
    } else {
        data.hora_inicio = document.getElementById('hora_eval_inicio').value;
        data.hora_fin = document.getElementById('hora_eval_fin').value;
    }

    // Validaciones básicas
    if (!data.contenido || data.estrategias_eval.length === 0 || !data.porcentaje || !data.cant_personas || !data.id_seccion || !data.fecha_evaluacion || !data.competencias || !data.instrumentos) {
        Swal.fire('Error', 'Complete todos los campos requeridos', 'error');
        return;
    }

    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    fetch(`/api/evaluacion/${evaluacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire({ icon: 'success', title: 'Actualizado', text: res.message }).then(() => {
                    closeModalEvaluacion();
                    location.reload();
                });
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Error de red', 'error');
        });
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
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modalDetalles = document.getElementById('modalVerDetalles');
        if (modalDetalles && modalDetalles.classList.contains('active')) {
            closeModalDetalles();
        }
    }
});

// Cerrar modal de detalles al hacer clic fuera
document.getElementById('modalVerDetalles')?.addEventListener('click', function (event) {
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
        entriesSelect.addEventListener('change', function () {
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
async function cargarConfiguracionFechas(seccionId) {
    // Filtrar evaluaciones por el ID de sección actual
    evals = JSON.parse(window.evaluaciones);
    const evaluacionesSecc = evals.filter(
        evalu => evalu.id_seccion == seccionId);
    // Crear array de fechas y IDs de horario con evaluaciones existentes de ESTA sección
    const fechas_y_ids_horario = evaluacionesSecc.map(evalu => ({
        fecha: formatearFechaParaInput(new Date(evalu.fecha_evaluacion)),
        id_horario: evalu.id_horario
    }));
    try {
        if (!configuracionFechas?.seccion || configuracionFechas?.seccion != seccionId) {
            console.log('Cargando horarios para sección:', seccionId);
            const response = await fetch(`/api/seccion/${seccionId}/horario`);
            const data = await response.json();

            if (data.success && data.horarios.length > 0) {
                // Guardar todos los horarios completos
                horariosSeccion = data.horarios.map(horario => ({
                    id: horario.id,
                    dia: horario.dia,
                    dia_num: horario.dia_num,
                    aula: horario.aula,
                    modalidad: horario.modalidad,
                    hora_inicio: horario.hora_inicio,
                    hora_cierre: horario.hora_cierre,
                    id_seccion: horario.id_seccion
                }));

                // Obtener días únicos permitidos
                const diasUnicos = [...new Set(horariosSeccion.map(h => h.dia_num))];

                configuracionFechas = {
                    seccion: seccionId,
                    ids: horariosSeccion.map(h => h.id),
                    periodo: data.horarios[0].periodo,
                    diasPermitidos: diasUnicos,
                    fechaInicio: data.horarios[0].fecha_inicio,
                    fechaFin: data.horarios[0].fecha_fin,
                    horarios: horariosSeccion
                };
            }
        }
        actualizarInfoSistema();
        // Pasar las fechas ocupadas de ESTA sección a la función
        generarFechasDisponibles(fechas_y_ids_horario);
    } catch (error) {
        console.error('Error al cargar configuración de fechas:', error);
        mostrarErrorFechas();
    }
}
function cambiarTipoHorario() {
    const tipoSelect = document.getElementById('tipo_horario');
    const selectFechas = document.getElementById('fecha_evaluacion_select');
    const dateInput = document.getElementById('fecha_evaluacion_date');
    const hint = document.getElementById('date-eval-text');
    const input_hora_inicio = document.getElementById('hora_eval_inicio');
    const input_hora_fin = document.getElementById('hora_eval_fin');

    const tipo = tipoSelect.value;

    if (tipo === 'Sección') {
        dateInput.value = ''
        input_hora_inicio.value = '';
        input_hora_fin.value = '';
        selectFechas.style.display = 'block';
        dateInput.style.display = 'none';
        dateInput.disabled = true;
        selectFechas.disabled = false;
        input_hora_inicio.disabled = true;
        input_hora_fin.disabled = true;

        // Actualizar hint
        hint.innerHTML = '<i class="fas fa-clock"></i> Solo se muestran los horarios de clases de la sección';

    } else if (tipo === 'Otro') {
        // Modo libre: ocultar select, mostrar date input
        selectFechas.value = ''
        selectFechas.style.display = 'none';
        dateInput.style.display = 'block';
        input_hora_inicio.style.display = 'block';
        input_hora_fin.style.display = 'block';
        selectFechas.disabled = true;
        dateInput.disabled = false;
        input_hora_inicio.disabled = false;
        input_hora_fin.disabled = false;
        input_hora_inicio.value = '';
        input_hora_fin.value = '';
        dateInput.min = configuracionFechas.fechaInicio.slice(0, 10);
        dateInput.max = configuracionFechas.fechaFin.slice(0, 10);

        // Actualizar hint
        hint.innerHTML = '<i class="fas fa-calendar-alt"></i> Puedes seleccionar cualquier fecha del semestre';
    }
    else if (tipo == '') {
        selectFechas.style.display = 'block';
        dateInput.style.display = 'none';
        selectFechas.disabled = true;
        dateInput.disabled = true;
        input_hora_inicio.disabled = true;
        input_hora_fin.disabled = true;
        selectFechas.value = '';
        dateInput.value = '';
        input_hora_inicio.value = '';
        input_hora_fin.value = '';
    }
}
document.getElementById('fecha_evaluacion_select')?.addEventListener('change', async function () {
    fecha_select = JSON.parse(this.value)
    if (fecha_select) {
        actualizarInputsHoras(fecha_select.horaInicio, fecha_select.horaCierre)
    }
});
function actualizarInputsHoras(hora_inicio, hora_cierre) {
    const horas_eval_div = document.getElementById('horas_evaluacion');
    inputs = horas_eval_div.querySelectorAll('input');
    inputs[0].value = hora_inicio;
    inputs[1].value = hora_cierre;
}
// Actualizar la información del sistema en la UI
function actualizarInfoSistema() {
    document.getElementById('date-eval-text').textContent = 'Solo se muestran los días habilitados para clases de la sección';
    const periodoEl = document.getElementById('periodoAcademico');
    const diasEl = document.getElementById('diasEvaluacion');
    const rangoEl = document.getElementById('rangoFechas');

    if (periodoEl) {
        periodoEl.textContent = configuracionFechas.periodo || 'No disponible';
    }

    if (diasEl) {
        // Obtener nombres de días únicos
        const diasNombres = configuracionFechas.diasPermitidos
            .map(diaNum => obtenerNombreDia(diaNum))
            .filter((dia, index, self) => self.indexOf(dia) === index);
        diasEl.textContent = diasNombres.join(', ');
    }

    if (rangoEl) {
        const fechaInicio = formatearFechaLocal(configuracionFechas.fechaInicio);
        const fechaFin = formatearFechaLocal(configuracionFechas.fechaFin);
        rangoEl.textContent = `${fechaInicio} - ${fechaFin}`;
    }
}

// Modificar generarFechasDisponibles para recibir las fechas ocupadas
function generarFechasDisponibles(fechasOcupadasSeccion = []) {
    fechasSistema = [];

    // Crear un Set para búsqueda rápida de fechas ocupadas de ESTA sección
    const fechasOcupadas = new Set(
        fechasOcupadasSeccion.map(item => `${item.fecha}_${item.id_horario}`)
    );
    const fechaInicio = new Date(configuracionFechas.fechaInicio);
    const fechaFin = new Date(configuracionFechas.fechaFin);
    const diasPermitidos = configuracionFechas.diasPermitidos;

    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    const fechaActual = new Date(fechaInicio);
    while (fechaActual <= fechaFin) {
        const diaSemana = fechaActual.getDay();

        // Convertir día de JS a tu formato (lunes=0)
        let diaEnTuFormato = diaSemana === 0 ? 6 : diaSemana - 1;

        // Verificar si el día está permitido
        if (diasPermitidos.includes(diaEnTuFormato)) {
            // Buscar TODOS los horarios para este día
            const horariosDelDia = configuracionFechas.horarios.filter(
                h => h.dia_num === diaEnTuFormato
            );

            // Por cada horario en este día, crear una opción de fecha
            horariosDelDia.forEach(horario => {
                const fechaStr = formatearFechaParaInput(fechaActual);
                const claveFechaHorario = `${fechaStr}_${horario.id}`;

                // Solo agregar si NO hay evaluación en ESTA sección para esta fecha y horario
                if (!fechasOcupadas.has(claveFechaHorario)) {
                    fechasSistema.push({
                        fecha: new Date(fechaActual),
                        fechaStr: fechaStr,
                        fechaLocal: formatearFechaLocal(fechaActual),
                        diaSemana: horario.dia,
                        diaNumero: horario.dia_num,
                        horarioId: horario.id,
                        aula: horario.aula,
                        modalidad: horario.modalidad,
                        horaInicio: horario.hora_inicio,
                        horaCierre: horario.hora_cierre
                    });
                }
            });
        }

        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    fechasSistema.sort((a, b) => a.fecha - b.fecha);
    actualizarSelectFechas();
}

// Actualizar el select con las fechas disponibles
function actualizarSelectFechas() {
    const select = document.getElementById('fecha_evaluacion_select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccione una fecha --</option>';

    if (fechasSistema.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.disabled = true;
        option.textContent = 'No hay fechas disponibles en este período';
        select.appendChild(option);
        return;
    }

    const fechasPorMes = agruparFechasPorMes(fechasSistema);

    for (const [mes, fechas] of Object.entries(fechasPorMes)) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = mes;

        fechas.forEach(fecha => {
            const option = document.createElement('option');

            // Guardar TODA la información relevante
            const optionData = {
                fecha: fecha.fechaStr,
                horarioId: fecha.horarioId,
                diaNumero: fecha.diaNumero,
                horaInicio: fecha.horaInicio,
                horaCierre: fecha.horaCierre
            };

            option.value = JSON.stringify(optionData);

            // Mostrar información completa en el texto
            const horaInicioFormateada = fecha.horaInicio ? fecha.horaInicio.substring(0, 5) : '';
            const horaCierreFormateada = fecha.horaCierre ? fecha.horaCierre.substring(0, 5) : '';

            option.textContent = `${fecha.fechaLocal} (${fecha.diaSemana}) - ${horaInicioFormateada} a ${horaCierreFormateada} - Aula: ${fecha.aula}`;

            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    }
}

// Función para obtener la fecha seleccionada con toda su información
function getFechaSeleccionada() {
    const select = document.getElementById('fecha_evaluacion_select');
    if (!select || !select.value) return null;

    try {
        return JSON.parse(select.value);
    } catch (e) {
        console.error('Error al parsear fecha seleccionada:', e);
        return null;
    }
}

function limitarHora(id_input) {
    input_cambiado = document.getElementById(id_input);
    if (id_input == 'hora_eval_inicio') {
        const input_hora_fin = document.getElementById('hora_eval_fin');
        if (input_cambiado.value >= input_hora_fin.value) {
            input_hora_fin.value = ''
        }
        input_hora_fin.min = input_cambiado.value
    }
    else if (id_input == 'hora_eval_fin') {
        const input_hora_inicio = document.getElementById('hora_eval_inicio');
        if (input_cambiado.value <= input_hora_inicio.value) {
            input_hora_inicio.value = ''
        }
        input_hora_inicio.max = input_cambiado.value
    }
}
// Función para agrupar fechas por mes
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
    // Tu formato: 0 = Lunes, 1 = Martes, ..., 6 = Domingo
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[diaNumero] || '';
}

function mostrarErrorFechas() {
    const select = document.getElementById('fecha_evaluacion_select');
    if (select) {
        select.innerHTML = '<option value="">Error al cargar fechas</option>';
    }

    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las fechas disponibles'
    });
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