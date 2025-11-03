        // Variables globales para paginación
        let paginaActual = 1;
        let registrosPorPagina = 5;
        let todasLasFilas = [];
        let filasFiltradas = [];

        // Función para confirmar la salida del programa
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

        function eliminarUsuario(cedula) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminarlo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/deleteUser/${cedula}`;
                }
            });
        }

        // Elementos del DOM
        const btnAbrirModal = document.getElementById('btnAbrirModal');
        const modalAgregar = document.getElementById('modalAgregar');
        const modalEditar = document.getElementById('modalEditar');
        const closeModalAdd = document.getElementById('closeModalAdd');
        const closeModalEdit = document.getElementById('closeModalEdit');
        const btnCancelarAdd = document.getElementById('btnCancelarAdd');
        const btnCancelarEdit = document.getElementById('btnCancelarEdit');
        const searchInput = document.getElementById('searchInput');
        const entriesPerPage = document.getElementById('entriesPerPage');

        // Radio buttons y campos
        const radioRegistrado = document.getElementById('radioRegistrado');
        const radioNuevo = document.getElementById('radioNuevo');
        const camposRegistrado = document.getElementById('camposRegistrado');
        const camposNuevo = document.getElementById('camposNuevo');
        const profesorSelect = document.getElementById('profesorSelect');

        // Inicializar array de filas
        function inicializarFilas() {
            const tbody = document.getElementById('tablaUsuarios');
            todasLasFilas = Array.from(tbody.querySelectorAll('tr'));
            filasFiltradas = [...todasLasFilas];
            mostrarPagina();
        }

        // Función para mostrar página
        function mostrarPagina() {
            const tbody = document.getElementById('tablaUsuarios');
            tbody.innerHTML = '';

            if (filasFiltradas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No se encontraron usuarios.</td></tr>';
                actualizarInfoEntries(0, 0, 0);
                actualizarBotonesPaginacion();
                return;
            }

            let inicio, fin;
            if (registrosPorPagina === 'todos') {
                inicio = 0;
                fin = filasFiltradas.length;
            } else {
                inicio = (paginaActual - 1) * registrosPorPagina;
                fin = Math.min(inicio + registrosPorPagina, filasFiltradas.length);
            }

            for (let i = inicio; i < fin; i++) {
                tbody.appendChild(filasFiltradas[i].cloneNode(true));
            }

            // Re-agregar event listeners a botones de editar
            tbody.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', abrirModalEditar);
            });

            actualizarInfoEntries(inicio + 1, fin, filasFiltradas.length);
            actualizarBotonesPaginacion();
        }

        // Actualizar información de entradas
        function actualizarInfoEntries(inicio, fin, total) {
            const infoEntries = document.getElementById('infoEntries');
            if (total === 0) {
                infoEntries.textContent = 'No hay usuarios para mostrar';
            } else {
                infoEntries.textContent = `Mostrando ${inicio} a ${fin} de ${total} usuarios`;
            }
        }

        // Actualizar botones de paginación
        function actualizarBotonesPaginacion() {
            const totalPaginas = registrosPorPagina === 'todos' ? 1 : Math.ceil(filasFiltradas.length / registrosPorPagina);
            const numerosPagina = document.getElementById('numerosPagina');
            const btnAnterior = document.getElementById('btnAnterior');
            const btnSiguiente = document.getElementById('btnSiguiente');
            const paginacion = document.getElementById('paginacion');

            if (registrosPorPagina === 'todos' || filasFiltradas.length === 0) {
                paginacion.style.display = 'none';
                return;
            }

            paginacion.style.display = 'flex';
            numerosPagina.innerHTML = '';

            btnAnterior.disabled = paginaActual === 1;
            btnSiguiente.disabled = paginaActual === totalPaginas;

            btnAnterior.style.opacity = paginaActual === 1 ? '0.5' : '1';
            btnAnterior.style.cursor = paginaActual === 1 ? 'not-allowed' : 'pointer';
            btnSiguiente.style.opacity = paginaActual === totalPaginas ? '0.5' : '1';
            btnSiguiente.style.cursor = paginaActual === totalPaginas ? 'not-allowed' : 'pointer';

            for (let i = 1; i <= totalPaginas; i++) {
                const btnPagina = document.createElement('button');
                btnPagina.textContent = i;
                btnPagina.style.padding = '8px 12px';
                btnPagina.style.border = '1px solid #ddd';
                btnPagina.style.borderRadius = '6px';
                btnPagina.style.cursor = 'pointer';
                btnPagina.style.background = i === paginaActual ? '#6698e2' : 'white';
                btnPagina.style.color = i === paginaActual ? 'white' : '#333';
                
                btnPagina.addEventListener('click', () => {
                    paginaActual = i;
                    mostrarPagina();
                });

                numerosPagina.appendChild(btnPagina);
            }
        }

        // Cambiar cantidad de registros por página
        entriesPerPage.addEventListener('change', (e) => {
            registrosPorPagina = e.target.value === 'todos' ? 'todos' : parseInt(e.target.value);
            paginaActual = 1;
            mostrarPagina();
        });

        // Botones de navegación
        document.getElementById('btnAnterior').addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                mostrarPagina();
            }
        });

        document.getElementById('btnSiguiente').addEventListener('click', () => {
            const totalPaginas = Math.ceil(filasFiltradas.length / registrosPorPagina);
            if (paginaActual < totalPaginas) {
                paginaActual++;
                mostrarPagina();
            }
        });

        // Búsqueda en tiempo real
        searchInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase();
            
            if (busqueda === '') {
                filasFiltradas = [...todasLasFilas];
            } else {
                filasFiltradas = todasLasFilas.filter(fila => {
                    const texto = fila.textContent.toLowerCase();
                    return texto.includes(busqueda);
                });
            }
            
            paginaActual = 1;
            mostrarPagina();
        });

        // Abrir modal agregar
        btnAbrirModal.addEventListener('click', () => {
            modalAgregar.style.display = 'flex';
            document.getElementById('formAgregarUsuario').reset();
            mostrarCamposRegistrado();
        });

        // Cerrar modales
        closeModalAdd.addEventListener('click', cerrarModalAgregar);
        btnCancelarAdd.addEventListener('click', cerrarModalAgregar);
        closeModalEdit.addEventListener('click', cerrarModalEditar);
        btnCancelarEdit.addEventListener('click', cerrarModalEditar);

        // Cerrar modal al hacer clic fuera
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

        // Cambiar entre profesor registrado y nuevo
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

        // Cargar datos del profesor seleccionado
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

        // Función para abrir modal de edición
        function abrirModalEditar(e) {
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
        }

        // Validación antes de enviar el formulario
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

        // Inicializar cuando cargue la página
        window.addEventListener('DOMContentLoaded', () => {
            inicializarFilas();
        });