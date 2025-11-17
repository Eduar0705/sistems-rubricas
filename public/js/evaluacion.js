// =============================================
// MÓDULO DE FILTRADO Y BÚSQUEDA
// =============================================
const FiltradoModule = {
    init() {
        this.attachEventListeners();
    },

    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const filterRubrica = document.getElementById('filterRubrica');
        const filterEstado = document.getElementById('filterEstado');

        if (searchInput) searchInput.addEventListener('input', () => this.filtrar());
        if (filterRubrica) filterRubrica.addEventListener('change', () => this.filtrar());
        if (filterEstado) filterEstado.addEventListener('change', () => this.filtrar());
    },

    filtrar() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const rubricaFilter = document.getElementById('filterRubrica').value;
        const estadoFilter = document.getElementById('filterEstado').value;
        const cards = document.querySelectorAll('.evaluacion-card');

        cards.forEach(card => {
            const estudiante = card.dataset.estudiante.toLowerCase();
            const rubrica = card.dataset.rubrica;
            const estado = card.dataset.estado;

            const matchSearch = estudiante.includes(searchTerm);
            const matchRubrica = !rubricaFilter || rubrica === rubricaFilter;
            const matchEstado = !estadoFilter || estado === estadoFilter;

            card.style.display = (matchSearch && matchRubrica && matchEstado) ? 'block' : 'none';
        });

        // Reinicializar paginación después de filtrar
        setTimeout(() => PaginationModule.initialize(), 100);
    }
};

// =============================================
// MÓDULO DE PAGINACIÓN
// =============================================
const PaginationModule = {
    state: {},
    itemsPerPage: 3,

    initialize() {
        const seccionGroups = document.querySelectorAll('.seccion-group');
        
        seccionGroups.forEach((group, index) => {
            const seccionId = `seccion-${index}`;
            group.dataset.seccionId = seccionId;
            
            const evaluacionCards = Array.from(group.querySelectorAll('.evaluacion-card'));
            const visibleCards = evaluacionCards.filter(card => card.style.display !== 'none');
            
            this.state[seccionId] = {
                currentPage: 1,
                itemsPerPage: this.itemsPerPage,
                totalItems: visibleCards.length,
                totalPages: Math.ceil(visibleCards.length / this.itemsPerPage),
                evaluaciones: visibleCards
            };
            
            this.createUI(group, seccionId);
            this.showPage(seccionId, 1);
        });
    },

    createUI(group, seccionId) {
        const state = this.state[seccionId];
        
        if (state.totalPages <= 1) return;
        
        const evaluacionesContainer = group.querySelector('.seccion-evaluaciones');
        
        // Crear contenedor
        const container = document.createElement('div');
        container.className = 'evaluaciones-container';
        container.dataset.seccionId = seccionId;
        
        state.evaluaciones.forEach(card => container.appendChild(card));
        
        evaluacionesContainer.innerHTML = '';
        evaluacionesContainer.appendChild(container);
        
        // Crear controles
        const paginationControls = document.createElement('div');
        paginationControls.className = 'pagination-controls';
        paginationControls.innerHTML = `
            <button class="pagination-btn" onclick="PaginationModule.changePage('${seccionId}', -1)" data-action="prev">
                <i class="fas fa-chevron-left"></i>
                Anterior
            </button>
            
            <div class="pagination-info">
                <i class="fas fa-file-alt"></i>
                Página <span class="current-page">1</span> de ${state.totalPages}
            </div>
            
            <div class="pagination-dots">
                ${Array.from({length: state.totalPages}, (_, i) => 
                    `<div class="pagination-dot ${i === 0 ? 'active' : ''}" 
                        onclick="PaginationModule.showPage('${seccionId}', ${i + 1})"></div>`
                ).join('')}
            </div>
            
            <button class="pagination-btn" onclick="PaginationModule.changePage('${seccionId}', 1)" data-action="next">
                Siguiente
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        evaluacionesContainer.appendChild(paginationControls);
    },

    showPage(seccionId, pageNumber) {
        const state = this.state[seccionId];
        
        if (!state || pageNumber < 1 || pageNumber > state.totalPages) return;
        
        state.currentPage = pageNumber;
        
        const startIndex = (pageNumber - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        
        const group = document.querySelector(`[data-seccion-id="${seccionId}"]`);
        const container = group.querySelector('.evaluaciones-container');
        
        container.classList.add('fade-out');
        
        setTimeout(() => {
            state.evaluaciones.forEach((card, index) => {
                card.style.display = (index >= startIndex && index < endIndex) ? 'block' : 'none';
            });
            
            this.updateUI(seccionId);
            
            container.classList.remove('fade-out');
            container.classList.add('fade-in');
            
            setTimeout(() => container.classList.remove('fade-in'), 300);
        }, 150);
    },

    changePage(seccionId, direction) {
        const state = this.state[seccionId];
        const newPage = state.currentPage + direction;
        
        if (newPage >= 1 && newPage <= state.totalPages) {
            this.showPage(seccionId, newPage);
        }
    },

    updateUI(seccionId) {
        const state = this.state[seccionId];
        const group = document.querySelector(`[data-seccion-id="${seccionId}"]`);
        
        const pageNumber = group.querySelector('.current-page');
        if (pageNumber) pageNumber.textContent = state.currentPage;
        
        const prevBtn = group.querySelector('[data-action="prev"]');
        const nextBtn = group.querySelector('[data-action="next"]');
        
        if (prevBtn) prevBtn.disabled = state.currentPage === 1;
        if (nextBtn) nextBtn.disabled = state.currentPage === state.totalPages;
        
        const dots = group.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === state.currentPage - 1);
        });
    }
};

// =============================================
// MÓDULO DE MODAL AGREGAR EVALUACIÓN
// =============================================
const ModalAddEvaluacionModule = {
    estudiantesSeleccionados: [],

    open() {
        document.getElementById('modalAddEvaluacion').classList.add('active');
        document.body.style.overflow = 'hidden';
        this.cargarRubricas();
        this.cargarCarreras();
    },

    close() {
        document.getElementById('modalAddEvaluacion').classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('formAddEvaluacion').reset();
        document.getElementById('rubricaInfo').style.display = 'none';
        document.getElementById('materia_codigo').disabled = true;
        document.getElementById('seccion_id').disabled = true;
        document.getElementById('estudiantesPreview').innerHTML = 
            '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione carrera, materia y sección para cargar estudiantes</div>';
        document.getElementById('btnGuardarEvaluacion').disabled = true;
        this.estudiantesSeleccionados = [];
    },

    async cargarRubricas() {
        try {
            const response = await fetch('/api/teacher/rubricas/activas');
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
    },

    async cargarCarreras() {
        try {
            const response = await fetch('/api/teacher/carreras');
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
    },

    mostrarInfoRubrica(rubrica) {
        document.getElementById('rubricaMateria').textContent = rubrica.materia_nombre;
        document.getElementById('rubricaTipo').textContent = rubrica.tipo_evaluacion;
        document.getElementById('rubricaPorcentaje').textContent = rubrica.porcentaje_evaluacion + '%';
        document.getElementById('rubricaModalidad').textContent = rubrica.modalidad + 
            (rubrica.cantidad_personas > 1 ? ` (${rubrica.cantidad_personas} personas)` : '');
        document.getElementById('rubricaInfo').style.display = 'block';
    },

    async cargarMaterias(carreraCodigo) {
        try {
            const response = await fetch(`/api/teacher/carrera/${carreraCodigo}/materias`);
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
    },

    async cargarSecciones(materiaCodigo) {
        try {
            const response = await fetch(`/api/teacher/materia/${materiaCodigo}/secciones`);
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
    },

    async cargarEstudiantes(seccionId) {
        document.getElementById('estudiantesPreview').innerHTML = 
            '<div class="loading-estudiantes"><i class="fas fa-spinner fa-spin"></i> Cargando estudiantes...</div>';
        
        try {
            const response = await fetch(`/api/teacher/seccion/${seccionId}/estudiantes`);
            const data = await response.json();
            
            if (data.success && data.estudiantes.length > 0) {
                this.estudiantesSeleccionados = data.estudiantes.map(e => e.cedula);
                this.mostrarEstudiantes(data.estudiantes);
            } else {
                document.getElementById('estudiantesPreview').innerHTML = 
                    '<div class="loading-estudiantes"><i class="fas fa-exclamation-circle"></i> No hay estudiantes inscritos en esta sección</div>';
                this.estudiantesSeleccionados = [];
            }
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            document.getElementById('estudiantesPreview').innerHTML = 
                '<div class="loading-estudiantes"><i class="fas fa-exclamation-triangle"></i> Error al cargar estudiantes</div>';
            this.estudiantesSeleccionados = [];
        }
        this.verificarFormularioCompleto();
    },

    mostrarEstudiantes(estudiantes) {
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
        document.getElementById('estudiantesPreview').innerHTML = html;
    },

    verificarFormularioCompleto() {
        const rubricaId = document.getElementById('rubrica_id').value;
        const btnGuardar = document.getElementById('btnGuardarEvaluacion');
        
        btnGuardar.disabled = !(rubricaId && this.estudiantesSeleccionados.length > 0);
    },

    async guardar() {
        const rubricaIdElement = document.getElementById('rubrica_id');
        if (!rubricaIdElement) {
            Swal.fire('Error', 'No se pudo obtener el campo de rúbrica', 'error');
            return;
        }
        const rubricaId = rubricaIdElement.value;

        const observacionesElement = document.getElementById('observaciones');
        if (!observacionesElement) {
            Swal.fire('Error', 'No se pudo obtener el campo de observaciones', 'error');
            return;
        }
        const observaciones = observacionesElement.value;

        if (!rubricaId) {
            Swal.fire('Error', 'Debe seleccionar una rúbrica', 'error');
            return;
        }

        if (this.estudiantesSeleccionados.length === 0) {
            Swal.fire('Error', 'No hay estudiantes seleccionados', 'error');
            return;
        }

        const result = await Swal.fire({
            title: '¿Crear evaluaciones?',
            html: `Se crearán <strong>${this.estudiantesSeleccionados.length}</strong> evaluación(es)`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, crear',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#667eea',
            zIndex: 9999
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: 'Creando evaluaciones...',
            html: 'Por favor espere...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch('/api/teacher/evaluaciones/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rubrica_id: rubricaId,
                    estudiantes: this.estudiantesSeleccionados,
                    observaciones: observaciones
                })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Evaluaciones creadas!',
                    html: `Se crearon <strong>${data.cantidad}</strong> evaluación(es) correctamente`,
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    this.close();
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
};

// =============================================
// FUNCIONES GLOBALES (Legacy Support)
// =============================================
function verDetalles(evaluacionId) {
    openModalDetalles(evaluacionId);
}

// Funciones del modal de detalles
async function openModalDetalles(evaluacionId) {
    const modal = document.getElementById('modalVerDetalles');
    const modalBody = modal.querySelector('.modal-body-detalles');

    if (!modal) {
        console.warn('Modal #modalVerDetalles no encontrado en el DOM');
        return;
    }

    // Mostrar loading
    modalBody.innerHTML = `
        <div class="loading-detalles">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando detalles de la evaluación...</p>
        </div>
    `;

    // Mostrar modal
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
                    <p>Error: ${data.message}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        modalBody.innerHTML = `
            <div class="loading-detalles">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los detalles de la evaluación</p>
            </div>
        `;
    }
}

function closeModalDetalles() {
    const modal = document.getElementById('modalVerDetalles');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function mostrarDetallesEvaluacion(data) {
    const modalBody = document.getElementById('modalVerDetalles').querySelector('.modal-body-detalles');

    const evaluacion = data.evaluacion;
    const estudiante = data.estudiante;
    const rubrica = data.rubrica;
    const criterios = data.criterios;

    // Calcular total de puntos posibles
    const totalPosible = criterios.reduce((sum, criterio) => sum + criterio.puntaje_maximo, 0);

    let html = `
        <div class="detalles-evaluacion">
            <!-- Información del estudiante -->
            <div class="estudiante-info-detalles">
                <div class="estudiante-avatar-detalles">
                    ${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}
                </div>
                <div class="estudiante-datos-detalles">
                    <h3>${estudiante.nombre} ${estudiante.apellido}</h3>
                    <p><i class="fas fa-id-card"></i> ${estudiante.cedula}</p>
                    <p><i class="fas fa-envelope"></i> ${estudiante.email}</p>
                    <div class="badge-carrera-detalles">${estudiante.carrera}</div>
                </div>
            </div>

            <!-- Información de la rúbrica -->
            <div class="rubrica-info-detalles">
                <div class="rubrica-info-header-detalles">
                    <i class="fas fa-clipboard-list"></i>
                    <h4>Información de la Rúbrica</h4>
                </div>
                <div class="rubrica-info-details-detalles">
                    <div class="rubrica-detail-detalles">
                        <div class="detail-label-detalles">Rúbrica</div>
                        <div class="detail-value-detalles">${rubrica.nombre_rubrica}</div>
                    </div>
                    <div class="rubrica-detail-detalles">
                        <div class="detail-label-detalles">Materia</div>
                        <div class="detail-value-detalles">${rubrica.materia}</div>
                    </div>
                    <div class="rubrica-detail-detalles">
                        <div class="detail-label-detalles">Tipo</div>
                        <div class="detail-value-detalles">${rubrica.tipo_evaluacion}</div>
                    </div>
                    <div class="rubrica-detail-detalles">
                        <div class="detail-label-detalles">Porcentaje</div>
                        <div class="detail-value-detalles">${rubrica.porcentaje_evaluacion}%</div>
                    </div>
                </div>
            </div>

            <!-- Criterios evaluados -->
            <div class="criterios-evaluados">
                <div class="criterios-title-detalles">
                    <i class="fas fa-tasks"></i>
                    <h4>Criterios Evaluados</h4>
                </div>
    `;

    criterios.forEach(criterio => {
        const nivelSeleccionado = criterio.niveles.find(n => n.seleccionado);
        const puntajeObtenido = nivelSeleccionado ? nivelSeleccionado.puntaje : 0;

        html += `
            <div class="criterio-card-detalles">
                <div class="criterio-header-detalles">
                    <div class="criterio-info-detalles">
                        <h5>${criterio.nombre}</h5>
                    </div>
                    <div class="criterio-puntaje-detalles">
                        ${puntajeObtenido} / ${criterio.puntaje_maximo} pts
                    </div>
                </div>
        `;

        if (nivelSeleccionado) {
            html += `
                <div class="nivel-seleccionado">
                    <div class="nivel-nombre-detalles">
                        <strong>${nivelSeleccionado.nombre}</strong>
                        <div class="nivel-puntaje-detalles">${nivelSeleccionado.puntaje} pts</div>
                    </div>
                    <div class="nivel-descripcion-detalles">${nivelSeleccionado.descripcion}</div>
                </div>
            `;
        }

        html += `</div>`;
    });

    html += `
            </div>

            <!-- Resumen de calificación -->
            <div class="calificacion-resumen-detalles">
                <div class="calificacion-item-detalles">
                    <span class="calificacion-label-detalles">Puntuación Total:</span>
                    <span class="calificacion-value-detalles">${evaluacion.puntaje_total} / ${totalPosible} puntos</span>
                </div>
                <div class="calificacion-total-detalles">
                    <span class="calificacion-label-detalles">Calificación Final:</span>
                    <span class="calificacion-final-detalles">${evaluacion.puntaje_total}</span>
                </div>
            </div>
    `;

    // Observaciones si existen
    if (evaluacion.observaciones && evaluacion.observaciones.trim()) {
        html += `
            <div class="observaciones-detalles">
                <div class="observaciones-header-detalles">
                    <i class="fas fa-comment"></i>
                    <h4>Observaciones</h4>
                </div>
                <div class="observaciones-text-detalles">${evaluacion.observaciones}</div>
            </div>
        `;
    }

    // Fecha de evaluación
    if (evaluacion.fecha_evaluacion) {
        const fecha = new Date(evaluacion.fecha_evaluacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        html += `
            <div class="fecha-evaluacion-detalles">
                <i class="fas fa-calendar"></i>
                Evaluación realizada el ${fecha}
            </div>
        `;
    }

    html += `</div>`;

    modalBody.innerHTML = html;
}

function evaluar(evaluacionId) {
    openModalEvaluar(evaluacionId);
}

function openModalEvaluacion() {
    ModalAddEvaluacionModule.open();
}

function closeModalEvaluacion() {
    ModalAddEvaluacionModule.close();
}



// =============================================
// EVENT LISTENERS
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulos
    FiltradoModule.init();
    PaginationModule.initialize();

    // Event listeners para modal de agregar evaluación
    const rubricaSelect = document.getElementById('rubrica_id');
    if (rubricaSelect) {
        rubricaSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            
            if (selectedOption.value) {
                const rubrica = JSON.parse(selectedOption.dataset.rubrica);
                ModalAddEvaluacionModule.mostrarInfoRubrica(rubrica);
            } else {
                document.getElementById('rubricaInfo').style.display = 'none';
            }
            ModalAddEvaluacionModule.verificarFormularioCompleto();
        });
    }

    const carreraSelect = document.getElementById('carrera_codigo');
    if (carreraSelect) {
        carreraSelect.addEventListener('change', async function() {
            const carreraCodigo = this.value;
            const materiaSelect = document.getElementById('materia_codigo');
            const seccionSelect = document.getElementById('seccion_id');
            
            if (carreraCodigo) {
                materiaSelect.disabled = false;
                await ModalAddEvaluacionModule.cargarMaterias(carreraCodigo);
                
                materiaSelect.value = '';
                seccionSelect.disabled = true;
                seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
                document.getElementById('estudiantesPreview').innerHTML = 
                    '<div class="loading-estudiantes"><i class="fas fa-info-circle"></i> Seleccione materia y sección</div>';
            } else {
                materiaSelect.disabled = true;
                materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';
                seccionSelect.disabled = true;
                seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
            }
            ModalAddEvaluacionModule.verificarFormularioCompleto();
        });
    }

    const materiaSelect = document.getElementById('materia_codigo');
    if (materiaSelect) {
        materiaSelect.addEventListener('change', async function() {
            const materiaCodigo = this.value;
            const seccionSelect = document.getElementById('seccion_id');
            
            if (materiaCodigo) {
                seccionSelect.disabled = false;
                await ModalAddEvaluacionModule.cargarSecciones(materiaCodigo);
            } else {
                seccionSelect.disabled = true;
                seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
            }
            ModalAddEvaluacionModule.verificarFormularioCompleto();
        });
    }

    const seccionSelect = document.getElementById('seccion_id');
    if (seccionSelect) {
        seccionSelect.addEventListener('change', async function() {
            if (this.value) {
                await ModalAddEvaluacionModule.cargarEstudiantes(this.value);
            }
            ModalAddEvaluacionModule.verificarFormularioCompleto();
        });
    }

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modalAdd = document.getElementById('modalAddEvaluacion');
            const modalEval = document.getElementById('modalEvaluar');
            
            if (modalAdd && modalAdd.classList.contains('active')) {
                closeModalEvaluacion();
            }
            
            if (modalEval && modalEval.classList.contains('active')) {
                closeModalEvaluar();
            }
        }
    });

    // Cerrar modal al hacer clic fuera
    document.getElementById('modalAddEvaluacion')?.addEventListener('click', function(event) {
        if (event.target === this) closeModalEvaluacion();
    });
});