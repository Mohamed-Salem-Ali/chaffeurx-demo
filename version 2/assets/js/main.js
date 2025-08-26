// Main JavaScript - Core functionality

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializeToasts();
    initializeCarousel();
    initializeAccordions();
    initializeAnimations();
    checkAuth();
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle__icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Navigation
function initializeNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isOpen);
            navMenu.classList.toggle('nav__menu--open');
        });
    }
    
    // Active link highlighting
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop()) {
            link.classList.add('nav__link--active');
        }
    });
    
    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Toast Notifications
function initializeToasts() {
    window.showToast = function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        
        container.appendChild(toast);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Click to dismiss
        toast.addEventListener('click', function() {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        });
    };
}

// Carousel
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.carousel__track');
    const prevBtn = carousel.querySelector('.carousel__btn--prev');
    const nextBtn = carousel.querySelector('.carousel__btn--next');
    const indicatorsContainer = carousel.querySelector('.carousel__indicators');
    
    // Load testimonials
    loadTestimonials();
    
    let currentIndex = 0;
    
    function loadTestimonials() {
        // Mock testimonials data
        const testimonials = [
            {
                name: "Sarah Johnson",
                role: "Business Executive",
                text: "LuxRide has transformed my business travel. Always on time, always professional.",
                rating: 5
            },
            {
                name: "Michael Chen",
                role: "Frequent Traveler",
                text: "The best chauffeur service I've used. Impeccable vehicles and outstanding drivers.",
                rating: 5
            },
            {
                name: "Emily Rodriguez",
                role: "Event Planner",
                text: "My go-to for all corporate events. They never disappoint!",
                rating: 5
            }
        ];
        
        // Populate carousel
        track.innerHTML = testimonials.map(testimonial => `
            <div class="carousel__item">
                <div class="testimonial">
                    <div class="testimonial__stars">${'⭐'.repeat(testimonial.rating)}</div>
                    <p class="testimonial__text">"${testimonial.text}"</p>
                    <div class="testimonial__author">
                        <strong>${testimonial.name}</strong>
                        <span>${testimonial.role}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Create indicators
        indicatorsContainer.innerHTML = testimonials.map((_, index) => `
            <button class="carousel__indicator ${index === 0 ? 'carousel__indicator--active' : ''}" 
                    data-index="${index}" 
                    aria-label="Go to testimonial ${index + 1}">
            </button>
        `).join('');
        
        // Add indicator click handlers
        const indicators = indicatorsContainer.querySelectorAll('.carousel__indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                currentIndex = parseInt(indicator.dataset.index);
                updateCarousel();
            });
        });
    }
    
    function updateCarousel() {
        const items = track.querySelectorAll('.carousel__item');
        const indicators = indicatorsContainer.querySelectorAll('.carousel__indicator');
        
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('carousel__indicator--active', index === currentIndex);
        });
    }
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + track.children.length) % track.children.length;
            updateCarousel();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % track.children.length;
            updateCarousel();
        });
    }
    
    // Auto-advance
    setInterval(() => {
        currentIndex = (currentIndex + 1) % track.children.length;
        updateCarousel();
            }, 5000);
}

// Accordions
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            const content = document.getElementById(header.getAttribute('aria-controls'));
            
            // Close all other accordions in the same container
            const accordion = header.closest('.accordion');
            if (accordion) {
                accordion.querySelectorAll('.accordion-header').forEach(otherHeader => {
                    if (otherHeader !== header) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        const otherContent = document.getElementById(otherHeader.getAttribute('aria-controls'));
                        if (otherContent) {
                            otherContent.hidden = true;
                        }
                    }
                });
            }
            
            // Toggle current accordion
            header.setAttribute('aria-expanded', !isExpanded);
            if (content) {
                content.hidden = isExpanded;
            }
        });
    });
}

// Animations
function initializeAnimations() {
    // Animate stats counters
    const statNumbers = document.querySelectorAll('.stat-card__number');
    
    if (statNumbers.length > 0) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    animateCounter(entry.target);
                    entry.target.classList.add('counted');
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000; // 2 seconds
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, duration / steps);
}

// Authentication Check
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const authLink = document.querySelector('.nav__link--auth');
    
    if (token && authLink) {
        // User is logged in
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.addEventListener('click', handleLogout);
        
        // Show profile link if user is logged in
        const profileLink = document.createElement('li');
        profileLink.innerHTML = '<a href="profile.html" class="nav__link">Profile</a>';
        authLink.parentElement.insertAdjacentElement('beforebegin', profileLink);
    }
}

function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Modal functionality
window.closeModal = function() {
    const modal = document.querySelector('.modal--open');
    if (modal) {
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');
    }
};

// Escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Price estimator
if (document.getElementById('price-estimator')) {
    const form = document.getElementById('price-estimator');
    const resultDiv = document.getElementById('estimator-result');
    const priceSpan = document.getElementById('estimated-price');
    const proceedBtn = document.getElementById('proceed-booking');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const serviceType = form.serviceType.value;
        const distance = parseFloat(form.distance.value) || 0;
        const hours = parseFloat(form.hours.value) || 0;
        const vehicleClass = form.vehicleClass.value;
        
        // Simple pricing logic
        let basePrice = 0;
        const rates = {
            airport: { base: 50, perMile: 2 },
            hourly: { base: 0, perHour: 80 },
            intercity: { base: 100, perMile: 1.5 },
            corporate: { base: 150, perMile: 2.5 }
        };
        
        const classMultipliers = {
            standard: 1,
            executive: 1.5,
            luxury: 2
        };
        
        if (serviceType && rates[serviceType]) {
            if (serviceType === 'hourly') {
                basePrice = rates[serviceType].perHour * hours;
            } else {
                basePrice = rates[serviceType].base + (rates[serviceType].perMile * distance);
            }
            
            basePrice *= classMultipliers[vehicleClass];
            
            priceSpan.textContent = Math.round(basePrice);
            resultDiv.style.display = 'block';
            proceedBtn.style.display = 'inline-block';
        }
    });
    
    proceedBtn.addEventListener('click', function() {
        // Store estimate data
        sessionStorage.setItem('estimatedPrice', priceSpan.textContent);
        sessionStorage.setItem('serviceType', form.serviceType.value);
        sessionStorage.setItem('vehicleClass', form.vehicleClass.value);
        window.location.href = 'booking.html';
    });
}

// Services page - Load services dynamically
if (document.getElementById('services-grid')) {
    loadServices();
}

function loadServices() {
    const servicesData = [
        {
            icon: '✈️',
            name: 'Airport Transfer',
            description: 'Reliable pickup and drop-off to all major airports',
            price: 'From $50'
        },
        {
            icon: '🕐',
            name: 'Hourly Chauffeur',
            description: 'Flexible hourly service for multiple stops',
            price: 'From $80/hour'
        },
        {
            icon: '🏙️',
            name: 'Intercity Travel',
            description: 'Comfortable long-distance journeys between cities',
            price: 'From $1.50/mile'
        },
        {
            icon: '💼',
            name: 'Corporate Package',
            description: 'Tailored solutions for business travel needs',
            price: 'Custom pricing'
        }
    ];
    
    const grid = document.getElementById('services-grid');
    grid.innerHTML = servicesData.map(service => `
        <div class="service-card">
            <div class="service-card__icon">${service.icon}</div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="service-card__price">${service.price}</div>
        </div>
    `).join('');
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);