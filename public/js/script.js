// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileMenu = document.getElementById("mobileMenu")

mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active")
    const icon = mobileMenuBtn.querySelector("i")
    icon.classList.toggle("fa-bars")
    icon.classList.toggle("fa-times")
})

// Close mobile menu when clicking a link
const mobileLinks = document.querySelectorAll(".mobile-link")
mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
        mobileMenu.classList.remove("active")
        const icon = mobileMenuBtn.querySelector("i")
        icon.classList.add("fa-bars")
        icon.classList.remove("fa-times")
    })
})

// Smooth scroll function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId)
    if (section) {
        section.scrollIntoView({ behavior: "smooth" })
    }
}

// Active nav link on scroll
const sections = document.querySelectorAll("section[id]")
const navLinks = document.querySelectorAll(".nav-link")

window.addEventListener("scroll", () => {
    let current = ""

    sections.forEach((section) => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.clientHeight
        if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id")
        }
    })

    navLinks.forEach((link) => {
        link.classList.remove("active")
        if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active")
        }
    })
})

// Animate progress bars when in view
const observerOptions = {
    threshold: 0.5,
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
        const progressBars = entry.target.querySelectorAll(".progress-fill")
        progressBars.forEach((bar) => {
            const width = bar.style.width
            bar.style.width = "0"
            setTimeout(() => {
            bar.style.width = width
            }, 100)
        })
        }
    })
}, observerOptions)

const heroCard = document.querySelector(".hero-card")
if (heroCard) {
    observer.observe(heroCard)
}

// Add animation to feature cards on scroll
const featureCards = document.querySelectorAll(".feature-card")
const cardObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
            entry.target.style.opacity = "1"
            entry.target.style.transform = "translateY(0)"
            }, index * 100)
        }
        })
    },
    { threshold: 0.1 },
)

featureCards.forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "all 0.5s ease"
    cardObserver.observe(card)
})
