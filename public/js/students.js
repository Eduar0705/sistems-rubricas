// Navigation
const navItems = document.querySelectorAll(".nav-item")
const sections = document.querySelectorAll(".content-section")
const menuToggle = document.getElementById("menuToggle")
const sidebar = document.getElementById("sidebar")

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault()

    const targetSection = item.getAttribute("data-section")

    if (targetSection) {
      // Update active nav item
      navItems.forEach((nav) => nav.classList.remove("active"))
      item.classList.add("active")

      // Show target section
      sections.forEach((section) => section.classList.remove("active"))
      document.getElementById(targetSection).classList.add("active")

      // Close sidebar on mobile
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("active")
      }
    }
  })
})

// Mobile menu toggle
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active")
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 1024) {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove("active")
    }
  }
})

// Search Rubricas
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

// Search Evaluaciones
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

// Close modal when clicking outside
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
    }
  })
})

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active")
    })
  }
})

// Simulate loading data
console.log("[v0] Portal de estudiante cargado correctamente")
