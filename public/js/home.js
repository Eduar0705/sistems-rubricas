document.addEventListener("DOMContentLoaded", () => {
    // Cached elements
    const sidebar = document.getElementById("sidebar");
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const pageTitle = document.getElementById("pageTitle");
    const views = document.querySelectorAll(".view");

    // Helper: safely remove "active" from a NodeList
    function removeActiveFrom(nodeList) {
        if (!nodeList) return;
        nodeList.forEach((n) => n.classList && n.classList.remove("active"));
    }

    // NAVIGATION: use event delegation on sidebar if present, otherwise on document
    const navContainer = sidebar || document;
    navContainer.addEventListener("click", (e) => {
        try {
            const item = e.target.closest(".nav-item");
            if (!item) return;

            // If external, allow default navigation
            if (item.getAttribute("data-external") === "true") {
                return;
            }

            e.preventDefault();

            // Remove active from nav items scoped to sidebar if exists, otherwise global
            const scope = sidebar ? sidebar : document;
            removeActiveFrom(scope.querySelectorAll(".nav-item"));

            item.classList.add("active");

            // Show/hide views
            const viewName = item.getAttribute("data-view");
            if (views && views.length) removeActiveFrom(views);
            if (viewName) {
                const selectedView = document.getElementById(viewName);
                if (selectedView) selectedView.classList.add("active");
            }

            // Update page title safely
            const span = item.querySelector("span");
            if (pageTitle && span) pageTitle.textContent = span.textContent || "";

            // Close mobile menu on small screens
            if (window.innerWidth <= 1024 && sidebar) {
                sidebar.classList.remove("active");
            }
        } catch (err) {
            // swallow errors to avoid interrupting other scripts
            console.error("Nav handler error:", err);
        }
    });

    // Mobile menu toggle
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener("click", (e) => {
            try {
                sidebar.classList.toggle("active");
            } catch (err) {
                console.error("Mobile toggle error:", err);
            }
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
        try {
            if (!sidebar || !mobileMenuToggle) return;
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    sidebar.classList.remove("active");
                }
            }
        } catch (err) {
            console.error("Outside click handler error:", err);
        }
    });

    // Handle window resize (debounced)
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            try {
                if (window.innerWidth > 1024 && sidebar) {
                    sidebar.classList.remove("active");
                }
            } catch (err) {
                console.error("Resize handler error:", err);
            }
        }, 250);
    });
});

// =============================================
// MÓDULO DE LISTADO DE ESTUDIANTES
// =============================================
function exportarExcel() {
    window.location.href = '/api/teacher/evaluaciones/export/excel';
}

function exportarPDF() {
    window.location.href = '/api/teacher/evaluaciones/export/pdf';
}