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

// Carousel with JSON data loading
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.carousel__track');
    const prevBtn = carousel.querySelector('.carousel__btn--prev');
    const nextBtn = carousel.querySelector('.carousel__btn--next');
    const indicatorsContainer = carousel.querySelector('.carousel__indicators');
    
    let currentIndex = 0;
    
    // Load testimonials from JSON
    fetch('assets/data/testimonials.json')
        .then(response => response.json())
        .then(data => {
            const testimonials = data.testimonials;
            
            // Populate carousel
            track.innerHTML = testimonials.map(testimonial => `
                <div class="carousel__item">
                    <div class="testimonial">
                        <div class="testimonial__stars">${'⭐'.repeat(testimonial.rating)}</div>
                        <p class="testimonial__text">"${testimonial.text}"</p>
                        <div class="testimonial__author">
                            <strong>${testimonial.name}</strong>
                            <span>${testimonial.role} - ${testimonial.company}</span>
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
            
            // Auto-advance
            setInterval(() => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                updateCarousel();
            }, 5000);
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            // Fallback to static testimonials if JSON fails to load
        });
    
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
            const itemCount = track.children.length;
            currentIndex = (currentIndex - 1 + itemCount) % itemCount;
            updateCarousel();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const itemCount = track.children.length;
            currentIndex = (currentIndex + 1) % itemCount;
            updateCarousel();
        });
    }
}

// Accordions - Load FAQs from JSON for cancellation policy page
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
    
    // Load FAQs if on cancellation policy page
    const faqsAccordion = document.getElementById('cancellation-faqs');
    if (faqsAccordion) {
        fetch('assets/data/faqs.json')
            .then(response => response.json())
            .then(data => {
                const cancellationFaqs = data.faqs.filter(faq => 
                    faq.category === 'cancellation' || faq.id <= 5
                );
                
                faqsAccordion.innerHTML = cancellationFaqs.map((faq, index) => `
                    <div class="accordion-item">
                        <button class="accordion-header" aria-expanded="false" aria-controls="faq-${faq.id}">
                            <h3>${faq.question}</h3>
                            <span class="accordion-icon">+</span>
                        </button>
                        <div class="accordion-content" id="faq-${faq.id}" hidden>
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                `).join('');
                
                // Re-initialize accordion handlers for new content
                faqsAccordion.querySelectorAll('.accordion-header').forEach(header => {
                    header.addEventListener('click', function() {
                        const isExpanded = header.getAttribute('aria-expanded') === 'true';
                        const content = document.getElementById(header.getAttribute('aria-controls'));
                        
                        header.setAttribute('aria-expanded', !isExpanded);
                        if (content) {
                            content.hidden = isExpanded;
                        }
                    });
                });
            })
            .catch(error => console.error('Error loading FAQs:', error));
    }
}

// Rest of the main.js remains the same...
// (Continue with existing animations, checkAuth, etc.)

// Services page - Load services dynamically from JSON
if (document.getElementById('services-grid')) {
    loadServices();
}

function loadServices() {
    fetch('assets/data/services.json')
        .then(response => response.json())
        .then(data => {
            const grid = document.getElementById('services-grid');
            grid.innerHTML = data.services.map(service => `
                <div class="service-card">
                    <div class="service-card__icon">${service.icon}</div>
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                    <ul class="service-card__features">
                        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                                        </ul>
                    <div class="service-card__price">
                        ${service.basePrice ? `From $${service.basePrice}` : service.priceUnit} 
                        ${service.priceUnit !== 'Custom pricing' && service.basePrice ? `/${service.priceUnit}` : ''}
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading services:', error);
            // Fallback content
            document.getElementById('services-grid').innerHTML = '<p>Error loading services. Please refresh the page.</p>';
        });
}

// Animations (keep existing code)
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

// Price estimator with service data
if (document.getElementById('price-estimator')) {
    const form = document.getElementById('price-estimator');
    const resultDiv = document.getElementById('estimator-result');
    const priceSpan = document.getElementById('estimated-price');
    const proceedBtn = document.getElementById('proceed-booking');
    
    // Load services for dropdown
    fetch('assets/data/services.json')
        .then(response => response.json())
        .then(data => {
            const serviceSelect = document.getElementById('service-type');
            if (serviceSelect && serviceSelect.options.length <= 1) {
                data.services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.name.toLowerCase().replace(/\s+/g, '-');
                    option.textContent = service.name;
                    serviceSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading services for estimator:', error));
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const serviceType = form.serviceType.value;
        const distance = parseFloat(form.distance.value) || 0;
        const hours = parseFloat(form.hours.value) || 0;
        const vehicleClass = form.vehicleClass.value;
        
        // Simple pricing logic
        let basePrice = 0;
        const rates = {
            'airport-transfer': { base: 50, perMile: 2 },
            'hourly-chauffeur': { base: 0, perHour: 80 },
            'intercity-travel': { base: 100, perMile: 1.5 },
            'corporate-package': { base: 150, perMile: 2.5 }
        };
        
        const classMultipliers = {
            standard: 1,
            executive: 1.5,
            luxury: 2
        };
        
        if (serviceType && rates[serviceType]) {
            if (serviceType === 'hourly-chauffeur') {
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

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .service-card__features {
        list-style: none;
        margin: var(--spacing-md) 0;
        padding: 0;
    }
    
    .service-card__features li {
        padding: var(--spacing-xs) 0;
        color: var(--text-light);
        font-size: 0.875rem;
    }
    
    .service-card__features li:before {
        content: "✓ ";
        color: var(--success-color);
        font-weight: bold;
    }
`;
document.head.appendChild(style);