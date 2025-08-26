// Profile JavaScript - Profile management functionality

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeProfileTabs();
    loadUserData();
    initializeEditableFields();
    initializeSaveButtons();
});

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Initialize profile tabs
function initializeProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.getAttribute('aria-controls');
            
            // Update tabs
            tabs.forEach(t => {
                t.classList.remove('profile-tab--active');
                t.setAttribute('aria-selected', 'false');
            });
            this.classList.add('profile-tab--active');
            this.setAttribute('aria-selected', 'true');
            
            // Update panels
            panels.forEach(panel => {
                panel.style.display = panel.id === targetPanel ? 'block' : 'none';
            });
        });
    });
}

// Load user data from localStorage
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = localStorage.getItem('userRole');
    
    // Show appropriate profile section
    const userProfile = document.getElementById('user-profile');
    const chauffeurProfile = document.getElementById('chauffeur-profile');
    
    if (userRole === 'chauffeur') {
        userProfile.style.display = 'none';
        chauffeurProfile.style.display = 'block';
        loadChauffeurData();
    } else {
        userProfile.style.display = 'block';
        chauffeurProfile.style.display = 'none';
        loadUserProfileData();
    }
    
    // Load preferences
    loadPreferences();
    loadNotificationSettings();
}

// Load user profile data
function loadUserProfileData() {
    const savedData = JSON.parse(localStorage.getItem('profileData') || '{}');
    
    // Set form values
    document.getElementById('profile-name').value = savedData.name || 'John Doe';
    document.getElementById('profile-email').value = savedData.email || 'john@example.com';
    document.getElementById('profile-phone').value = savedData.phone || '+1 234 567 8900';
    document.getElementById('default-pickup').value = savedData.defaultPickup || '';
}

// Load chauffeur data
function loadChauffeurData() {
    const savedData = JSON.parse(localStorage.getItem('chauffeurData') || '{}');
    
    document.getElementById('chauffeur-name').value = savedData.name || 'Driver Name';
    document.getElementById('vehicle-info').value = savedData.vehicleInfo || '';
    document.getElementById('license-number').value = savedData.licenseNumber || '****1234';
    document.getElementById('availability').checked = savedData.availability || false;
}

// Load preferences
function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
    
    document.getElementById('language').value = preferences.language || 'en';
    document.getElementById('currency').value = preferences.currency || 'usd';
    document.getElementById('vehicle-preference').value = preferences.vehiclePreference || 'any';
}

// Load notification settings
function loadNotificationSettings() {
    const notifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    // Set default values if not saved
    const defaults = {
        emailBooking: true,
        emailReminders: true,
        emailPromotions: false,
        smsBooking: true,
        smsReminders: true,
        smsArrival: true
    };
    
    Object.keys(defaults).forEach(key => {
        const checkbox = document.querySelector(`input[name="${key}"]`);
        if (checkbox) {
            checkbox.checked = notifications[key] !== undefined ? notifications[key] : defaults[key];
        }
    });
}

// Initialize editable fields
function initializeEditableFields() {
    const editButtons = document.querySelectorAll('.edit-btn');
    
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            
            if (input.readOnly) {
                input.readOnly = false;
                input.focus();
                input.select();
                this.textContent = '✓';
            } else {
                input.readOnly = true;
                this.textContent = '✏️';
                // Save individual field
                saveProfileData();
            }
        });
    });
    
    // Save on enter key
    document.querySelectorAll('.editable-field input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !this.readOnly) {
                const editBtn = this.parentElement.querySelector('.edit-btn');
                if (editBtn) {
                    editBtn.click();
                }
            }
        });
    });
}

// Initialize save buttons
function initializeSaveButtons() {
    // Profile save
    const saveProfileBtn = document.getElementById('save-profile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileData);
    }
    
    // Preferences save
    const savePreferencesBtn = document.getElementById('save-preferences');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', savePreferences);
    }
    
    // Notifications save
    const saveNotificationsBtn = document.getElementById('save-notifications');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', saveNotificationSettings);
    }
}

// Save profile data
function saveProfileData() {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'chauffeur') {
        const chauffeurData = {
            name: document.getElementById('chauffeur-name').value,
            vehicleInfo: document.getElementById('vehicle-info').value,
            licenseNumber: document.getElementById('license-number').value,
            availability: document.getElementById('availability').checked
        };
        localStorage.setItem('chauffeurData', JSON.stringify(chauffeurData));
    } else {
        const profileData = {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value,
            defaultPickup: document.getElementById('default-pickup').value
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
    }
    
    showToast('Profile updated successfully', 'success');
}

// Save preferences
function savePreferences() {
    const preferences = {
        language: document.getElementById('language').value,
        currency: document.getElementById('currency').value,
        vehiclePreference: document.getElementById('vehicle-preference').value
    };
    
    localStorage.setItem('preferences', JSON.stringify(preferences));
    showToast('Preferences saved successfully', 'success');
}

// Save notification settings
function saveNotificationSettings() {
    const notifications = {};
    const checkboxes = document.querySelectorAll('.notifications-form input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        notifications[checkbox.name] = checkbox.checked;
    });
    
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    showToast('Notification settings updated', 'success');
}

// Logout handler
document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        showToast('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
});

// Toggle switch handler
const availabilityToggle = document.getElementById('availability');
if (availabilityToggle) {
    availabilityToggle.addEventListener('change', function() {
        const status = this.checked ? 'available' : 'unavailable';
        showToast(`You are now ${status} for rides`, 'info');
        saveProfileData();
    });
}