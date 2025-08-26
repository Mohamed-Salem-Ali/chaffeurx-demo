// Auth JavaScript - Authentication handling

const validationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simple email regex
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/ // min 8 chars, 1 upper, 1 lower, 1 number
};

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggles();
});



// Initialize auth forms
function initializeAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchAuthTab(targetTab);
        });
    });
    
    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form handler
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => {
        t.classList.toggle('auth-tab--active', t.getAttribute('data-tab') === tab);
    });
    
    forms.forEach(form => {
        form.style.display = form.getAttribute('data-form') === tab ? 'block' : 'none';
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const role = form.role.value;
    const remember = form.remember.checked;
    
    if (!validateAuthForm(form)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
        // Simulate API call
        await mockLogin(email, password, role);
        
        // Store auth data
        const token = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        
        if (remember) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Store user data
        const userData = {
            email: email,
            role: role,
            name: 'John Doe' // Mock name
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showToast('Login successful!', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
        
    } catch (error) {
        showToast(error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const role = form.role.value;
    
    if (!validateAuthForm(form)) {
        return;
    }
    
    // Check password match
    if (password !== confirmPassword) {
        showFieldError(form.confirmPassword, 'Passwords do not match');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    
    try {
        // Simulate API call
        await mockSignup(name, email, password, role);
        
        showToast('Account created successfully! Please login.', 'success');
        
        // Switch to login tab
        setTimeout(() => {
            switchAuthTab('login');
            form.reset();
        }, 1500);
        
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

// Mock login API
function mockLogin(email, password, role) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const demoUsers = {
                "test@gmail.com": "Test1234",
                "driver@luxride.com": "Driver1234"
            };
            if (demoUsers[email] && demoUsers[email] === password) {
                resolve({ success: true });
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

// Mock signup API
function mockSignup(name, email, password, role) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let users = JSON.parse(localStorage.getItem('luxrideUsers') || "{}");
            if (users[email]) {
                reject(new Error('Email already registered'));
            } else {
                users[email] = { name, email, password, role };
                localStorage.setItem('luxrideUsers', JSON.stringify(users));
                resolve({ success: true });
            }
        }, 1000);
    });
}

// Validate auth forms
function validateAuthForm(form) {
    const email = form.email;
    const password = form.password;
    let isValid = true;
    
        // Validate email
    if (!validationPatterns.email.test(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (form.id === 'signup-form') {
        if (!validationPatterns.password.test(password.value)) {
            showFieldError(password, 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
            isValid = false;
        }
    } else if (password.value.length < 8) {
        showFieldError(password, 'Password must be at least 8 characters');
        isValid = false;
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

// Password toggle functionality
function initializePasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('.password-toggle-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '👁️‍🗨️';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        });
    });
}

// Clear errors on input
document.addEventListener('input', function(e) {
    if (e.target.matches('.auth-form input')) {
        e.target.classList.remove('error');
        const errorSpan = e.target.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
        }
    }
});

// Check for remember me on page load
if (localStorage.getItem('rememberMe') === 'true') {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const rememberCheckbox = loginForm.querySelector('input[name="remember"]');
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
}

// Forgot password handler
document.addEventListener('click', function(e) {
    if (e.target.matches('.forgot-password')) {
        e.preventDefault();
        showToast('Password reset functionality coming soon!', 'info');
    }
});