// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Toggle password visibility
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);

            const icon = this.querySelector("i");
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        });
    }

    // Manejo del formulario de login
    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            // Validación básica
            const cedula = document.getElementById("cedula");
            const password = document.getElementById("password");

            if (!cedula.value.trim()) {
                e.preventDefault();
                mostrarAlerta('error', 'Error', 'Por favor ingresa tu usuario');
                cedula.focus();
                return false;
            }

            if (!password.value.trim()) {
                e.preventDefault();
                mostrarAlerta('error', 'Error', 'Por favor ingresa tu contraseña');
                password.focus();
                return false;
            }

            // Mostrar estado de carga en el botón
            if (loginBtn) {
                const btnText = loginBtn.querySelector('.btn-text');
                const btnLoader = loginBtn.querySelector('.btn-loader');
                
                if (btnText && btnLoader) {
                    btnText.style.display = 'none';
                    btnLoader.style.display = 'inline-block';
                }
                
                loginBtn.disabled = true;
                loginBtn.classList.add('loading');
            }
        });
    }

// Prevenir espacios en el campo de cédula
const cedulaInput = document.getElementById("cedula");
if (cedulaInput) {
    cedulaInput.addEventListener("input", function(e) {
        this.value = this.value.replace(/\s/g, '');
        validarLongitudCedula(this);
    });

    // Solo permitir números
    cedulaInput.addEventListener("keypress", function(e) {
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
            e.preventDefault();
        }
    });

    // Validar también cuando pierde el foco
    cedulaInput.addEventListener("blur", function(e) {
        validarLongitudCedula(this);
    });

    // Función para validar longitud y cambiar color
    function validarLongitudCedula(input) {
        const valor = input.value.trim();

        // Obtener o crear el alert pequeño
        let alertEl = input.nextElementSibling;
        if (!alertEl || !alertEl.classList.contains('cedula-alert')) {
            alertEl = document.createElement('div');
            alertEl.className = 'cedula-alert';
            alertEl.setAttribute('aria-live', 'polite');
            // Estilos inline simples para mostrar como "small alert"
            alertEl.style.color = '#dc3545';
            alertEl.style.fontSize = '0.85rem';
            alertEl.style.marginTop = '0.25rem';
            alertEl.style.display = 'none';
            alertEl.textContent = 'El mínimo de digitos son 7 y el máximo 8';
            input.parentNode.insertBefore(alertEl, input.nextSibling);
        }

        // Validación de longitud y colores como antes
        if (valor.length < 7) {
            input.style.borderColor = "#dc3545";
            input.style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
            alertEl.style.display = 'block';
        } else if (valor.length >= 7 && valor.length <= 8) {
            input.style.borderColor = "#28a745";
            input.style.boxShadow = "0 0 0 0.2rem rgba(40, 167, 69, 0.25)";
            alertEl.style.display = 'none';
        } else {
            input.style.borderColor = "#dc3545";
            input.style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
            alertEl.style.display = 'block';
        }

        // Asegurarse de mostrar el alert también al hacer focus (clic) y no duplicar listeners
        if (!input.dataset.cedulaListeners) {
            input.addEventListener('focus', function () {
                // Mostrar el mensaje si actualmente NO cumple requisitos
                const v = this.value.trim();
                if (v.length < 7 || v.length > 8) {
                    alertEl.style.display = 'block';
                } else {
                    alertEl.style.display = 'none';
                }
            });

            // También ocultar mensaje cuando se vuelva válido en cada input (ya hay listener, pero por seguridad)
            input.addEventListener('input', function () {
                const v = this.value.trim();
                if (v.length >= 7 && v.length <= 8) {
                    alertEl.style.display = 'none';
                } else {
                    // Si está enfocado, mostrar; si no, mantener según validarLongitudCedula (que llama esto)
                    if (document.activeElement === this) {
                        alertEl.style.display = 'block';
                    }
                }
            });

            input.dataset.cedulaListeners = '1';
        }
    }

    // Validar inicialmente si ya tiene valor
    validarLongitudCedula(cedulaInput);
}

    // Mejorar la experiencia del usuario con Enter
    if (passwordInput) {
        passwordInput.addEventListener("keypress", function(e) {
            if (e.key === 'Enter') {
                loginForm.submit();
            }
        });
    }

    // Función para mostrar alertas con SweetAlert2
    function mostrarAlerta(icon, title, text) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: icon,
                title: title,
                text: text,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#1e3a8a'
            });
        } else {
            alert(text);
        }
    }

    // Animación de entrada suave
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) {
        loginContainer.style.opacity = '0';
        loginContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            loginContainer.style.transition = 'all 0.5s ease';
            loginContainer.style.opacity = '1';
            loginContainer.style.transform = 'translateY(0)';
        }, 100);
    }

    // Auto-focus en el primer campo
    if (cedulaInput && !cedulaInput.value) {
        cedulaInput.focus();
    }

});

// Función global para resetear el botón de login (útil si hay error de servidor)
function resetLoginButton() {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        
        if (btnText && btnLoader) {
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
        
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
    }
}