    // Función para buscar estudiantes
    document.getElementById('searchInput').addEventListener('input', function(e) {
        currentPage = 1; // Reset to first page when searching
        updateTable();
    });

    // Variables para paginación
    let currentPage = 1;
    let entriesPerPage = 10;
    let allRows = [];
    let filteredRows = [];

    // Inicializar paginación
    function initializePagination() {
        allRows = Array.from(document.querySelectorAll('.data-table tbody tr:not(.no-data)'));
        filteredRows = [...allRows];
        updateTable();
    }

    // Actualizar tabla según filtros y paginación
    function updateTable() {
        // Aplicar filtros primero
        applyFilters();

        // Luego aplicar paginación
        const totalRows = filteredRows.length;
        const start = (currentPage - 1) * entriesPerPage;
        const end = entriesPerPage === 'all' ? totalRows : Math.min(start + entriesPerPage, totalRows);

        // Ocultar todas las filas
        allRows.forEach(row => row.style.display = 'none');

        // Mostrar solo las filas filtradas y paginadas
        for (let i = start; i < end; i++) {
            if (filteredRows[i]) {
                filteredRows[i].style.display = '';
            }
        }

        // Actualizar información de paginación
        updatePaginationInfo(start + 1, end, totalRows);

        // Generar botones de paginación
        generatePaginationButtons(totalRows);
    }

    // Aplicar filtros
    function applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const carreraSelect = document.getElementById('carrera');
        const carreraFilter = carreraSelect.value;
        const carreraText = carreraSelect.options[carreraSelect.selectedIndex].text.toLowerCase().trim();
        const seccionFilter = document.getElementById('seccion').value.toLowerCase().trim();

        filteredRows = allRows.filter(row => {
            const text = row.textContent.toLowerCase();
            const carreraCell = row.cells[2] ? row.cells[2].textContent.toLowerCase().trim() : '';
            const seccionCell = row.cells[3] ? row.cells[3].textContent.toLowerCase().trim() : '';

            // Filtro de búsqueda
            const matchesSearch = text.includes(searchTerm);

            // Filtro de carrera (comparar con el texto mostrado, no el valor)
            const matchesCarrera = carreraFilter === '' || carreraCell.includes(carreraText);

            // Filtro de sección
            const matchesSeccion = seccionFilter === '' || seccionCell.includes(seccionFilter);

            return matchesSearch && matchesCarrera && matchesSeccion;
        });
    }

    // Función para filtrar por cantidad (entries per page)
    document.getElementById('entriesPerPage').addEventListener('change', function(e) {
        entriesPerPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
        currentPage = 1;
        updateTable();
    });

    // Función para actualizar la información de paginación
    function updatePaginationInfo(start, end, total) {
        const showingStart = document.getElementById('showingStart');
        const showingEnd = document.getElementById('showingEnd');
        const totalEntries = document.getElementById('totalEntries');

        showingStart.textContent = total > 0 ? start : 0;
        showingEnd.textContent = end;
        totalEntries.textContent = total;
    }

    // Generar botones de paginación
    function generatePaginationButtons(totalRows) {
        const paginationContainer = document.getElementById('paginationButtons');
        paginationContainer.innerHTML = '';

        if (entriesPerPage === 'all' || totalRows <= entriesPerPage) return;

        const totalPages = Math.ceil(totalRows / entriesPerPage);

        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
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

        // Primera página si es necesario
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

        // Última página si es necesario
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
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    // Inicializar cuando se carga la página
    document.addEventListener('DOMContentLoaded', function() {
        initializePagination();
    });

    // Función para filtrar por carrera
    document.getElementById('carrera').addEventListener('change', function(e) {
        currentPage = 1; // Reset to first page when filtering
        updateTable();
    });

    // Función para filtrar por sección
    document.getElementById('seccion').addEventListener('change', function(e) {
        currentPage = 1; // Reset to first page when filtering
        updateTable();
    });

    // Función para ver estudiante
    function verEstudiante(cedula) {
        fetch(`/teacher/students/${cedula}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar estudiante');
                }
                return response.json();
            })
            .then(data => {
                // Llenar la información del modal
                document.getElementById('estudianteNombre').textContent = 
                    `${data.nombre} ${data.apellido}`;
                document.getElementById('estudianteCarrera').textContent = 
                    data.carrera_nombre || 'Sin carrera asignada';
                document.getElementById('estudianteCedula').textContent = data.cedula;
                document.getElementById('estudianteEmail').textContent = data.email;
                document.getElementById('estudianteEmail').href = `mailto:${data.email}`;
                document.getElementById('estudianteTelefono').textContent = 
                    data.telefono || 'No registrado';
                document.getElementById('estudianteNacimiento').textContent = 
                    data.fecha_nacimiento ? new Date(data.fecha_nacimiento).toLocaleDateString() : 'No registrada';
                
                // Estado del estudiante
                const estadoBadge = document.getElementById('estudianteEstado');
                const estado = data.estudiante_activo ? 'ACTIVO' : 'INACTIVO';
                estadoBadge.textContent = estado;
                estadoBadge.className = `badge-estado ${estado.toLowerCase()}`;
                
                // Estadísticas académicas
                document.getElementById('estudianteTotalEvaluaciones').textContent = 
                    data.total_evaluaciones || 0;
                document.getElementById('estudiantePromedio').textContent = 
                    data.promedio_puntaje ? parseFloat(data.promedio_puntaje).toFixed(2) : '0.00';
                document.getElementById('estudianteUltimaEvaluacion').textContent = 
                    data.ultima_evaluacion ? new Date(data.ultima_evaluacion).toLocaleDateString() : 'N/A';
                
                // Mostrar modal
                document.getElementById('modalVerEstudiante').classList.add('active');
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudo cargar la información del estudiante', 'error');
            });
    }

    // Funciones placeholder para otras acciones
    function editarEstudiante(cedula) {
        Swal.fire('Función en desarrollo', `Editar estudiante: ${cedula}`, 'info');
    }

    function evaluarEstudiante(cedula) {
        Swal.fire('Función en desarrollo', `Evaluar estudiante: ${cedula}`, 'info');
    }

    // Función para cerrar el modal
    function cerrarModal() {
        document.getElementById('modalVerEstudiante').classList.remove('active');
    }

    // Cerrar modal al hacer clic fuera
    document.getElementById('modalVerEstudiante')?.addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });