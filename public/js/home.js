// Navigation
const navItems = document.querySelectorAll(".nav-item")
const views = document.querySelectorAll(".view")
const pageTitle = document.getElementById("pageTitle")
const mobileMenuToggle = document.getElementById("mobileMenuToggle")
const sidebar = document.getElementById("sidebar")

// Handle navigation
navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
        // Si es un enlace externo, permitir la navegación normal
        if (item.getAttribute("data-external") === "true") {
            return // Permitir que el navegador maneje la redirección
        }
        
        e.preventDefault()

        navItems.forEach((nav) => nav.classList.remove("active"))

        item.classList.add("active")

        // Get view name
        const viewName = item.getAttribute("data-view")

        // Hide all views
        views.forEach((view) => view.classList.remove("active"))

        // Show selected view
        const selectedView = document.getElementById(viewName)
        if (selectedView) {
            selectedView.classList.add("active")
        }

        // Update page title
        const navText = item.querySelector("span").textContent
        pageTitle.textContent = navText

        // Close mobile menu
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove("active")
        }
    })
})

// Mobile menu toggle
mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove("active")
        }
    }
})

// Add Criterio functionality
const addCriterioBtn = document.getElementById("addCriterio")
const criteriosList = document.getElementById("criteriosList")

if (addCriterioBtn) {
    addCriterioBtn.addEventListener("click", () => {
        const newCriterio = document.createElement("div")
        newCriterio.className = "criterio-card"
        newCriterio.innerHTML = `
            <div class="criterio-header">
                <input type="text" class="form-input" placeholder="Nombre del criterio">
                <button type="button" class="btn-icon delete-criterio" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="criterio-body">
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea class="form-textarea" rows="2" placeholder="Descripción del criterio..."></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Peso (%)</label>
                        <input type="number" class="form-input" value="0" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Puntuación Máxima</label>
                        <input type="number" class="form-input" value="10" min="0">
                    </div>
                </div>
            </div>
        `

        criteriosList.appendChild(newCriterio)

        // Add delete functionality to new criterio
        const deleteBtn = newCriterio.querySelector(".delete-criterio")
        deleteBtn.addEventListener("click", () => {
            newCriterio.remove()
        })
    })
}

// Delete criterio functionality for existing criterios
document.querySelectorAll(".delete-criterio").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const criterioCard = e.target.closest(".criterio-card")
        if (criterioCard) {
            criterioCard.remove()
        }
    })
})

// Form submission
const rubricaForm = document.getElementById("rubricaForm")
if (rubricaForm) {
    rubricaForm.addEventListener("submit", (e) => {
        e.preventDefault()

        console.log("[v0] Form submitted")

        // Get form data
        const formData = {
            nombre: document.getElementById("nombreRubrica").value,
            asignatura: document.getElementById("asignatura").value,
            periodo: document.getElementById("periodo").value,
            descripcion: document.getElementById("descripcion").value,
            criterios: [],
        }

        // Get criterios
        const criterioCards = document.querySelectorAll(".criterio-card")
        criterioCards.forEach((card) => {
            const criterio = {
                nombre: card.querySelector(".criterio-header input").value,
                descripcion: card.querySelector(".criterio-body textarea").value,
                peso: card.querySelectorAll(".form-row input")[0].value,
                puntuacionMaxima: card.querySelectorAll(".form-row input")[1].value,
            }
            formData.criterios.push(criterio)
        })

        console.log("[v0] Form data:", formData)

        // Show success message
        alert("Rúbrica creada exitosamente")

        // Navigate to rubricas view
        const rubricasNav = document.querySelector('[data-view="rubricas"]')
        if (rubricasNav) {
            rubricasNav.click()
        }
    })
}

// Handle window resize
let resizeTimer
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove("active")
        }
    }, 250)
})