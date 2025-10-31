// Variables de paginación
let currentPage = 1;
let entriesPerPage = 5;
let allRows = [];

// Inicializar paginación
document.addEventListener('DOMContentLoaded', function() {
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
});

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
    document.getElementById('showingStart').textContent = totalEntries > 0 ? start + 1 : 0;
    document.getElementById('showingEnd').textContent = end;
    document.getElementById('totalEntries').textContent = totalEntries;
    
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