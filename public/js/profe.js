// ============================================
// VARIABLES GLOBALES
// ============================================

// Variables para el modal de permisos
let docenteSeleccionado = null;
let permisoSeleccionado = {
    carrera: null,
    semestre: null,
    materia: null,
    seccion: null
};

// Variables para paginación
let currentPage = 1;
let entriesPerPage = 5;
let allRows = [];

// ============================================
// FUNCIONES GENERALES
// ============================================

// Función de color de activo y no activo
function inicializarColoresEstado() {
    const estado = document.querySelectorAll('#act');
    estado.forEach((act) => {
        if (act.textContent.trim() === 'activo') {
            act.style.color = 'green';
        } else {
            act.style.color = 'red';
        }
    });
}

// ============================================
// MODAL DE AGREGAR PROFESOR
// ============================================

function inicializarModalAgregar() {
    const btnAbrirModal = document.getElementById('btnAbrirModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const btnCerrar = document.getElementById('btnCerrar');
    const btnCancelar = document.getElementById('btnCancelar');
    const formProfesor = document.getElementById('formProfesor');

    if (!modalOverlay) return;

    // Función para abrir el modal
    function abrirModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Función para cerrar el modal
    function cerrarModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (formProfesor) formProfesor.reset();
    }

    // Event listeners
    if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModal);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
    if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);

    // Cerrar modal al hacer clic fuera de él
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            cerrarModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            cerrarModal();
        }
    });
}

// ============================================
// MODAL DE EDITAR PROFESOR
// ============================================

function inicializarModalEditar() {
    const modalEditOverlay = document.getElementById('modalEditOverlay');
    const btnCerrarEdit = document.getElementById('btnCerrarEdit');
    const btnCancelarEdit = document.getElementById('btnCancelarEdit');
    const formProfesorEdit = document.getElementById('formProfesorEdit');

    if (!modalEditOverlay) return;

    // Agregar evento click a todos los botones de editar
    const botonesEditar = document.querySelectorAll('.btn-edit');
    botonesEditar.forEach(button => {
        button.addEventListener('click', function() {
            abrirModalEdicion(this);
        });
    });

    // VALIDACIONES EN TIEMPO REAL
    inicializarValidacionesEdicion();

    // Función para abrir el modal de edición
    function abrirModalEdicion(button) {
        try {
            // Obtener los datos del botón usando dataset
            const cedula = button.dataset.cedula || '';
            const nombre = button.dataset.nombre || '';
            const apellido = button.dataset.apellido || '';
            const especializacion = button.dataset.especializacion || '';
            const email = button.dataset.email || '';
            const telf = button.dataset.telf || '';
            const descripcion = button.dataset.descripcion || '';
            const activo = button.dataset.activo || '';
            
            // Llenar el formulario con los datos
            document.getElementById('cedulaEdit').value = cedula;
            document.getElementById('nombreEdit').value = nombre;
            document.getElementById('apellidoEdit').value = apellido;
            document.getElementById('especialidadEdit').value = especializacion;
            document.getElementById('emailEdit').value = email;
            document.getElementById('telefonoEdit').value = telf;
            document.getElementById('notasEdit').value = descripcion;
            document.getElementById('activo').value = activo;
            
            // Log para verificar que los datos se cargaron
            console.log('Datos cargados en el modal:', {
                cedula, nombre, apellido, especializacion, email, telf, descripcion, activo
            });
            
            // Mostrar el modal
            modalEditOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('Error al abrir modal:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los datos del profesor',
                confirmButtonColor: '#d33'
            });
        }
    }

    // Función para cerrar el modal
    function cerrarModalEdicion() {
        modalEditOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (formProfesorEdit) formProfesorEdit.reset();
    }

    // Event listeners para cerrar el modal
    if (btnCerrarEdit) {
        btnCerrarEdit.addEventListener('click', cerrarModalEdicion);
    }

    if (btnCancelarEdit) {
        btnCancelarEdit.addEventListener('click', cerrarModalEdicion);
    }

    // Cerrar modal al hacer clic fuera de él
    modalEditOverlay.addEventListener('click', (e) => {
        if (e.target === modalEditOverlay) {
            cerrarModalEdicion();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEditOverlay.classList.contains('active')) {
            cerrarModalEdicion();
        }
    });

    // Validación final antes de enviar el formulario
    if (formProfesorEdit) {
        formProfesorEdit.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cedula = document.getElementById('cedulaEdit').value.trim();
            const nombre = document.getElementById('nombreEdit').value.trim();
            const apellido = document.getElementById('apellidoEdit').value.trim();
            const email = document.getElementById('emailEdit').value.trim();
            const telefono = document.getElementById('telefonoEdit').value.trim();
            
            // Validar campos obligatorios
            if (!cedula || !nombre || !apellido || !email) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor complete todos los campos obligatorios',
                    confirmButtonColor: '#3085d6'
                });
                return false;
            }
            
            // Validar cédula
            if (cedula.length < 7 || cedula.length > 8) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cédula inválida',
                    text: 'La cédula debe tener entre 7 y 8 dígitos',
                    confirmButtonColor: '#d33'
                });
                return false;
            }
            
            // Validar que solo contenga números
            if (!/^\d+$/.test(cedula)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Cédula inválida',
                    text: 'La cédula solo debe contener números',
                    confirmButtonColor: '#d33'
                });
                return false;
            }
            
            // Validar nombre
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Nombre inválido',
                    text: 'El nombre solo debe contener letras',
                    confirmButtonColor: '#d33'
                });
                return false;
            }
            
            // Validar apellido
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Apellido inválido',
                    text: 'El apellido solo debe contener letras',
                    confirmButtonColor: '#d33'
                });
                return false;
            }
            
            // Validar teléfono si fue ingresado
            if (telefono.length > 0) {
                const codigosValidos = ['0414', '0424', '0412', '0422', '0416', '0426'];
                const codigo = telefono.substring(0, 4);
                
                if (!codigosValidos.includes(codigo)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Teléfono inválido',
                        text: 'El teléfono debe comenzar con 0414, 0424, 0412, 0422, 0416 o 0426',
                        confirmButtonColor: '#d33'
                    });
                    return false;
                }
                
                if (telefono.length !== 11) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Teléfono inválido',
                        text: 'El teléfono debe tener 11 dígitos',
                        confirmButtonColor: '#d33'
                    });
                    return false;
                }
            }
            
            // Si todo está bien, confirmar antes de enviar
            Swal.fire({
                title: '¿Actualizar profesor?',
                text: "¿Estás seguro de guardar los cambios?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    formProfesorEdit.submit();
                }
            });
            
            return false;
        });
    }
}

// Validaciones en tiempo real para el formulario de edición
function inicializarValidacionesEdicion() {
    // Validación de cédula: solo números, mín 7, máx 8
    const cedulaEdit = document.getElementById('cedulaEdit');
    if (cedulaEdit) {
        cedulaEdit.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 8) {
                this.value = this.value.slice(0, 8);
            }
        });

        cedulaEdit.addEventListener('blur', function(e) {
            if (this.value.length > 0 && this.value.length < 7) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cédula inválida',
                    text: 'La cédula debe tener mínimo 7 dígitos',
                    confirmButtonColor: '#3085d6'
                });
            }
        });
    }

    // Validación de nombre: solo letras y acentos
    const nombreEdit = document.getElementById('nombreEdit');
    if (nombreEdit) {
        nombreEdit.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        });
    }

    // Validación de apellido: solo letras y acentos
    const apellidoEdit = document.getElementById('apellidoEdit');
    if (apellidoEdit) {
        apellidoEdit.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        });
    }

    // Validación de teléfono: debe comenzar con códigos específicos
    const telefonoEdit = document.getElementById('telefonoEdit');
    if (telefonoEdit) {
        telefonoEdit.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });

        telefonoEdit.addEventListener('blur', function(e) {
            if (this.value.length > 0) {
                const codigosValidos = ['0414', '0424', '0412', '0422', '0416', '0426'];
                const codigo = this.value.substring(0, 4);
                
                if (!codigosValidos.includes(codigo)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Teléfono inválido',
                        text: 'El teléfono debe comenzar con 0414, 0424, 0412, 0422, 0416 o 0426',
                        confirmButtonColor: '#3085d6'
                    });
                } else if (this.value.length !== 11) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Teléfono incompleto',
                        text: 'El teléfono debe tener 11 dígitos (ejemplo: 04141234567)',
                        confirmButtonColor: '#3085d6'
                    });
                }
            }
        });
    }
}

// ============================================
// ELIMINAR PROFESOR
// ============================================

function eliminarProfesor(profesorId) {
    Swal.fire({
        title: '¿Estás seguro?',
        html: `
            <p>Esta acción eliminará al profesor de forma permanente.</p>
            <p class="text-sm text-gray-600 mt-2">
                <i class="fa fa-exclamation-triangle text-orange-500"></i>
                <strong>Nota:</strong> Si el profesor tiene secciones asignadas, no podrá ser eliminado.
            </p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fa fa-trash"></i> Sí, eliminarlo',
        cancelButtonText: '<i class="fa fa-times"></i> Cancelar',
        customClass: {
            confirmButton: 'btn-eliminar-confirm',
            cancelButton: 'btn-eliminar-cancel'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
                title: 'Eliminando profesor...',
                html: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Redirigir para eliminar
            window.location.href = `/deleteProfe/${profesorId}`;
        }
    });
}

// ============================================
// VER DETALLES DEL PROFESOR
// ============================================

function verProfesor(button) {
    // Obtener los datos del botón
    const cedula = button.dataset.cedula || 'No especificada';
    const nombre = button.dataset.nombre || 'No especificado';
    const apellido = button.dataset.apellido || 'No especificado';
    const especializacion = button.dataset.especializacion || 'No especificada';
    const email = button.dataset.email || 'No especificado';
    const telf = button.dataset.telf || 'No especificado';
    const descripcion = button.dataset.descripcion || 'Sin descripción adicional';
    const activo = button.dataset.activo === '1' ? 'Activo' : 'Inactivo';
    const estadoBadge = button.dataset.activo === '1' 
        ? '<span style="background: #e8f5e9; color: #2e7d32; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; display: inline-block;">● ACTIVO</span>'
        : '<span style="background: #ffebee; color: #c62828; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; display: inline-block;">● INACTIVO</span>';
    
    // Capitalizar primera letra de especialización
    const especializacionCapitalizada = especializacion.charAt(0).toUpperCase() + especializacion.slice(1);
    
    // Mostrar alerta con diseño profesional institucional
    Swal.fire({
        html: `
            <div style="padding: 0;">
                <!-- Header -->
                <div style="background: #2196F3; padding: 25px 30px; border-radius: 0; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="background: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <i class="fa fa-user" style="font-size: 35px; color: #2196F3;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h2 style="color: white; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">${nombre} ${apellido}</h2>
                            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px;">
                                <i class="fa fa-graduation-cap" style="margin-right: 8px;"></i>${especializacionCapitalizada}
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Estado -->
                <div style="padding: 20px 30px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666; font-size: 14px; font-weight: 500;">Estado del Profesor</span>
                        ${estadoBadge}
                    </div>
                </div>
                
                <!-- Información Personal -->
                <div style="padding: 25px 30px; text-align: left;">
                    <h3 style="color: #333; font-size: 16px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
                        <i class="fa fa-info-circle" style="color: #2196F3; margin-right: 8px;"></i>
                        Información Personal
                    </h3>
                    
                    <div style="display: grid; gap: 18px;">
                        <!-- Cédula -->
                        <div style="display: flex; align-items: start;">
                            <div style="background: #E3F2FD; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                                <i class="fa fa-id-card" style="color: #2196F3; font-size: 18px;"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="color: #757575; font-size: 12px; font-weight: 500; margin-bottom: 3px;">CÉDULA DE IDENTIDAD</div>
                                <div style="color: #212121; font-size: 15px; font-weight: 500;">${cedula}</div>
                            </div>
                        </div>
                        
                        <!-- Email -->
                        <div style="display: flex; align-items: start;">
                            <div style="background: #E8F5E9; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                                <i class="fa fa-envelope" style="color: #4CAF50; font-size: 18px;"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="color: #757575; font-size: 12px; font-weight: 500; margin-bottom: 3px;">CORREO ELECTRÓNICO</div>
                                <div style="color: #212121; font-size: 15px; font-weight: 500;">
                                    <a href="mailto:${email}" style="color: #2196F3; text-decoration: none;">${email}</a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Teléfono -->
                        <div style="display: flex; align-items: start;">
                            <div style="background: #FFF3E0; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                                <i class="fa fa-phone" style="color: #FF9800; font-size: 18px;"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="color: #757575; font-size: 12px; font-weight: 500; margin-bottom: 3px;">TELÉFONO</div>
                                <div style="color: #212121; font-size: 15px; font-weight: 500;">
                                    ${telf !== 'No especificado' ? `<a href="tel:${telf}" style="color: #2196F3; text-decoration: none;">${telf}</a>` : telf}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Descripción -->
                ${descripcion !== 'Sin descripción adicional' ? `
                    <div style="padding: 0 30px 25px 30px; text-align: left;">
                        <h3 style="color: #333; font-size: 16px; margin: 0 0 15px 0; font-weight: 600; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
                            <i class="fa fa-sticky-note" style="color: #2196F3; margin-right: 8px;"></i>
                            Notas Adicionales
                        </h3>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
                            <p style="margin: 0; color: #616161; line-height: 1.6; font-size: 14px;">${descripcion}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `,
        width: '550px',
        showConfirmButton: true,
        confirmButtonText: '<i class="fa fa-times"></i> Cerrar',
        confirmButtonColor: '#2196F3',
        showCloseButton: false,
        padding: 0,
        customClass: {
            popup: 'swal-profesor-card',
            htmlContainer: 'swal-no-padding'
        }
    });
}

function inicializarBotonesVer() {
    const botonesVer = document.querySelectorAll('.btn-view');
    botonesVer.forEach(button => {
        button.addEventListener('click', function() {
            verProfesor(this);
        });
    });
}

// ============================================
// BÚSQUEDA Y FILTRADO
// ============================================

// Función para buscar profesores por nombre
function buscarProfesor() {
    const searchInput = document.querySelector('.search-box input');
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    const searchTerm = searchInput.value.toLowerCase().trim();

    tableRows.forEach(row => {
        // Saltar la fila de "No hay profesores registrados"
        if (row.cells.length === 1) return;

        const nombreCompleto = row.cells[0].textContent.toLowerCase();
        
        if (nombreCompleto.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Función para limpiar la búsqueda y mostrar todos los registros
function limpiarBusqueda() {
    const searchInput = document.querySelector('.search-box input');
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    
    searchInput.value = '';
    
    tableRows.forEach(row => {
        row.style.display = '';
    });
}

// Búsqueda avanzada en múltiples campos
function buscarProfesorAvanzado() {
    const searchInput = document.querySelector('.search-box input');
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    const searchTerm = searchInput.value.toLowerCase().trim();

    tableRows.forEach(row => {
        if (row.cells.length === 1) return;

        const nombreCompleto = row.cells[0].textContent.toLowerCase();
        const cedula = row.cells[1].textContent.toLowerCase();
        const especialidad = row.cells[2].textContent.toLowerCase();
        const email = row.cells[3].textContent.toLowerCase();
        
        // Buscar en múltiples campos
        if (nombreCompleto.includes(searchTerm) || 
            cedula.includes(searchTerm) || 
            especialidad.includes(searchTerm) || 
            email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function inicializarBusqueda() {
    const searchInput = document.querySelector('.search-box input');
    
    if (!searchInput) return;

    // Búsqueda mientras se escribe
    searchInput.addEventListener('input', buscarProfesor);
    
    // Búsqueda al presionar Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarProfesor();
        }
    });
    
    // Evento click al ícono de búsqueda
    const searchIcon = document.querySelector('.search-box .fa-search');
    if (searchIcon) {
        searchIcon.addEventListener('click', buscarProfesor);
    }
}

// ============================================
// PAGINACIÓN
// ============================================

function inicializarPaginacion() {
    // Guardar todas las filas
    allRows = Array.from(document.querySelectorAll('.profesor-row'));
    
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

// ============================================
// MODAL DE PERMISOS
// ============================================

function inicializarModalPermisos() {
    // Agregar event listeners a los botones de permisos
    const botonesPermisos = document.querySelectorAll('.btn-permi');
    botonesPermisos.forEach(boton => {
        boton.addEventListener('click', function() {
            docenteSeleccionado = {
                cedula: this.dataset.cedula,
                nombre: this.dataset.nombre,
                apellido: this.dataset.apellido,
                especializacion: this.dataset.especializacion,
                email: this.dataset.email,
                telf: this.dataset.telf,
                descripcion: this.dataset.descripcion
            };
            
            abrirModalPermisos();
        });
    });
}

function abrirModalPermisos() {
    const modal = document.getElementById('modalPermisos');
    modal.style.display = 'block';
    
    // Mostrar información del docente
    document.getElementById('docenteNombre').textContent = 
        `${docenteSeleccionado.nombre} ${docenteSeleccionado.apellido}`;
    document.getElementById('docenteEspecializacion').textContent = 
        docenteSeleccionado.especializacion || 'No especificada';
    
    // Cargar permisos actuales
    cargarPermisosActuales();
    
    // Cargar carreras disponibles
    cargarCarreras();
    
    // Reset selección
    resetearSeleccion();
}

function cerrarModalPermisos() {
    const modal = document.getElementById('modalPermisos');
    modal.style.display = 'none';
    docenteSeleccionado = null;
    resetearSeleccion();
}

// ============================================
// CARGAR PERMISOS ACTUALES
// ============================================

async function cargarPermisosActuales() {
    const container = document.getElementById('listaPermisosActuales');
    container.innerHTML = '<div class="loading-message"><i class="fa fa-spinner fa-spin"></i><p>Cargando permisos...</p></div>';
    
    try {
        const response = await fetch(`/api/permisos/docente/${docenteSeleccionado.cedula}`);
        const permisos = await response.json();
        
        if (permisos.length === 0) {
            container.innerHTML = '<div class="empty-message">No hay permisos asignados</div>';
            return;
        }
        
        container.innerHTML = '';
        permisos.forEach(permiso => {
            const permisoElement = document.createElement('div');
            permisoElement.className = 'permiso-item';
            permisoElement.innerHTML = `
                <div class="permiso-info">
                    <strong>${permiso.carrera_nombre}</strong>
                    <small>Sem ${permiso.semestre} - ${permiso.materia_nombre} - ${permiso.seccion_codigo}</small>
                </div>
                <button class="btn-eliminar-permiso" onclick="eliminarPermiso(${permiso.id})">
                    <i class="fa fa-trash"></i>
                </button>
            `;
            container.appendChild(permisoElement);
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-message">Error al cargar permisos</div>';
    }
}

// ============================================
// CARGAR CARRERAS
// ============================================

async function cargarCarreras() {
    const container = document.getElementById('carrerasContainer');
    container.innerHTML = '<div class="loading-message"><i class="fa fa-spinner fa-spin"></i></div>';

    try {
        const response = await fetch('/api/carreras');
        const data = await response.json();

        console.log('Response from /api/carreras:', data);

        // Manejar diferentes estructuras de respuesta
        let carreras = [];
        if (Array.isArray(data)) {
            carreras = data;
        } else if (data.carreras && Array.isArray(data.carreras)) {
            carreras = data.carreras;
        } else if (data.data && Array.isArray(data.data)) {
            carreras = data.data;
        } else {
            console.error('Unexpected response structure:', data);
            container.innerHTML = '<div class="empty-message">Error: Formato de respuesta inesperado</div>';
            return;
        }

        container.innerHTML = '';
        carreras.forEach(carrera => {
            const card = crearCard(carrera.codigo, carrera.nombre, '', 'carrera');
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-message">Error al cargar carreras</div>';
    }
}

// ============================================
// CARGAR SEMESTRES
// ============================================

async function cargarSemestres(carreraCode) {
    const container = document.getElementById('semestresContainer');
    const pasoSemestre = document.getElementById('pasoSemestre');

    container.innerHTML = '<div class="loading-message"><i class="fa fa-spinner fa-spin"></i></div>';
    pasoSemestre.style.display = 'block';

    try {
        const response = await fetch(`/api/semestres/${carreraCode}`);
        const semestres = await response.json();

        container.innerHTML = '';
        semestres.forEach(sem => {
            const card = crearCard(sem, `Semestre ${sem}`, '', 'semestre');
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-message">Error al cargar semestres</div>';
    }
}

// ============================================
// CARGAR MATERIAS
// ============================================

async function cargarMaterias(carreraCode, semestre) {
    const container = document.getElementById('materiasContainer');
    const pasoMateria = document.getElementById('pasoMateria');

    container.innerHTML = '<div class="loading-message"><i class="fa fa-spinner fa-spin"></i></div>';
    pasoMateria.style.display = 'block';

    try {
        const response = await fetch(`/api/materias/${carreraCode}/${semestre}`);
        const materias = await response.json();

        container.innerHTML = '';
        materias.forEach(materia => {
            const card = crearCard(materia.codigo, materia.nombre, `${materia.creditos} créditos`, 'materia');
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-message">Error al cargar materias</div>';
    }
}

// ============================================
// CARGAR SECCIONES
// ============================================

async function cargarSecciones(materiaCode) {
    const container = document.getElementById('seccionesContainer');
    const pasoSeccion = document.getElementById('pasoSeccion');

    container.innerHTML = '<div class="loading-message"><i class="fa fa-spinner fa-spin"></i></div>';
    pasoSeccion.style.display = 'block';

    try {
        const response = await fetch(`/api/secciones/${materiaCode}`);
        const secciones = await response.json();

        container.innerHTML = '';
        secciones.forEach(seccion => {
            const card = crearCard(
                seccion.id,
                seccion.codigo,
                `${seccion.lapso_academico}${seccion.horario ? ' - ' + seccion.horario : ''}`,
                'seccion'
            );
            container.appendChild(card);
        });

        document.getElementById('accionesGuardar').style.display = 'flex';
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="empty-message">Error al cargar secciones</div>';
    }
}

// ============================================
// CREAR TARJETA DE SELECCIÓN
// ============================================

function crearCard(value, title, subtitle, type) {
    const card = document.createElement('div');
    card.className = 'card-option';
    card.innerHTML = `
        <input type="radio" name="${type}" value="${value}" id="${type}_${value}">
        <div class="card-title">${title}</div>
        ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
    `;
    
    card.addEventListener('click', function() {
        // Remover selección anterior
        document.querySelectorAll(`.card-option[data-type="${type}"]`).forEach(c => {
            c.classList.remove('selected');
        });
        
        // Marcar como seleccionado
        card.classList.add('selected');
        card.querySelector('input').checked = true;
        
        // Guardar selección
        permisoSeleccionado[type] = value;
        
        // Cargar siguiente paso
        if (type === 'carrera') {
            cargarSemestres(value);
            // Ocultar pasos siguientes
            document.getElementById('pasoMateria').style.display = 'none';
            document.getElementById('pasoSeccion').style.display = 'none';
            document.getElementById('accionesGuardar').style.display = 'none';
        } else if (type === 'semestre') {
            cargarMaterias(permisoSeleccionado.carrera, value);
            // Ocultar pasos siguientes
            document.getElementById('pasoSeccion').style.display = 'none';
            document.getElementById('accionesGuardar').style.display = 'none';
        } else if (type === 'materia') {
            cargarSecciones(value);
        }
    });
    
    card.dataset.type = type;
    return card;
}

// ============================================
// GUARDAR PERMISO
// ============================================

async function guardarPermiso() {
    // Validar que todo esté seleccionado
    if (!permisoSeleccionado.carrera || !permisoSeleccionado.semestre || 
        !permisoSeleccionado.materia || !permisoSeleccionado.seccion) {
        Swal.fire('Error', 'Debe completar todos los pasos', 'error');
        return;
    }
    
    try {
        Swal.fire({
            title: 'Guardando permiso...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        const response = await fetch('/api/permisos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                docente_cedula: docenteSeleccionado.cedula,
                carrera_codigo: permisoSeleccionado.carrera,
                semestre: permisoSeleccionado.semestre,
                materia_codigo: permisoSeleccionado.materia,
                seccion_id: permisoSeleccionado.seccion
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            Swal.fire('Éxito', 'Permiso guardado correctamente', 'success');
            cargarPermisosActuales();
            resetearSeleccion();
        } else {
            Swal.fire('Error', result.mensaje || 'No se pudo guardar el permiso', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Error al guardar el permiso', 'error');
    }
}

// ============================================
// ELIMINAR PERMISO
// ============================================

async function eliminarPermiso(permisoId) {
    const result = await Swal.fire({
        title: '¿Eliminar permiso?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        const response = await fetch(`/api/permisos/${permisoId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire('Eliminado', 'Permiso eliminado correctamente', 'success');
            cargarPermisosActuales();
        } else {
            Swal.fire('Error', data.mensaje || 'No se pudo eliminar el permiso', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Error al eliminar el permiso', 'error');
    }
}

// ============================================
// RESETEAR SELECCIÓN
// ============================================

function resetearSeleccion() {
    permisoSeleccionado = {
        carrera: null,
        semestre: null,
        materia: null,
        seccion: null
    };
    
    // Ocultar pasos
    document.getElementById('pasoSemestre').style.display = 'none';
    document.getElementById('pasoMateria').style.display = 'none';
    document.getElementById('pasoSeccion').style.display = 'none';
    document.getElementById('accionesGuardar').style.display = 'none';
    
    // Limpiar contenedores
    document.getElementById('semestresContainer').innerHTML = '';
    document.getElementById('materiasContainer').innerHTML = '';
    document.getElementById('seccionesContainer').innerHTML = '';
    
    // Desmarcar selecciones
    document.querySelectorAll('.card-option').forEach(card => {
        card.classList.remove('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar colores de estado
    inicializarColoresEstado();
    
    // Inicializar modal de agregar
    inicializarModalAgregar();
    
    // Inicializar modal de editar
    inicializarModalEditar();
    
    // Inicializar modal de permisos
    inicializarModalPermisos();
    
    // Inicializar búsqueda
    inicializarBusqueda();
    
    // Inicializar botones de ver
    inicializarBotonesVer();
    
    // Inicializar paginación
    inicializarPaginacion();
    
    // Cerrar modal de permisos al hacer clic fuera
    const modalPermisos = document.getElementById('modalPermisos');
    if (modalPermisos) {
        modalPermisos.addEventListener('click', function(e) {
            if (e.target === modalPermisos) {
                cerrarModalPermisos();
            }
        });
    }
});
