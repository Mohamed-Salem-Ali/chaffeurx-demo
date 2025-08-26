// Forms JavaScript - Form validation and handling

// Form validation patterns
const validationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]+$/,
    name: /^[a-zA-Z\s'-]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
};

// Initialize form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        handleContactForm(contactForm);
    }
    
    // Chauffeur application form
    const applicationForm = document.getElementById('chauffeur-application');
    if (applicationForm) {
        handleApplicationForm(applicationForm);
    }
});

// Contact form handler
function handleContactForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(form)) {
            // Simulate form submission
                        const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                const successDiv = document.getElementById('form-success');
                if (successDiv) {
                    successDiv.style.display = 'block';
                    form.style.display = 'none';
                } else {
                    showToast('Message sent successfully! We\'ll respond within 24 hours.', 'success');
                    form.reset();
                }
                
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }, 1500);
        }
    });
}

// Chauffeur application form handler
function handleApplicationForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(form)) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            // Simulate form submission
            setTimeout(() => {
                // Show success modal
                const modal = document.getElementById('success-modal');
                if (modal) {
                    modal.classList.add('modal--open');
                    modal.setAttribute('aria-hidden', 'false');
                }
                
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
                form.reset();
            }, 2000);
        }
    });
}

// Form validation
function validateForm(form) {
    const fields = form.querySelectorAll('[required]');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const errorSpan = field.nextElementSibling;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    field.classList.remove('error');
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.textContent = '';
    }
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    } else if (value) {
        // Validate based on field type
        switch (field.type) {
            case 'email':
                if (!validationPatterns.email.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
            case 'tel':
                if (!validationPatterns.phone.test(value)) {
                    errorMessage = 'Please enter a valid phone number';
                    isValid = false;
                }
                break;
            case 'text':
                if (field.name === 'fullName' || field.name === 'name') {
                    if (!validationPatterns.name.test(value)) {
                        errorMessage = 'Please enter a valid name';
                        isValid = false;
                    }
                }
                break;
        }
    }
    
    // Show error if validation failed
    if (!isValid) {
        field.classList.add('error');
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = errorMessage;
        }
    }
    
    return isValid;
}

// Real-time validation
document.addEventListener('blur', function(e) {
    if (e.target.matches('input[required], select[required], textarea[required]')) {
        validateField(e.target);
    }
}, true);

// Clear error on input
document.addEventListener('input', function(e) {
    if (e.target.matches('input.error, select.error, textarea.error')) {
        e.target.classList.remove('error');
        const errorSpan = e.target.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = '';
        }
    }
});

// File upload handling
document.addEventListener('change', function(e) {
    if (e.target.matches('input[type="file"]')) {
        const files = e.target.files;
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        
        for (let file of files) {
            if (file.size > maxSize) {
                showToast('File size must be less than 5MB', 'error');
                e.target.value = '';
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                showToast('Only PDF, JPG, and PNG files are allowed', 'error');
                e.target.value = '';
                return;
            }
        }
        
        if (files.length > 0) {
            const fileNames = Array.from(files).map(f => f.name).join(', ');
            showToast(`Selected: ${fileNames}`, 'info');
        }
    }
});

// Close modal function
window.closeModal = function() {
    const modal = document.querySelector('.modal--open');
    if (modal) {
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');
    }
};

// Modal click outside to close
document.addEventListener('click', function(e) {
    if (e.target.matches('.modal')) {
        closeModal();
    }
});

// Add input error styling
const style = document.createElement('style');
style.textContent = `
    input.error,
    select.error,
    textarea.error {
        border-color: var(--error-color);
    }
    
    input.error:focus,
    select.error:focus,
    textarea.error:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`;
document.head.appendChild(style);