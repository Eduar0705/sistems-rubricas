// =============================================
// VARIABLES GLOBALES PARA EVALUACIÓN
// =============================================
let evaluacionActual = null;
let criteriosData = [];
let seleccionesNiveles = {};
const seleccionesPorEvaluacion = {};
// =============================================
// MÓDULO DE EVALUACIÓN - MODAL
// =============================================
const EvaluacionModule = {
    // Abrir modal de evaluación
    async open(evaluacionId, cedulaEstudiante) {
        try {
            console.log('Abriendo modal para evaluación ID y Cedula:', evaluacionId, cedulaEstudiante);

            // Mostrar loading
            Swal.fire({
                title: 'Cargando evaluación...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Obtener datos de la evaluación
            const response = await fetch(`/api/evaluacion_estudiante/${evaluacionId}/${cedulaEstudiante}/detalles`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (data.success) {
                evaluacionActual = data.evaluacion;
                criteriosData = data.criterios;

                // Llenar información del modal
                this.llenarInformacion(data);

                // Mostrar modal
                const modal = document.getElementById('modalEvaluar');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    console.error('Modal #modalEvaluar no encontrado');
                }

                Swal.close();
            } else {
                Swal.fire('Error', data.message || 'No se pudo cargar la evaluación', 'error');
            }
        } catch (error) {
            console.error('Error al cargar evaluación:', error);
            Swal.fire('Error', 'Ocurrió un error al cargar la evaluación: ' + error.message, 'error');
        }
    },

    // Llenar información en el modal
    llenarInformacion(data) {
        const { evaluacion, criterios, estudiante, rubrica } = data;

        console.log('Llenando información del modal...');

        // Información del estudiante
        const iniciales = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
        this.setElementText('evalEstudianteAvatar', iniciales);
        this.setElementText('evalEstudianteNombre', `${estudiante.nombre} ${estudiante.apellido}`);
        this.setElementText('evalEstudianteCedula', `CI: ${estudiante.cedula}`);
        this.setElementText('evalEstudianteCarrera', estudiante.carrera);

        // Información de la rúbrica
        this.setElementText('evalRubricaNombre', rubrica.nombre_rubrica);
        this.setElementText('evalRubricaMateria', rubrica.materia);
        this.setElementText('evalRubricaTipo', rubrica.tipo_evaluacion);
        this.setElementText('evalRubricaPorcentaje', `${rubrica.porcentaje_evaluacion}%`);

        // Instrucciones
        const instruccionesCard = document.getElementById('instruccionesCard');
        if (rubrica.instrucciones && rubrica.instrucciones.trim() !== '') {
            instruccionesCard.style.display = 'block';
            this.setElementText('evalInstrucciones', rubrica.instrucciones);
        } else {
            instruccionesCard.style.display = 'none';
        }

        // Observaciones existentes
        const obsTextarea = document.getElementById('evalObservaciones');
        if (obsTextarea) {
            obsTextarea.value = evaluacion.observaciones || '';
        }

        // Cargar criterios
        this.cargarCriterios(criterios);

        // Calcular puntaje máximo
        const puntajeMaximo = criterios.reduce((sum, c) => sum + parseFloat(c.puntaje_maximo), 0);
        this.setElementText('puntajeMaximo', puntajeMaximo.toFixed(2));

        // Calcular calificación inicial (si hay datos precargados)
        this.calcularCalificacion();

        console.log('Información cargada correctamente');
    },

    // Helper para setear texto en elementos
    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Elemento #${id} no encontrado`);
        }
    },

    // Cargar criterios de evaluación
    cargarCriterios(criterios) {
        const container = document.getElementById('criteriosList');
        if (!container) {
            console.error('Container #criteriosList no encontrado');
            return;
        }

        container.innerHTML = '';
        seleccionesNiveles = {};

        console.log('Cargando', criterios.length, 'criterios');

        criterios.forEach(criterio => {
            // Verificar si hay un nivel seleccionado para este criterio
            const nivelSeleccionado = criterio.niveles.find(n => n.seleccionado);
            if (nivelSeleccionado) {
                seleccionesNiveles[criterio.id] = {
                    nivel_id: nivelSeleccionado.id,
                    puntaje: parseFloat(nivelSeleccionado.puntaje)
                };
            }

            const criterioCard = document.createElement('div');
            criterioCard.className = 'criterio-card';
            criterioCard.innerHTML = `
                <div class="criterio-header">
                    <div class="criterio-info">
                        <h5>${criterio.descripcion}</h5>
                    </div>
                    <div class="criterio-puntaje">
                        <i class="fas fa-star"></i> ${criterio.puntaje_maximo} pts
                    </div>
                </div>
                <div class="niveles-desempeno" id="niveles-${criterio.id}">
                    ${criterio.niveles.map(nivel => `
                        <div class="nivel-option">
                            <input 
                                type="radio" 
                                name="criterio-${criterio.id}" 
                                id="crit-${criterio.id}_nivel-${nivel.id}"
                                value="${nivel.id}"
                                data-puntaje="${nivel.puntaje}"
                                data-criterio="${criterio.id}"
                                ${nivel.seleccionado ? 'checked' : ''}
                                onchange="seleccionarNivel(${criterio.id}, ${nivel.id}, ${nivel.puntaje})">
                            <label for="crit-${criterio.id}_nivel-${nivel.id}" class="nivel-label">
                                <div class="nivel-nombre">
                                    <strong>${nivel.nombre}</strong>
                                    <span class="nivel-puntaje">${nivel.puntaje} pts</span>
                                </div>
                                <p class="nivel-descripcion">${nivel.descripcion}</p>
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(criterioCard);
        });
    },

    // Seleccionar nivel de desempeño
    seleccionarNivel(criterioId, nivelId, puntaje) {
        console.log('Nivel seleccionado:', { criterioId, nivelId, puntaje });

        seleccionesNiveles[criterioId] = {
            nivel_id: nivelId,
            puntaje: parseFloat(puntaje)
        };

        this.calcularCalificacion();
    },

    // Calcular calificación total - SOBRE 100
    calcularCalificacion() {
        const puntajeObtenido = Object.values(seleccionesNiveles)
            .reduce((sum, sel) => sum + sel.puntaje, 0);

        const puntajeMaximo = parseFloat(document.getElementById('puntajeMaximo').textContent);

        // Calcular calificación directamente sobre 100
        const calificacionFinal = puntajeMaximo > 0 ? (puntajeObtenido / puntajeMaximo) * 100 : 0;

        console.log('Cálculo:', {
            puntajeObtenido,
            puntajeMaximo,
            calificacionFinal: calificacionFinal.toFixed(2)
        });

        document.getElementById('puntajeObtenido').textContent = puntajeObtenido.toFixed(2);
        document.getElementById('calificacionFinal').textContent = calificacionFinal.toFixed(2);
    },

    // Reprobar estudiante
    async reprobar() {
        console.log('Reprobando estudiante...');

        if (!evaluacionActual || !evaluacionActual.id) {
            Swal.fire('Error', 'No se pudo obtener la información de la evaluación actual', 'error');
            return;
        }

        // Confirmar acción de reprobar
        const result = await Swal.fire({
            title: '¿Reprobar estudiante?',
            html: `
                <p><strong>Esta acción marcará al estudiante como reprobado</strong></p>
                <p>Calificación: <strong>0.25/100</strong></p>
                <p>Todos los criterios se marcarán como "Insuficiente"</p>
                <p><small class="text-muted">Esta evaluación podrá ser editada posteriormente</small></p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reprobar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        });

        if (!result.isConfirmed) return;

        // Mostrar loading
        Swal.fire({
            title: 'Guardando evaluación...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // Crear detalles para cada criterio usando el nivel "Insuficiente" de cada uno
            const detalles = criteriosData.map(criterio => {
                // Buscar el nivel "Insuficiente" para este criterio
                // Primero intenta por nombre, luego por el puntaje mínimo
                let nivelInsuficiente = criterio.niveles.find(n =>
                    n.nombre.toLowerCase().includes('insuficiente')
                );

                // Si no encuentra por nombre, busca el nivel con menor puntaje
                if (!nivelInsuficiente) {
                    nivelInsuficiente = criterio.niveles.reduce((min, nivel) =>
                        parseFloat(nivel.puntaje) < parseFloat(min.puntaje) ? nivel : min
                    );
                }

                if (!nivelInsuficiente) {
                    throw new Error(`No se encontró nivel insuficiente para criterio ${criterio.id}`);
                }

                return {
                    criterio_id: criterio.id,
                    nivel_id: nivelInsuficiente.id,
                    puntaje_obtenido: 0.25
                };
            });

            const payload = {
                observaciones: 'REPROBADO - Estudiante no cumplió con los requisitos mínimos',
                puntaje_total: 0.25,
                detalles: detalles
            };

            console.log('Enviando datos de reprobación:', payload);

            const response = await fetch(`/api/evaluacion/${evaluacionActual.id}/guardar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Estudiante Reprobado',
                    html: `
                        <p>La evaluación ha sido guardada correctamente</p>
                        <p>Calificación: <strong>0.25/100</strong></p>
                    `,
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    this.close();
                    location.reload();
                });
            } else {
                Swal.fire('Error', data.message || 'No se pudo guardar la evaluación', 'error');
            }
        } catch (error) {
            console.error('Error al reprobar estudiante:', error);
            Swal.fire('Error', 'Ocurrió un error al guardar la evaluación: ' + error.message, 'error');
        }
    },

    // Guardar evaluación
    async guardar() {
        console.log('Intentando guardar evaluación...');

        if (!evaluacionActual || !evaluacionActual.id) {
            Swal.fire('Error', 'No se pudo obtener la información de la evaluación actual', 'error');
            return;
        }

        // Validar que todos los criterios estén evaluados
        const criteriosEvaluados = Object.keys(seleccionesNiveles).length;
        const totalCriterios = criteriosData.length;

        console.log(`Criterios evaluados: ${criteriosEvaluados}/${totalCriterios}`);

        if (criteriosEvaluados < totalCriterios) {
            Swal.fire({
                icon: 'warning',
                title: 'Evaluación incompleta',
                text: `Debe evaluar todos los criterios. Faltan ${totalCriterios - criteriosEvaluados} criterio(s)`,
                confirmButtonColor: '#667eea',
                zIndex: 9999
            });
            return;
        }

        // Obtener valores
        const observacionesElement = document.getElementById('evalObservaciones');
        const calificacionFinalElement = document.getElementById('calificacionFinal');

        if (!observacionesElement || !calificacionFinalElement) {
            Swal.fire('Error', 'No se pudieron obtener los datos de la evaluación', 'error');
            return;
        }

        const puntajeTotal = parseFloat(calificacionFinalElement.textContent);

        if (isNaN(puntajeTotal)) {
            Swal.fire('Error', 'No se pudo calcular la calificación final', 'error');
            return;
        }

        // Confirmar guardado
        const result = await Swal.fire({
            title: '¿Guardar evaluación?',
            html: `
                <p>Calificación: <strong>${puntajeTotal.toFixed(2)}/100</strong></p>
                <p><small>La calificación quedará registrada</small></p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#667eea'
        });

        if (!result.isConfirmed) return;

        // Mostrar loading
        Swal.fire({
            title: 'Guardando evaluación...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // Preparar datos de los detalles
            const detalles = criteriosData.map(criterio => {
                const seleccion = seleccionesNiveles[criterio.id];
                if (!seleccion) {
                    throw new Error(`No se encontró selección para criterio ${criterio.id}`);
                }
                return {
                    criterio_id: criterio.id,
                    nivel_id: seleccion.nivel_id,
                    puntaje_obtenido: seleccion.puntaje
                };
            });

            const payload = {
                observaciones: observacionesElement.value || '',
                puntaje_total: puntajeTotal,
                detalles: detalles
            };

            console.log('Enviando datos:', payload);

            const response = await fetch(`/api/evaluacion/${evaluacionActual.id}/guardar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Evaluación guardada!',
                    html: `
                        <p>Calificación: <strong>${puntajeTotal.toFixed(2)}/100</strong> puntos</p>
                    `,
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    this.close();
                    location.reload();
                });
            } else {
                Swal.fire('Error', data.message || 'No se pudo guardar la evaluación', 'error');
            }
        } catch (error) {
            console.error('Error al guardar evaluación:', error);
            Swal.fire('Error', 'Ocurrió un error al guardar la evaluación: ' + error.message, 'error');
        }
    },

    // Cerrar modal de evaluación
    close() {
        console.log('Cerrando modal...');
        const modal = document.getElementById('modalEvaluar');
        if (modal) {
            modal.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
        evaluacionActual = null;
        criteriosData = [];
        seleccionesNiveles = {};
    }
};

// =============================================
// FUNCIONES GLOBALES (Compatibilidad con HTML)
// =============================================
function openModalEvaluar(evaluacionId, cedulaEstudiante) {
    console.log('openModalEvaluar llamado con ID y Cedula:', evaluacionId, cedulaEstudiante);
    EvaluacionModule.open(evaluacionId, cedulaEstudiante);
}

function evaluar(evaluacionId, cedulaEstudiante) {
    console.log('evaluar llamado con ID:', evaluacionId, cedulaEstudiante);
    EvaluacionModule.open(evaluacionId, cedulaEstudiante);
}

function closeModalEvaluar() {
    EvaluacionModule.close();
}

function seleccionarNivel(criterioId, nivelId, puntaje) {
    EvaluacionModule.seleccionarNivel(criterioId, nivelId, puntaje);
}

function guardarEvaluacion() {
    EvaluacionModule.guardar();
}

function reprobarEstudiante() {
    EvaluacionModule.reprobar();
}

function verDetalles(evaluacionId, cedulaEstudiante) {
    openModalDetalles(evaluacionId, cedulaEstudiante);
}

// =============================================
// MODAL DE VER DETALLES
// =============================================
async function openModalDetalles(evaluacionId, cedulaEstudiante) {
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
        const response = await fetch(`/api/evaluacion_estudiante/${evaluacionId}/${cedulaEstudiante}/detalles`);
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

    const evaluacion = data.evaluacion;
    const estudiante = data.estudiante;
    const rubrica = data.rubrica;
    const criterios = data.criterios;

    // Información del estudiante
    const estudianteIniciales = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();

    // Calcular calificación total
    let calificacionTotal = 0;
    let criteriosHtml = '';

    if (criterios && criterios.length > 0) {
        criterios.forEach(criterio => {
            const nivelSeleccionado = criterio.niveles.find(n => n.seleccionado);
            const puntaje = nivelSeleccionado ? nivelSeleccionado.puntaje : 0;
            calificacionTotal += puntaje;

            criteriosHtml += `
                <div class="criterio-card-detalles">
                    <div class="criterio-header-detalles">
                        <div class="criterio-info-detalles">
                            <h5>${criterio.nombre}</h5>
                            <div class="criterio-puntaje-detalles">${puntaje} pts</div>
                        </div>
                    </div>
                    ${nivelSeleccionado ? `
                        <div class="nivel-seleccionado">
                            <div class="nivel-nombre-detalles">
                                <strong>${nivelSeleccionado.nombre}</strong>
                                <div class="nivel-puntaje-detalles">${nivelSeleccionado.puntaje} pts</div>
                            </div>
                            <div class="nivel-descripcion-detalles">${nivelSeleccionado.descripcion}</div>
                        </div>
                    ` : '<p class="text-muted">No evaluado</p>'}
                </div>
            `;
        });
    }

    const html = `
        <div class="detalles-evaluacion">
            <!-- Información del estudiante -->
            <div class="estudiante-info-detalles">
                <div class="estudiante-avatar-detalles">${estudianteIniciales}</div>
                <div class="estudiante-datos-detalles">
                    <h3>${estudiante.nombre} ${estudiante.apellido}</h3>
                    <p>CI: ${estudiante.cedula}</p>
                    <div class="badge-carrera-detalles">${estudiante.carrera}</div>
                </div>
            </div>

            <!-- Información de la rúbrica -->
            <div class="rubrica-info-detalles">
                <div class="rubrica-info-header-detalles">
                    <i class="fas fa-clipboard-list"></i>
                    <h4>${rubrica.nombre_rubrica}</h4>
                </div>
                <div class="rubrica-info-details-detalles">
                    <div class="rubrica-detail-detalles">
                        <div class="detail-label-detalles">Materia</div>
                        <div class="detail-value-detalles">${rubrica.materia}</div>
                    </div>
                    <div class="rubrica-detail-detalles">
                        <div class="detail-label-detalles">Tipo de Evaluación</div>
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
                    <h4>Desglose de Evaluación</h4>
                </div>
                <div class="criterios-list-detalles">
                    ${criteriosHtml}
                </div>
            </div>

            <!-- Observaciones -->
            <div class="observaciones-detalles">
                <div class="observaciones-title-detalles">
                    <i class="fas fa-comment"></i>
                    <h4>Observaciones</h4>
                </div>
                <p class="observaciones-text-detalles">${evaluacion.observaciones || 'Sin observaciones'}</p>
            </div>

            <!-- Calificación Final -->
            <div class="calificacion-final-detalles">
                <div class="calificacion-label-detalles">Calificación Final</div>
                <div class="calificacion-value-detalles">${(parseFloat(evaluacion.puntaje_total) || 0).toFixed(2)}/100</div>
            </div>
        </div>
    `;

    modalBody.innerHTML = html;
}

// =============================================
// PAGINACIÓN Y BÚSQUEDA
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const ITEMS_PER_PAGE = 3;
    const rubricaBlocks = document.querySelectorAll('.rubrica-block');
    const searchInput = document.getElementById('searchInput');

    // Inicializar paginación por cada bloque de rúbrica
    rubricaBlocks.forEach(block => {
        const grid = block.querySelector('.evaluaciones-grid-mini');
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll('.evaluacion-card'));

        // Si hay 3 o menos tarjetas, no necesitamos paginación
        if (cards.length <= ITEMS_PER_PAGE) return;

        // Crear controles de paginación
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'rubrica-pagination';
        paginationContainer.innerHTML = `
            <button class="page-btn prev-btn" disabled title="Anterior">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">1 / ${Math.ceil(cards.length / ITEMS_PER_PAGE)}</span>
            <button class="page-btn next-btn" title="Siguiente">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        block.appendChild(paginationContainer);

        // Estado local de este bloque
        let currentPage = 1;
        const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE);
        const prevBtn = paginationContainer.querySelector('.prev-btn');
        const nextBtn = paginationContainer.querySelector('.next-btn');
        const pageInfo = paginationContainer.querySelector('.page-info');

        // Función para actualizar la visualización
        block.updatePaginationDisplay = function () {
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;

            cards.forEach((card, index) => {
                if (index >= start && index < end) {
                    card.style.display = 'flex';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            });

            pageInfo.textContent = `${currentPage} / ${totalPages}`;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            paginationContainer.style.display = 'flex';
        };

        // Event Listeners para botones
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                block.updatePaginationDisplay();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                block.updatePaginationDisplay();
            }
        });

        // Inicializar vista
        block.updatePaginationDisplay();
    });

    // Lógica de Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const term = e.target.value.toLowerCase().trim();

            if (term.length > 0) {
                // MODO BÚSQUEDA: Ocultar paginación y filtrar globalmente
                document.querySelectorAll('.rubrica-pagination').forEach(p => p.style.display = 'none');

                document.querySelectorAll('.evaluacion-card').forEach(card => {
                    const nombre = card.dataset.estudiante ? card.dataset.estudiante.toLowerCase() : '';
                    const cedula = card.dataset.cedula ? card.dataset.cedula.toString() : '';

                    if (nombre.includes(term) || cedula.includes(term)) {
                        card.style.display = 'flex';
                        let parent = card.parentElement;
                        while (parent && !parent.classList.contains('hierarchy-container')) {
                            parent.style.display = '';
                            parent = parent.parentElement;
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else {
                // MODO NORMAL: Restaurar paginación
                rubricaBlocks.forEach(block => {
                    if (block.updatePaginationDisplay) {
                        block.updatePaginationDisplay();
                    } else {
                        const cards = block.querySelectorAll('.evaluacion-card');
                        cards.forEach(card => card.style.display = 'flex');
                    }
                });
            }
        });
    }
});