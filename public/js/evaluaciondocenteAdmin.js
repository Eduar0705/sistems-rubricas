// =============================================
// GESTIÓN DE EVALUACIONES DOCENTES
// =============================================

console.log('🔧 evaluaciondocenteAdmin.js cargado correctamente');

document.addEventListener('DOMContentLoaded', function () {
    console.log('📋 DOM loaded - Inicializando evaluación docente');

    const modal = document.getElementById('evaluationModal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const editBtns = document.querySelectorAll('.btn-edit');
    const viewBtns = document.querySelectorAll('.btn-view');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const buscarInput = document.getElementById('buscar-Docente');

    console.log('📊 Elementos encontrados:', {
        modal: modal ? 'Sí' : 'No',
        openModalBtns: openModalBtns.length,
        editBtns: editBtns.length,
        viewBtns: viewBtns.length,
        closeBtn: closeBtn ? 'Sí' : 'No',
        cancelBtn: cancelBtn ? 'Sí' : 'No',
        saveBtn: saveBtn ? 'Sí' : 'No'
    });

    let isEditMode = false;
    let currentEvaluacionId = null;

    // =============================================
    // ABRIR MODAL PARA NUEVA EVALUACIÓN
    // =============================================
    openModalBtns.forEach(btn => {
        console.log('➕ Agregando listener a botón:', btn);
        btn.addEventListener('click', function () {
            console.log('🎯 Click en botón Evaluar - Abriendo modal');
            isEditMode = false;
            currentEvaluacionId = null;
            document.getElementById('evaluacion_id').value = '';

            const cedula = this.getAttribute('data-cedula');
            const nombre = this.getAttribute('data-nombre');

            console.log('👤 Docente seleccionado:', { cedula, nombre });

            // Limpiar formulario
            limpiarFormulario();

            // Cargar información del docente
            document.getElementById('docente_cedula').value = cedula;
            document.getElementById('docente_nombre').value = nombre;

            // Cargar opciones de semestre y carrera
            cargarOpcionesDocente(cedula);

            // Cambiar título y botón
            document.querySelector('.form-title').textContent = '4. APLICACIÓN DE LOS INSTRUMENTOS DE EVALUACIÓN EN ESTE CORTE';
            saveBtn.textContent = 'Guardar';

            modal.style.display = 'block';
            console.log('✅ Modal abierto');
        });
    });

    // =============================================
    // ABRIR MODAL PARA EDITAR EVALUACIÓN
    // =============================================
    editBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            isEditMode = true;
            currentEvaluacionId = this.getAttribute('data-evaluacion-id');
            const cedula = this.getAttribute('data-cedula');
            const nombre = this.getAttribute('data-nombre');

            // Cargar datos de la evaluación
            cargarEvaluacion(currentEvaluacionId, cedula);

            // Cambiar título y botón
            document.querySelector('.form-title').textContent = '4. EDITAR EVALUACIÓN DOCENTE';
            saveBtn.textContent = 'Actualizar';

            modal.style.display = 'block';
        });
    });

    // =============================================
    // VER EVALUACIÓN (MODO SOLO LECTURA)
    // =============================================
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const evaluacionId = this.getAttribute('data-evaluacion-id');

            fetch(`/admin/evaluacion-docente/${evaluacionId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        mostrarEvaluacionSoloLectura(data.evaluacion);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'No se pudo cargar la evaluación'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al cargar la evaluación'
                    });
                });
        });
    });

    // =============================================
    // CARGAR EVALUACIÓN PARA EDITAR
    // =============================================
    function cargarEvaluacion(evaluacionId, cedula) {
        fetch(`/admin/evaluacion-docente/${evaluacionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const evaluacion = data.evaluacion;

                    // Cargar información básica
                    document.getElementById('evaluacion_id').value = evaluacionId;
                    document.getElementById('docente_cedula').value = cedula;
                    document.getElementById('docente_nombre').value = evaluacion.docente_nombre;
                    document.getElementById('unidad_curricular').value = evaluacion.unidad_curricular;

                    // Cargar opciones y seleccionar valores
                    cargarOpcionesDocente(cedula, function () {
                        // Seleccionar valores después de cargar
                        document.getElementById('semestre').value = evaluacion.semestre;
                        document.getElementById('carrera').value = evaluacion.carrera_codigo;

                        // Cargar secciones basadas en la carrera y semestre
                        const semestreSelect = document.getElementById('semestre');
                        if (semestreSelect.value) {
                            const event = new Event('change');
                            semestreSelect.dispatchEvent(event);

                            setTimeout(() => {
                                const seccionSelect = document.querySelector('select[name="seccion"]');
                                if (seccionSelect) {
                                    seccionSelect.value = evaluacion.seccion_id;
                                }
                            }, 100);
                        }
                    });

                    // Cargar calificaciones de criterios
                    for (let i = 1; i <= 7; i++) {
                        const calificacion = evaluacion[`criterio${i}_calificacion`];
                        const observaciones = evaluacion[`criterio${i}_observaciones`];

                        // Marcar la calificación correcta
                        if (calificacion === 'S') {
                            document.querySelector(`input[name="criterio${i}_s"]`).checked = true;
                        } else if (calificacion === 'N') {
                            document.querySelector(`input[name="criterio${i}_n"]`).checked = true;
                        } else if (calificacion === 'CS' || calificacion === 'AV') {
                            document.querySelector(`select[name="criterio${i}_csav"]`).value = calificacion;
                        }

                        // Cargar observaciones
                        if (observaciones) {
                            document.querySelector(`input[name="criterio${i}_obs"]`).value = observaciones;
                        }
                    }

                    // Cargar sugerencias
                    if (evaluacion.sugerencias) {
                        document.getElementById('sugerencias').value = evaluacion.sugerencias;
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'No se pudo cargar la evaluación'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar la evaluación'
                });
            });
    }

    // =============================================
    // MOSTRAR EVALUACIÓN EN MODO SOLO LECTURA
    // =============================================
    function mostrarEvaluacionSoloLectura(evaluacion) {
        let html = `
            <div class="evaluation-view">
                <h2>Evaluación Docente</h2>
                <div class="info-grid">
                    <div><strong>Docente:</strong> ${evaluacion.docente_nombre}</div>
                    <div><strong>Unidad Curricular:</strong> ${evaluacion.unidad_curricular}</div>
                    <div><strong>Semestre:</strong> ${evaluacion.semestre}</div>
                    <div><strong>Carrera:</strong> ${evaluacion.carrera_nombre}</div>
                    <div><strong>Sección:</strong> ${evaluacion.seccion_codigo}</div>
                    <div><strong>Fecha:</strong> ${new Date(evaluacion.fecha_evaluacion).toLocaleDateString('es-ES')}</div>
                    <div><strong>Evaluado por:</strong> ${evaluacion.admin_nombre}</div>
                </div>
                
                <h3>Criterios de Evaluación</h3>
                <table class="evaluation-table">
                    <thead>
                        <tr>
                            <th>Criterio</th>
                            <th>Calificación</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const criteriosTexto = [
            'Diseña instrumentos de evaluación para la revisión del producto o actividad sumativa',
            'Aplica instrumentos de evaluación a cada una de las actividades sumativas',
            'Explica los criterios de evaluación e indicadores de desempeño a los estudiantes',
            'Aplica los criterios de evaluación e indicadores de desempeño de los instrumentos diseñados',
            'Los instrumentos usados evalúan los indicadores de desempeño de la competencia del perfil de egreso',
            'Los instrumentos empleados evalúan de forma integral la competencia del perfil de egreso',
            'Evidencia los resultados de todas las evaluaciones con los criterios e indicadores de desempeño'
        ];

        for (let i = 1; i <= 7; i++) {
            const calificacion = evaluacion[`criterio${i}_calificacion`];
            const observaciones = evaluacion[`criterio${i}_observaciones`] || '-';

            html += `
                <tr>
                    <td>${criteriosTexto[i - 1]}</td>
                    <td><strong>${calificacion}</strong></td>
                    <td>${observaciones}</td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
                
                <div class="suggestions-view">
                    <h4>Sugerencias:</h4>
                    <p>${evaluacion.sugerencias || 'Sin sugerencias'}</p>
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Detalles de la Evaluación',
            html: html,
            width: '80%',
            showCloseButton: true,
            confirmButtonText: 'Cerrar'
        });
    }

    // =============================================
    // CARGAR OPCIONES DE SEMESTRE, CARRERA Y SECCIÓN
    // =============================================
    function cargarOpcionesDocente(cedula, callback) {
        const permisos = permisosPorDocente[cedula];

        if (!permisos) {
            console.warn('No se encontraron permisos para el docente:', cedula);
            if (callback) callback();
            return;
        }

        // Cargar materias del docente
        const unidadCurricularSelect = document.getElementById('unidad_curricular');
        unidadCurricularSelect.innerHTML = '<option value="">Seleccione una materia</option>';

        if (permisos.materias) {
            Object.entries(permisos.materias).forEach(([codigo, nombre]) => {
                const option = document.createElement('option');
                option.value = nombre;
                option.textContent = nombre;
                option.dataset.codigo = codigo;
                unidadCurricularSelect.appendChild(option);
            });
        }

        // Cargar semestres
        const semestreSelect = document.getElementById('semestre');
        semestreSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
        permisos.semestres.forEach(semestre => {
            const option = document.createElement('option');
            option.value = semestre;
            option.textContent = `Semestre ${semestre}`;
            semestreSelect.appendChild(option);
        });

        // Cargar carreras
        const carreraSelect = document.getElementById('carrera');
        carreraSelect.innerHTML = '<option value="">Seleccione una carrera</option>';
        Object.entries(permisos.carreras).forEach(([codigo, nombre]) => {
            const option = document.createElement('option');
            option.value = codigo;
            option.textContent = nombre;
            carreraSelect.appendChild(option);
        });

        // Listener para cargar secciones cuando cambie semestre o carrera
        const actualizarSecciones = function () {
            const semestre = semestreSelect.value;
            const carrera = carreraSelect.value;

            if (semestre && carrera) {
                // Crear select de sección si no existe
                let seccionContainer = document.querySelector('.seccion-container');
                if (!seccionContainer) {
                    seccionContainer = document.createElement('div');
                    seccionContainer.className = 'info-field seccion-container';
                    seccionContainer.innerHTML = `
                        <label>Sección</label>
                        <select name="seccion" required>
                            <option value="">Seleccione una sección</option>
                        </select>
                    `;
                    carreraSelect.parentElement.parentElement.appendChild(seccionContainer);
                }

                const seccionSelect = document.querySelector('select[name="seccion"]');
                seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';

                Object.entries(permisos.secciones).forEach(([id, nombre]) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = nombre;
                    seccionSelect.appendChild(option);
                });
            }
        };

        semestreSelect.addEventListener('change', actualizarSecciones);
        carreraSelect.addEventListener('change', actualizarSecciones);

        if (callback) callback();
    }

    // =============================================
    // LIMPIAR FORMULARIO
    // =============================================
    function limpiarFormulario() {
        document.getElementById('unidad_curricular').innerHTML = '<option value="">Seleccione una materia</option>';
        document.getElementById('semestre').innerHTML = '<option value="">Seleccione un semestre</option>';
        document.getElementById('carrera').innerHTML = '<option value="">Seleccione una carrera</option>';
        document.getElementById('sugerencias').value = '';

        // Limpiar todos los criterios
        for (let i = 1; i <= 7; i++) {
            document.querySelector(`input[name="criterio${i}_s"]`).checked = false;
            document.querySelector(`select[name="criterio${i}_csav"]`).value = '';
            document.querySelector(`input[name="criterio${i}_n"]`).checked = false;
            document.querySelector(`input[name="criterio${i}_obs"]`).value = '';
        }

        // Remover select de sección si existe
        const seccionContainer = document.querySelector('.seccion-container');
        if (seccionContainer) {
            seccionContainer.remove();
        }
    }

    // =============================================
    // VALIDAR Y GUARDAR EVALUACIÓN
    // =============================================
    saveBtn.addEventListener('click', function () {
        // Validar campos básicos
        const unidadCurricular = document.getElementById('unidad_curricular').value.trim();
        const semestre = document.getElementById('semestre').value;
        const carrera = document.getElementById('carrera').value;
        const seccionSelect = document.querySelector('select[name="seccion"]');
        const seccion = seccionSelect ? seccionSelect.value : '';

        if (!unidadCurricular) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingrese la unidad curricular'
            });
            return;
        }

        if (!semestre) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor seleccione el semestre'
            });
            return;
        }

        if (!carrera) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor seleccione la carrera'
            });
            return;
        }

        if (!seccion) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor seleccione la sección'
            });
            return;
        }

        // Validar criterios
        const criterios = [];
        for (let i = 1; i <= 7; i++) {
            const s = document.querySelector(`input[name="criterio${i}_s"]`).checked;
            const csav = document.querySelector(`select[name="criterio${i}_csav"]`).value;
            const n = document.querySelector(`input[name="criterio${i}_n"]`).checked;
            const obs = document.querySelector(`input[name="criterio${i}_obs"]`).value.trim();

            let calificacion = '';
            if (s) {
                calificacion = 'S';
            } else if (csav) {
                calificacion = csav;
            } else if (n) {
                calificacion = 'N';
            }

            if (!calificacion) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Criterio incompleto',
                    text: `Por favor seleccione una calificación para el criterio ${i}`
                });
                return;
            }

            criterios.push({
                calificacion: calificacion,
                observaciones: obs
            });
        }

        // Preparar datos para enviar
        const data = {
            docente_cedula: document.getElementById('docente_cedula').value,
            unidad_curricular: unidadCurricular,
            semestre: parseInt(semestre),
            seccion_id: parseInt(seccion),
            carrera_codigo: carrera,
            criterio1_calificacion: criterios[0].calificacion,
            criterio1_observaciones: criterios[0].observaciones,
            criterio2_calificacion: criterios[1].calificacion,
            criterio2_observaciones: criterios[1].observaciones,
            criterio3_calificacion: criterios[2].calificacion,
            criterio3_observaciones: criterios[2].observaciones,
            criterio4_calificacion: criterios[3].calificacion,
            criterio4_observaciones: criterios[3].observaciones,
            criterio5_calificacion: criterios[4].calificacion,
            criterio5_observaciones: criterios[4].observaciones,
            criterio6_calificacion: criterios[5].calificacion,
            criterio6_observaciones: criterios[5].observaciones,
            criterio7_calificacion: criterios[6].calificacion,
            criterio7_observaciones: criterios[6].observaciones,
            sugerencias: document.getElementById('sugerencias').value.trim()
        };

        // Determinar URL y método según modo
        let url, method;
        if (isEditMode) {
            url = `/admin/evaluacion-docente/actualizar/${currentEvaluacionId}`;
            method = 'PUT';
        } else {
            url = '/admin/evaluacion-docente/guardar';
            method = 'POST';
        }

        // Mostrar loading
        Swal.fire({
            title: isEditMode ? 'Actualizando...' : 'Guardando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar datos al servidor
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: data.message,
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        modal.style.display = 'none';
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Error al guardar la evaluación'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al procesar la solicitud'
                });
            });
    });

    // =============================================
    // LÓGICA DE SELECCIÓN EXCLUSIVA DE CRITERIOS
    // =============================================
    for (let i = 1; i <= 7; i++) {
        const checkboxS = document.querySelector(`input[name="criterio${i}_s"]`);
        const selectCSAV = document.querySelector(`select[name="criterio${i}_csav"]`);
        const checkboxN = document.querySelector(`input[name="criterio${i}_n"]`);

        checkboxS.addEventListener('change', function () {
            if (this.checked) {
                selectCSAV.value = '';
                checkboxN.checked = false;
            }
        });

        selectCSAV.addEventListener('change', function () {
            if (this.value) {
                checkboxS.checked = false;
                checkboxN.checked = false;
            }
        });

        checkboxN.addEventListener('change', function () {
            if (this.checked) {
                checkboxS.checked = false;
                selectCSAV.value = '';
            }
        });
    }

    // =============================================
    // CERRAR MODAL
    // =============================================
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // =============================================
    // BÚSQUEDA DE DOCENTES
    // =============================================
    if (buscarInput) {
        buscarInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.data-table tbody tr');

            rows.forEach(row => {
                const docenteCell = row.cells[0];
                if (docenteCell) {
                    const docenteText = docenteCell.textContent.toLowerCase();
                    if (docenteText.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }

    // =============================================
    // PAGINACIÓN
    // =============================================
    const entriesPerPageSelect = document.getElementById('entriesPerPage');
    const paginationButtons = document.getElementById('paginationButtons');
    let currentPage = 1;
    let entriesPerPage = 5;

    function updatePagination() {
        const rows = Array.from(document.querySelectorAll('.data-table tbody tr')).filter(row => row.style.display !== 'none');
        const totalEntries = rows.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);

        // Ocultar todas las filas
        rows.forEach(row => row.classList.add('hidden-pagination'));

        // Mostrar solo las filas de la página actual
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        rows.slice(start, end).forEach(row => row.classList.remove('hidden-pagination'));

        // Actualizar información
        document.getElementById('showingStart').textContent = totalEntries > 0 ? start + 1 : 0;
        document.getElementById('showingEnd').textContent = Math.min(end, totalEntries);
        document.getElementById('totalEntries').textContent = totalEntries;

        // Actualizar botones de paginación
        updatePaginationButtons(totalPages);
    }

    function updatePaginationButtons(totalPages) {
        const numerosPagina = document.getElementById('numerosPagina');
        numerosPagina.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'page-btn';
            if (i === currentPage) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', function () {
                currentPage = i;
                updatePagination();
            });
            numerosPagina.appendChild(btn);
        }

        // Botones anterior/siguiente
        document.getElementById('btnAnterior').disabled = currentPage === 1;
        document.getElementById('btnSiguiente').disabled = currentPage === totalPages;
    }

    if (entriesPerPageSelect) {
        entriesPerPageSelect.addEventListener('change', function () {
            if (this.value === 'all') {
                entriesPerPage = 999999;
            } else {
                entriesPerPage = parseInt(this.value);
            }
            currentPage = 1;
            updatePagination();
        });
    }

    document.getElementById('btnAnterior').addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

    document.getElementById('btnSiguiente').addEventListener('click', function () {
        const rows = Array.from(document.querySelectorAll('.data-table tbody tr')).filter(row => row.style.display !== 'none');
        const totalPages = Math.ceil(rows.length / entriesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });

    // Inicializar paginación
    updatePagination();
});