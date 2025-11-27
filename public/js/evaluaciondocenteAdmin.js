// ============================================
// MODAL DE EVALUACIÓN
// ============================================
const modal = document.getElementById('evaluationModal');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const carreraSelect = document.getElementById('carrera');
const semestreSelect = document.getElementById('semestre');
// Abrir modal
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('open-modal-btn') || e.target.closest('.open-modal-btn')) {
        const btn = e.target.classList.contains('open-modal-btn') ? e.target : e.target.closest('.open-modal-btn');
        const docenteNombre = btn.getAttribute('data-nombre');
        const docenteCedula = btn.getAttribute('data-cedula');
        
        document.getElementById('docente_nombre').value = docenteNombre;
        document.getElementById('docente_cedula').value = docenteCedula;
        
        cargarPermisosDocente(docenteCedula);
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
});
// Cargar permisos del docente
function cargarPermisosDocente(cedula) {
    const permisos = permisosPorDocente[cedula];
    
    carreraSelect.innerHTML = '<option value="">Seleccione una carrera</option>';
    semestreSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
    
    if (permisos) {
        Object.keys(permisos.carreras).forEach(codigo => {
            const option = document.createElement('option');
            option.value = codigo;
            option.textContent = permisos.carreras[codigo];
            carreraSelect.appendChild(option);
        });
        
        permisos.semestres.forEach(sem => {
            const option = document.createElement('option');
            option.value = sem;
            option.textContent = `${sem}° Semestre`;
            semestreSelect.appendChild(option);
        });
    }
}
// Cerrar modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('unidad_curricular').value = '';
    document.getElementById('docente_nombre').value = '';
    document.getElementById('docente_cedula').value = '';
    document.getElementById('sugerencias').value = '';
    carreraSelect.selectedIndex = 0;
    semestreSelect.selectedIndex = 0;
}
if (closeBtn) closeBtn.onclick = closeModal;
if (cancelBtn) cancelBtn.onclick = closeModal;
window.onclick = function(event) {
    if (event.target == modal) closeModal();
}
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') closeModal();
});
// Guardar
if (saveBtn) {
    saveBtn.onclick = function() {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Formulario guardado exitosamente',
            confirmButtonText: 'Aceptar'
        }).then(() => closeModal());
    }
}
// ============================================
// PAGINACIÓN Y FILTRADO DE TABLA
// ============================================
const searchInput = document.getElementById('buscar-Docente');
const entriesSelect = document.getElementById('entriesPerPage');
const tableBody = document.querySelector('.data-table tbody');
const showingStartSpan = document.getElementById('showingStart');
const showingEndSpan = document.getElementById('showingEnd');
const totalEntriesSpan = document.getElementById('totalEntries');

let allRows = Array.from(tableBody.querySelectorAll('tr'));
let filteredRows = [...allRows];
let currentPage = 1;
let rowsPerPage = 5;
// Filtrar filas
function filterRows() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredRows = allRows.filter(row => {
        if (row.cells.length === 1 && row.cells[0].getAttribute('colspan')) {
            return false;
        }
        
        const docenteNombre = row.cells[0]?.textContent.toLowerCase() || '';
        const rubricaNombre = row.cells[1]?.textContent.toLowerCase() || '';
        
        return docenteNombre.includes(searchTerm) || rubricaNombre.includes(searchTerm);
    });
    
    currentPage = 1;
    updateTable();
}
// Actualizar tabla
function updateTable() {
    allRows.forEach(row => row.style.display = 'none');
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === 'all' ? filteredRows.length : startIndex + rowsPerPage;
    
    const rowsToShow = filteredRows.slice(startIndex, endIndex);
    rowsToShow.forEach(row => row.style.display = '');
    
    if (filteredRows.length === 0) {
        const emptyRow = tableBody.querySelector('tr[colspan]');
        if (emptyRow) {
            emptyRow.style.display = '';
        }
    }
    
    const showingStartValue = filteredRows.length > 0 ? startIndex + 1 : 0;
    const showingEndValue = Math.min(endIndex, filteredRows.length);
    
    showingStartSpan.textContent = showingStartValue;
    showingEndSpan.textContent = showingEndValue;
    totalEntriesSpan.textContent = filteredRows.length;
}
// Event listeners
if (searchInput) {
    searchInput.addEventListener('input', filterRows);
}
if (entriesSelect) {
    entriesSelect.addEventListener('change', function() {
        rowsPerPage = this.value === 'all' ? 'all' : parseInt(this.value);
        currentPage = 1;
        updateTable();
    });
}
// Inicializar
updateTable();