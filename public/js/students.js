// Mobile menu toggle
const menuToggle = document.getElementById("mobileMenuToggle")
const sidebar = document.getElementById("sidebar")

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    if (sidebar) {
      sidebar.classList.toggle("active")
    }
  })
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 1024 && sidebar) {
    if (!sidebar.contains(e.target) && (!menuToggle || !menuToggle.contains(e.target))) {
      sidebar.classList.remove("active")
    }
  }
})

// buscar Rubricas
const searchRubricas = document.getElementById("searchRubricas")
const filterMateria = document.getElementById("filterMateria")
const rubricasGrid = document.getElementById("rubricasGrid")

function filterRubricas() {
  const searchTerm = searchRubricas.value.toLowerCase()
  const materiaFilter = filterMateria.value
  const rubricaCards = rubricasGrid.querySelectorAll(".rubrica-card")

  rubricaCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase()
    const materia = card.getAttribute("data-materia")

    const matchesSearch = title.includes(searchTerm)
    const matchesMateria = !materiaFilter || materia === materiaFilter

    if (matchesSearch && matchesMateria) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

if (searchRubricas) {
  searchRubricas.addEventListener("input", filterRubricas)
}

if (filterMateria) {
  filterMateria.addEventListener("change", filterRubricas)
}

// Buscar Evaluaciones
const searchEvaluaciones = document.getElementById("searchEvaluaciones")
const filterEstado = document.getElementById("filterEstado")
const evaluacionesTable = document.getElementById("evaluacionesTable")

function filterEvaluaciones() {
  const searchTerm = searchEvaluaciones.value.toLowerCase()
  const estadoFilter = filterEstado.value
  const rows = evaluacionesTable.querySelectorAll("tr")

  rows.forEach((row) => {
    const evaluacion = row.querySelector(".table-cell-content span")?.textContent.toLowerCase() || ""
    const estado = row.querySelector(".status-badge")?.textContent.toLowerCase() || ""

    const matchesSearch = evaluacion.includes(searchTerm)
    const matchesEstado = !estadoFilter || estado.includes(estadoFilter)

    if (matchesSearch && matchesEstado) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

if (searchEvaluaciones) {
  searchEvaluaciones.addEventListener("input", filterEvaluaciones)
}

if (filterEstado) {
  filterEstado.addEventListener("change", filterEvaluaciones)
}

// Modal Functions
function verRubrica(id) {
  const modal = document.getElementById("rubricaModal")
  modal.classList.add("active")

  // Aquí podrías cargar datos específicos de la rúbrica según el ID
  console.log("[v0] Ver rúbrica:", id)
}

function verEvaluacion(id) {
  const modal = document.getElementById("evaluacionModal")
  modal.classList.add("active")

  // Aquí podrías cargar datos específicos de la evaluación según el ID
  console.log("[v0] Ver evaluación:", id)
}

function cerrarModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.remove("active")
}

function descargarRubrica() {
  alert("Descargando rúbrica en PDF...")
  console.log("[v0] Descargar rúbrica")
}

function descargarEvaluacion(id) {
  alert("Descargando evaluación en PDF...")
  console.log("[v0] Descargar evaluación:", id)
}

function verDetallesEvaluacion(evaluacionId) {
  console.log('Ver detalles de evaluación ID:', evaluacionId); // Para debug
  
  // Mostrar modal de carga mientras se obtienen los datos
  const modal = document.getElementById('evaluacionModal');
  const modalBody = document.getElementById('evaluacionModalBody');
  
  modalBody.innerHTML = '<div class="loading">Cargando detalles...</div>';
  modal.classList.add('active');
  
  fetch(`/api/evaluacion/${evaluacionId}/detalles`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json();
    })
    .then(data => {
      console.log('Datos recibidos:', data); // Para debug
      
      if (data.success) {
        let html = `
          <div class="evaluacion-detalles">
            <div class="info-section">
              <h3><i class="fas fa-user"></i> Información del Estudiante</h3>
              <div class="info-grid">
                <p><strong>Nombre:</strong> ${data.estudiante.nombre} ${data.estudiante.apellido}</p>
                <p><strong>Cédula:</strong> ${data.estudiante.cedula}</p>
                <p><strong>Email:</strong> ${data.estudiante.email}</p>
                <p><strong>Carrera:</strong> ${data.estudiante.carrera}</p>
              </div>
            </div>

            <div class="info-section">
              <h3><i class="fas fa-book"></i> Información de la Rúbrica</h3>
              <div class="info-grid">
                <p><strong>Nombre:</strong> ${data.rubrica.nombre_rubrica}</p>
                <p><strong>Materia:</strong> ${data.rubrica.materia} (${data.rubrica.materia_codigo})</p>
                <p><strong>Tipo:</strong> ${data.rubrica.tipo_evaluacion}</p>
                <p><strong>Porcentaje:</strong> ${data.rubrica.porcentaje_evaluacion}%</p>
              </div>
              ${data.rubrica.instrucciones ? `<p><strong>Instrucciones:</strong> ${data.rubrica.instrucciones}</p>` : ''}
              ${data.rubrica.competencias ? `<p><strong>Competencias:</strong> ${data.rubrica.competencias}</p>` : ''}
            </div>

            <div class="info-section">
              <h3><i class="fas fa-chart-line"></i> Resultados de la Evaluación</h3>
              <div class="puntaje-total">
                <span class="label">Puntaje Total:</span>
                <span class="puntaje">${data.evaluacion.puntaje_total || 'Pendiente'}</span>
              </div>
              <p><strong>Fecha de Evaluación:</strong> ${new Date(data.evaluacion.fecha_evaluacion).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${data.evaluacion.observaciones ? `
                <div class="observaciones">
                  <strong>Observaciones:</strong>
                  <p>${data.evaluacion.observaciones}</p>
                </div>
              ` : ''}
            </div>

            <div class="info-section">
              <h3><i class="fas fa-clipboard-list"></i> Criterios de Evaluación</h3>
              ${data.criterios.map(criterio => `
                <div class="criterio-detalle">
                  <h4>${criterio.nombre}</h4>
                  <p class="puntaje-maximo"><strong>Puntaje Máximo:</strong> ${criterio.puntaje_maximo} puntos</p>
                  <div class="niveles-lista">
                    ${criterio.niveles.map(nivel => `
                      <div class="nivel-item ${nivel.seleccionado ? 'seleccionado' : ''}">
                        <div class="nivel-header">
                          ${nivel.seleccionado ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>'}
                          <strong>${nivel.nombre}</strong>
                          <span class="nivel-puntaje">${nivel.puntaje} pts</span>
                        </div>
                        <p class="nivel-descripcion">${nivel.descripcion}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        
        modalBody.innerHTML = html;
      } else {
        modalBody.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error: ${data.message}</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Error al cargar detalles:', error);
      modalBody.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error al cargar los detalles de la evaluación</p>
          <small>${error.message}</small>
        </div>
      `;
    });
}

// Cerrar modal al hacer clic fuera del contenido
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
    }
  })
})

// Cerrar modal con la tecla Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active")
    })
  }
})
