//Funcion para confirmar la salida del programa
function Exit(){
    Swal.fire({
        icon: 'warning',
        title: 'Validacion',
        text: 'Estas seguro que deseas salir?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No'
    }).then((result) => {
        if(result.isConfirmed){
            window.location.href = '/login'
        }
    });
}

// ==================== ELEMENTOS DEL DOM ====================
const btnAbrirModal = document.getElementById('btnAbrirModal');
const modalAgregar = document.getElementById('modalAgregar');
const modalEditar = document.getElementById('modalEditar');
const closeModalAdd = document.getElementById('closeModalAdd');
const closeModalEdit = document.getElementById('closeModalEdit');
const btnCancelarAdd = document.getElementById('btnCancelarAdd');
const btnCancelarEdit = document.getElementById('btnCancelarEdit');
const searchInput = document.getElementById('searchInput');

// Radio buttons y campos
const radioRegistrado = document.getElementById('radioRegistrado');
const radioNuevo = document.getElementById('radioNuevo');
const camposRegistrado = document.getElementById('camposRegistrado');
const camposNuevo = document.getElementById('camposNuevo');
const profesorSelect = document.getElementById('profesorSelect');

// Elementos de paginación
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const paginationInfo = document.getElementById('paginationInfo');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbersContainer = document.getElementById('pageNumbers');

// Variables de paginación
let currentPage = 1;
let itemsPerPage = 5;
let allRows = [];
let filteredRows = [];

// ==================== VALIDACIÓN DE CÉDULA ====================
function validarCedula(input) {
    // Solo permitir números
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Limitar a 8 dígitos máximo
    if (input.value.length > 8) {
        input.value = input.value.slice(0, 8);
    }
}

// Validar cédula en tiempo real
document.getElementById('cedulaRegistrado').addEventListener('input', function() {
    validarCedula(this);
});

document.getElementById('cedulaNuevo').addEventListener('input', function() {
    validarCedula(this);
});

document.getElementById('cedulaEdit').addEventListener('input', function() {
    validarCedula(this);
});

// ==================== INICIALIZACIÓN DE TABLA ====================
function initTable() {
    const tbody = document.querySelector('.data-table tbody');
    allRows = Array.from(tbody.querySelectorAll('tr'));
    filteredRows = [...allRows];
    
    if (allRows.length > 0 && allRows[0].querySelector('td[colspan]')) {
        // Si la tabla está vacía
        document.getElementById('paginationControls').style.display = 'none';
    } else {
        renderTable();
    }
}

// ==================== RENDERIZAR TABLA ====================
function renderTable() {
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = '';
    
    const totalItems = filteredRows.length;
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
    
    // Ajustar página actual si es necesario
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    
    // Calcular índices
    let startIndex, endIndex;
    if (itemsPerPage === 'all') {
        startIndex = 0;
        endIndex = totalItems;
    } else {
        startIndex = (currentPage - 1) * itemsPerPage;
        endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    }
    
    // Mostrar filas correspondientes
    const rowsToShow = filteredRows.slice(startIndex, endIndex);
    
    if (rowsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No se encontraron usuarios.</td></tr>';
        document.getElementById('paginationControls').style.display = 'none';
        paginationInfo.textContent = 'profesores';
        return;
    }
    
    rowsToShow.forEach(row => {
        tbody.appendChild(row.cloneNode(true));
    });
    
    // Actualizar info de paginación
    paginationInfo.textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${totalItems} profesores`;
    
    // Actualizar controles de paginación
    if (itemsPerPage === 'all') {
        document.getElementById('paginationControls').style.display = 'none';
    } else {
        document.getElementById('paginationControls').style.display = 'flex';
        renderPagination(totalPages);
    }
    
    // Re-attachear event listeners a los botones
    attachButtonListeners();
}

// ==================== RENDERIZAR PAGINACIÓN ====================
function renderPagination(totalPages) {
    pageNumbersContainer.innerHTML = '';
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    prevPageBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
    prevPageBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
    nextPageBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
    nextPageBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
    
    // Mostrar números de página
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.style.cssText = `
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background: ${i === currentPage ? '#1e40af' : '#f0f0f0'};
            color: ${i === currentPage ? 'white' : 'black'};
        `;
        
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        
        pageNumbersContainer.appendChild(pageBtn);
    }
}

// ==================== EVENT LISTENERS DE PAGINACIÓN ====================
itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    currentPage = 1;
    renderTable();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});

// ==================== BÚSQUEDA ====================
searchInput.addEventListener('input', (e) => {
    const busqueda = e.target.value.toLowerCase();
    
    filteredRows = allRows.filter(row => {
        const texto = row.textContent.toLowerCase();
        return texto.includes(busqueda);
    });
    
    currentPage = 1;
    renderTable();
});

// ==================== MODALES ====================
btnAbrirModal.addEventListener('click', () => {
    modalAgregar.style.display = 'flex';
    document.getElementById('formAgregarUsuario').reset();
    mostrarCamposRegistrado();
});

closeModalAdd.addEventListener('click', cerrarModalAgregar);
btnCancelarAdd.addEventListener('click', cerrarModalAgregar);
closeModalEdit.addEventListener('click', cerrarModalEditar);
btnCancelarEdit.addEventListener('click', cerrarModalEditar);

window.addEventListener('click', (e) => {
    if (e.target === modalAgregar) cerrarModalAgregar();
    if (e.target === modalEditar) cerrarModalEditar();
});

function cerrarModalAgregar() {
    modalAgregar.style.display = 'none';
}

function cerrarModalEditar() {
    modalEditar.style.display = 'none';
}

// ==================== CAMBIAR TIPO DE REGISTRO ====================
radioRegistrado.addEventListener('change', mostrarCamposRegistrado);
radioNuevo.addEventListener('change', mostrarCamposNuevo);

function mostrarCamposRegistrado() {
    camposRegistrado.classList.remove('hidden');
    camposNuevo.classList.add('hidden');
    
    document.querySelectorAll('#camposRegistrado input:not([readonly]), #camposRegistrado select').forEach(el => {
        el.disabled = false;
    });
    
    document.querySelectorAll('#camposNuevo input, #camposNuevo select').forEach(el => {
        el.disabled = true;
    });
}

function mostrarCamposNuevo() {
    camposNuevo.classList.remove('hidden');
    camposRegistrado.classList.add('hidden');
    
    document.querySelectorAll('#camposRegistrado input, #camposRegistrado select').forEach(el => {
        el.disabled = true;
    });
    
    document.querySelectorAll('#camposNuevo input, #camposNuevo select').forEach(el => {
        el.disabled = false;
    });
}

// ==================== CARGAR DATOS DEL PROFESOR ====================
profesorSelect.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    
    if (!e.target.value) {
        document.getElementById('cedulaRegistrado').value = '';
        document.getElementById('nombreRegistrado').value = '';
        document.getElementById('emailRegistrado').value = '';
        document.getElementById('clave').value = '';
        return;
    }
    
    const cedula = selectedOption.value;
    const nombreCompleto = selectedOption.textContent.trim();
    const email = selectedOption.getAttribute('data-email') || '';
    
    document.getElementById('cedulaRegistrado').value = cedula;
    document.getElementById('nombreRegistrado').value = nombreCompleto;
    document.getElementById('emailRegistrado').value = email;
    document.getElementById('clave').value = '';
    document.getElementById('clave').focus();
});

// ==================== ATTACHEAR BOTONES ====================
function attachButtonListeners() {
    // Botones de editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            const celdas = fila.querySelectorAll('td');
            
            const cedula = celdas[0].textContent.trim();
            const nombre = celdas[1].textContent.trim();
            const email = celdas[2].textContent.trim();
            const rolTexto = celdas[3].textContent.trim();
            
            let rolId = 2;
            if (rolTexto === 'Administrador') rolId = 1;
            
            document.getElementById('cedulaOriginal').value = cedula;
            document.getElementById('cedulaEdit').value = cedula;
            document.getElementById('nombreEdit').value = nombre;
            document.getElementById('emailEdit').value = email;
            document.getElementById('rolEdit').value = rolId;
            document.getElementById('passwordEdit').value = '';
            
            modalEditar.style.display = 'flex';
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            const cedula = fila.querySelector('td').textContent.trim();
            const nombre = fila.querySelectorAll('td')[1].textContent.trim();
            
            Swal.fire({
                icon: 'warning',
                title: '¿Eliminar usuario?',
                text: `¿Estás seguro de eliminar a ${nombre}?`,
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Aquí iría la lógica para eliminar
                    window.location.href = `/deleteUser/${cedula}`;
                }
            });
        });
    });
}

// ==================== VALIDACIÓN FORMULARIO AGREGAR ====================
document.getElementById('formAgregarUsuario').addEventListener('submit', (e) => {
    const tipoRegistro = document.querySelector('input[name="tipoRegistro"]:checked').value;
    
    if (tipoRegistro === 'registrado') {
        const profesorSeleccionado = document.getElementById('profesorSelect').value;
        const clave = document.getElementById('clave').value;
        const rol = document.getElementById('rol').value;
        
        if (!profesorSeleccionado) {
            e.preventDefault();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe seleccionar un profesor'
            });
            return false;
        }
        
        if (!clave) {
            e.preventDefault();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe ingresar una contraseña'
            });
            return false;
        }
        
        if (!rol) {
            e.preventDefault();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe seleccionar un rol'
            });
            return false;
        }
    } else {
        const cedula = document.getElementById('cedulaNuevo').value;
        const nombre = document.getElementById('nombreNuevo').value;
        const email = document.getElementById('emailNuevo').value;
        const password = document.getElementById('passwordNuevo').value;
        const rol = document.getElementById('rolNuevo').value;
        
        // Validar longitud de cédula
        if (cedula.length < 7 || cedula.length > 8) {
            e.preventDefault();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cédula debe tener entre 7 y 8 dígitos'
            });
            return false;
        }
        
        if (!cedula || !nombre || !email || !password || !rol) {
            e.preventDefault();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Todos los campos son obligatorios'
            });
            return false;
        }
    }
});

// ==================== VALIDACIÓN FORMULARIO EDITAR ====================
document.getElementById('formEditarUsuario').addEventListener('submit', (e) => {
    const cedula = document.getElementById('cedulaEdit').value;
    
    // Validar longitud de cédula
    if (cedula.length < 7 || cedula.length > 8) {
        e.preventDefault();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La cédula debe tener entre 7 y 8 dígitos'
        });
        return false;
    }
});

// ==================== INICIALIZAR AL CARGAR ====================
document.addEventListener('DOMContentLoaded', () => {
    initTable();
});