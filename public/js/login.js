// Toggle password visibility
const togglePassword = document.getElementById("togglePassword")
const passwordInput = document.getElementById("password")

togglePassword.addEventListener("click", function () {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
  passwordInput.setAttribute("type", type)

  const icon = this.querySelector("i")
  icon.classList.toggle("fa-eye")
  icon.classList.toggle("fa-eye-slash")
})

// Form submission
const loginForm = document.getElementById("loginForm")
const loginBtn = document.getElementById("loginBtn")
const errorAlert = document.getElementById("errorAlert")
const errorMessage = document.getElementById("errorMessage")

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  // Hide previous errors
  errorAlert.style.display = "none"

  // Get form data
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const remember = document.getElementById("remember").checked

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("Por favor ingresa un correo electrónico válido")
    return
  }

  // Validate password length
  if (password.length < 6) {
    showError("La contraseña debe tener al menos 6 caracteres")
    return
  }

  // Show loading state
  setLoadingState(true)

  // Simulate API call
  try {
    await simulateLogin(email, password, remember)

    // Success - redirect to dashboard
    window.location.href = "/login"
  } catch (error) {
    showError(error.message)
    setLoadingState(false)
  }
})

function showError(message) {
  errorMessage.textContent = message
  errorAlert.style.display = "flex"

  // Scroll to error
  errorAlert.scrollIntoView({ behavior: "smooth", block: "nearest" })
}

function setLoadingState(isLoading) {
  const btnText = loginBtn.querySelector(".btn-text")
  const btnLoader = loginBtn.querySelector(".btn-loader")

  if (isLoading) {
    btnText.style.display = "none"
    btnLoader.style.display = "block"
    loginBtn.disabled = true
  } else {
    btnText.style.display = "block"
    btnLoader.style.display = "none"
    loginBtn.disabled = false
  }
}

// Social login buttons
const socialButtons = document.querySelectorAll(".btn-social")
socialButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const provider = this.classList.contains("btn-google") ? "Google" : "Microsoft"
    alert(`Autenticación con ${provider} no está disponible en la demo`)
  })
})

// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
  const session = localStorage.getItem("userSession") || sessionStorage.getItem("userSession")
  if (session) {
    // User is already logged in, redirect to dashboard
    window.location.href = "/home"
  }
})
