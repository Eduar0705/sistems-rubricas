// ========================================
// Contenido DOM Cargado
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Establecer año actual en el pie de página
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Inicializar todas las funciones
    initNavbar();
    initSmoothScroll();
    initScrollAnimations();
    initProgressBars();
    initScrollToTop();
    
    console.log('✅ IUJO - Sistema de Rúbricas cargado correctamente');
});

// ========================================
// Efecto de Desplazamiento del Navbar
// ========================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Cerrar menú móvil al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
}

// ========================================
// Desplazamiento Suave
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Omitir si href es solo "#"
            if (targetId === '#') {
                e.preventDefault();
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Animaciones de Desplazamiento
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar tarjetas de características
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Observar tarjetas de servicios
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ========================================
// Animación de Barras de Progreso
// ========================================
function initProgressBars() {
    const progressObserver = new IntersectionObserver(
        function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBars = entry.target.querySelectorAll('.progress-bar');
                    
                    progressBars.forEach(bar => {
                        const targetWidth = bar.style.width;
                        bar.style.width = '0';
                        
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 200);
                    });
                    
                    progressObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.5
        }
    );
    
    const heroCard = document.querySelector('.hero-card');
    if (heroCard) {
        progressObserver.observe(heroCard);
    }
}

// ========================================
// Botón de Desplazamiento hacia Arriba
// ========================================
function initScrollToTop() {
    // Crear botón de desplazamiento hacia arriba
    const scrollTopBtn = document.createElement('div');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);
    
    // Mostrar/ocultar botón según la posición de desplazamiento
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    // Scroll to top when clicked
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// Enlace de Navegación Activo al Desplazarse
// ========================================
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ========================================
// Efectos de Hover en Tarjetas
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-card, .service-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// ========================================
// Animación de Pulsación del Botón CTA
// ========================================
function initCTAPulse() {
    const ctaButtons = document.querySelectorAll('.cta-section .btn');
    
    ctaButtons.forEach(button => {
        setInterval(() => {
            button.style.transform = 'scale(1.05)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        }, 3000);
    });
}

// Inicializar pulsación CTA
setTimeout(initCTAPulse, 2000);

// ========================================
// Validación de Formulario (si se necesita en el futuro)
// ========================================
function validateForm(formId) {
    const form = document.getElementById(formId);
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        if (isValid) {
            // Submit form
            console.log('Formulario válido');
            form.submit();
        }
    });
}

// ========================================
// Animación de Carga
// ========================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Ocultar spinner de carga si existe
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
});

// ========================================
// Prevenir Comportamiento Predeterminado para Enlaces #
// ========================================
document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
    });
});

// ========================================
// Carga Diferida de Imágenes (si se necesita)
// ========================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Inicializar carga diferida si existen imágenes
if (document.querySelectorAll('img[data-src]').length > 0) {
    initLazyLoading();
}

// ========================================
// Mensaje de Bienvenida en Consola
// ========================================
console.log('%c🎓 IUJO - Sistema de Gestión de Rúbricas', 'color: #1a365d; font-size: 20px; font-weight: bold;');
console.log('%cInstituto Universitario Jesús Obrero', 'color: #e53e3e; font-size: 14px;');
console.log('%cExtensión Barquisimeto - Fe y Alegría', 'color: #718096; font-size: 12px;');

// ========================================
// Exportar funciones para uso externo
// ========================================
window.iujoApp = {
    smoothScrollTo: function(targetId) {
        const element = document.getElementById(targetId);
        if (element) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = element.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
};