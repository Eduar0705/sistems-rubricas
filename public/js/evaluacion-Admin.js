        // Variables globales
        let estudiantesSeleccionados = [];

        // Función para filtrar evaluaciones
        function filtrarEvaluaciones() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            const rubricaFilter = document.getElementById('filterRubrica').value;
            const estadoFilter = document.getElementById('filterEstado').value;
            const cards = document.querySelectorAll('.evaluacion-card');
            let visibleCount = 0;

            cards.forEach(card => {
                // Obtener datos del dataset
                const estudiante = card.dataset.estudiante.toLowerCase();
                const rubrica = card.dataset.rubrica;
                const estado = card.dataset.estado;

                // Obtener texto adicional visible en la card
                const studentId = card.querySelector('.student-id')?.textContent.toLowerCase() || '';
                const materiaText = card.querySelector('.evaluacion-rubrica')?.textContent.toLowerCase() || '';

                // Filtrado de búsqueda más preciso
                let matchSearch = true;
                if (searchTerm !== '') {
                    // Buscar en nombre del estudiante, ID, rúbrica y materia
                    const searchFields = [estudiante, studentId, rubrica.toLowerCase(), materiaText];
                    const searchWords = searchTerm.split(' ').filter(word => word.length > 0);

                    matchSearch = searchWords.every(word =>
                        searchFields.some(field => field.includes(word))
                    );
                }

                // Filtros por rúbrica y estado
                const matchRubrica = !rubricaFilter || rubrica === rubricaFilter;
                const matchEstado = !estadoFilter || estado === estadoFilter;

                // Determinar visibilidad
                const isVisible = matchSearch && matchRubrica && matchEstado;
                card.style.display = isVisible ? 'block' : 'none';

                if (isVisible) visibleCount++;
            });

            const hasActiveFilter = searchTerm !== '' || rubricaFilter !== '' || estadoFilter !== '';

            // Ocultar secciones completas sin resultados
            const seccionGroups = document.querySelectorAll('.seccion-group');
            seccionGroups.forEach(group => {
                const groupCards = group.querySelectorAll('.evaluacion-card');
                const hasVisibleCard = Array.from(groupCards).some(card => card.style.display !== 'none');

                // Mostrar solo las secciones que tienen resultados
                group.style.display = hasVisibleCard ? 'block' : 'none';
            });

            // Actualizar mensaje cuando no hay resultados
            const evaluacionesGrid = document.querySelector('.evaluaciones-grid');
            let emptyMessage = evaluacionesGrid.querySelector('.empty-search-message');

            if (visibleCount === 0 && hasActiveFilter) {
                if (!emptyMessage) {
                    emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-search-message';
                    emptyMessage.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <h3>No se encontraron evaluaciones</h3>
                            <p>No hay evaluaciones que coincidan con los filtros aplicados</p>
                        </div>
                    `;
                    evaluacionesGrid.appendChild(emptyMessage);
                }
                emptyMessage.style.display = 'block';
            } else {
                if (emptyMessage) {
                    emptyMessage.style.display = 'none';
                }
            }
        }

        // Event listeners para los filtros
        document.getElementById('searchInput')?.addEventListener('input', filtrarEvaluaciones);
        document.getElementById('filterRubrica')?.addEventListener('change', filtrarEvaluaciones);
        document.getElementById('filterEstado')?.addEventListener('change', filtrarEvaluaciones);

        // Funciones para los botones
        function verDetalles(evaluacionId) {
            window.location.href = `/admin/evaluacion/${evaluacionId}`;
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
                if (modal.classList.contains('active')) {
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

        // Objeto para manejar la paginación de cada sección
        const paginationState = {};

        // Inicializar paginación al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            initializePagination();
        });

        function initializePagination() {
            const seccionGroups = document.querySelectorAll('.seccion-group');
            
            seccionGroups.forEach((group, index) => {
                const seccionId = `seccion-${index}`;
                group.dataset.seccionId = seccionId;
                
                const evaluacionCards = group.querySelectorAll('.evaluacion-card');
                const evaluacionesArray = Array.from(evaluacionCards).filter(card => card.style.display !== 'none');

                // Si no hay tarjetas visibles en esta sección, no configuramos paginación
                if (evaluacionesArray.length === 0) {
                    return;
                }
                
                // Guardar estado de paginación basado en las tarjetas visibles
                paginationState[seccionId] = {
                    currentPage: 1,
                    itemsPerPage: 3,
                    totalItems: evaluacionesArray.length,
                    totalPages: Math.ceil(evaluacionesArray.length / 3),
                    evaluaciones: evaluacionesArray
                };
                
                // Crear contenedor de paginación
                createPaginationUI(group, seccionId);
                
                // Mostrar primera página
                showPage(seccionId, 1);
            });
        }

        function createPaginationUI(group, seccionId) {
            const state = paginationState[seccionId];
            
            if (state.totalPages <= 1) {
                return; // No mostrar paginación si solo hay una página
            }
            
            const evaluacionesContainer = group.querySelector('.seccion-evaluaciones');
            
            // Crear contenedor para las evaluaciones
            const container = document.createElement('div');
            container.className = 'evaluaciones-container';
            container.dataset.seccionId = seccionId;
            
            // Mover todas las cards al contenedor
            state.evaluaciones.forEach(card => {
                container.appendChild(card);
            });
            
            // Limpiar y agregar el nuevo contenedor
            evaluacionesContainer.innerHTML = '';
            evaluacionesContainer.appendChild(container);
            
            // Crear controles de paginación
            const paginationControls = document.createElement('div');
            paginationControls.className = 'pagination-controls';
            paginationControls.innerHTML = `
                <button class="pagination-btn" onclick="changePage('${seccionId}', -1)" data-action="prev">
                    <i class="fas fa-chevron-left"></i>
                    Anterior
                </button>
                
                <div class="pagination-info">
                    <i class="fas fa-file-alt"></i>
                    Página <span class="current-page">1</span> de ${state.totalPages}
                </div>
                
                <div class="pagination-pages">
                    ${Array.from({length: state.totalPages}, (_, i) => 
                        `<button class="pagination-page ${i === 0 ? 'active' : ''}" 
                            onclick="showPage('${seccionId}', ${i + 1})">${i + 1}</button>`
                    ).join('')}
                </div>
                
                <button class="pagination-btn" onclick="changePage('${seccionId}', 1)" data-action="next">
                    Siguiente
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
            
            evaluacionesContainer.appendChild(paginationControls);
        }

        function showPage(seccionId, pageNumber) {
            const state = paginationState[seccionId];
            
            if (!state || pageNumber < 1 || pageNumber > state.totalPages) {
                return;
            }
            
            // Actualizar página actual
            state.currentPage = pageNumber;
            
            // Calcular índices
            const startIndex = (pageNumber - 1) * state.itemsPerPage;
            const endIndex = startIndex + state.itemsPerPage;
            
            // Obtener contenedor
            const group = document.querySelector(`[data-seccion-id="${seccionId}"]`);
            const container = group.querySelector('.evaluaciones-container');
            
            // Animación de salida
            container.classList.add('fade-out');
            
            setTimeout(() => {
                // Ocultar todas las cards
                state.evaluaciones.forEach((card, index) => {
                    if (index >= startIndex && index < endIndex) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Actualizar UI de paginación
                updatePaginationUI(seccionId);
                
                // Animación de entrada
                container.classList.remove('fade-out');
                container.classList.add('fade-in');
                
                setTimeout(() => {
                    container.classList.remove('fade-in');
                }, 300);
            }, 150);
        }

        function changePage(seccionId, direction) {
            const state = paginationState[seccionId];
            const newPage = state.currentPage + direction;
            
            if (newPage >= 1 && newPage <= state.totalPages) {
                showPage(seccionId, newPage);
            }
        }

        function updatePaginationUI(seccionId) {
            const state = paginationState[seccionId];
            const group = document.querySelector(`[data-seccion-id="${seccionId}"]`);
            
            // Actualizar número de página
            const pageNumber = group.querySelector('.current-page');
            if (pageNumber) {
                pageNumber.textContent = state.currentPage;
            }
            
            // Actualizar botones Anterior/Siguiente
            const prevBtn = group.querySelector('[data-action="prev"]');
            const nextBtn = group.querySelector('[data-action="next"]');
            
            if (prevBtn) {
                prevBtn.disabled = state.currentPage === 1;
            }
            
            if (nextBtn) {
                nextBtn.disabled = state.currentPage === state.totalPages;
            }
            
            // Actualizar estado de los botones de página numéricos
            const pages = group.querySelectorAll('.pagination-page');
            pages.forEach((pageBtn, index) => {
                if (index === state.currentPage - 1) {
                    pageBtn.classList.add('active');
                } else {
                    pageBtn.classList.remove('active');
                }
            });
        }

        // Mantener sincronía entre filtrado y paginación (máximo 3 por página siempre)
        const originalFiltrarEvaluaciones = filtrarEvaluaciones;
        filtrarEvaluaciones = function() {
            // Aplicar filtros sobre todas las tarjetas
            originalFiltrarEvaluaciones();

            // Reinicializar la paginación tomando en cuenta solo las tarjetas visibles
            setTimeout(() => {
                initializePagination();
            }, 100);
        };