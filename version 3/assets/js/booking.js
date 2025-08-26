// Booking JavaScript - Multi-step booking flow

let currentStep = 1;
let bookingData = {};
let vehiclesData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load existing booking data if available
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        bookingData = JSON.parse(savedData);
        
        // Restore form values if user navigates back
        Object.keys(bookingData).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = bookingData[key];
            }
        });
    }
    
    initializeBooking();
    loadStoredData();
    initializeAutocomplete();
    initializeDateTimePickers();
    loadVehiclesData();
});

// Load vehicles data on page load
function loadVehiclesData() {
    fetch('assets/data/vehicles.json')
        .then(response => response.json())
        .then(data => {
            vehiclesData = data.vehicles;
        })
        .catch(error => console.error('Error loading vehicles data:', error));
}

// Initialize booking flow (keep existing code)
function initializeBooking() {
    const form = document.getElementById('booking-form');
    const nextBtn = document.getElementById('next-step');
    const prevBtn = document.getElementById('prev-step');
    const submitBtn = document.getElementById('submit-booking');
    
    // Navigation handlers
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNextStep);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', handlePrevStep);
    }
    
    if (form) {
        form.addEventListener('submit', handleBookingSubmit);
    }
    
    // Apply promo code
    const applyPromoBtn = document.getElementById('apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', handlePromoCode);
    }
    
    // Vehicle selection
    document.addEventListener('click', function(e) {
        if (e.target.closest('.vehicle-card')) {
            handleVehicleSelection(e.target.closest('.vehicle-card'));
        }
    });
}

// Load available vehicles from JSON
function loadAvailableVehicles() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    
    if (vehiclesData.length > 0) {
        // Filter vehicles based on selected service type if needed
        const serviceType = bookingData.serviceType;
        let filteredVehicles = vehiclesData;
        
        // You can add filtering logic here based on service type
        
        vehiclesGrid.innerHTML = filteredVehicles.map(vehicle => {
            const basePrice = calculateVehiclePrice(vehicle);
            return `
                <div class="vehicle-card" data-vehicle-id="${vehicle.id}" data-price="${basePrice}" data-vehicle='${JSON.stringify(vehicle)}'>
                    <div class="vehicle-card__image">
                        <img src="${vehicle.image}" alt="${vehicle.name}">
                    </div>
                    <h3>${vehicle.name}</h3>
                    <p>${vehicle.type} • ${vehicle.capacity.passengers} passengers • ${vehicle.capacity.luggage} bags</p>
                    <div class="vehicle-card__features">
                        ${vehicle.features.slice(0, 3).map(f => `<span class="vehicle-card__feature">${f}</span>`).join('')}
                                        </div>
                    <p class="vehicle-card__description">${vehicle.description}</p>
                    <div class="vehicle-card__price">$${basePrice}</div>
                </div>
            `;
        }).join('');
    } else {
        // Fallback if data hasn't loaded
        vehiclesGrid.innerHTML = '<p>Loading vehicles...</p>';
        // Retry loading
        fetch('assets/data/vehicles.json')
            .then(response => response.json())
            .then(data => {
                vehiclesData = data.vehicles;
                loadAvailableVehicles(); // Retry
            })
            .catch(error => {
                vehiclesGrid.innerHTML = '<p>Error loading vehicles. Please refresh the page.</p>';
            });
    }
}

// Calculate vehicle price based on service and vehicle type
function calculateVehiclePrice(vehicle) {
    const basePrice = bookingData.vehiclePrice || 100;
    return Math.round(basePrice * vehicle.priceMultiplier);
}

// Handle vehicle selection (updated)
function handleVehicleSelection(card) {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    vehicleCards.forEach(c => c.classList.remove('vehicle-card--selected'));
    
    card.classList.add('vehicle-card--selected');
    
    // Store selected vehicle data
    const vehicleData = JSON.parse(card.dataset.vehicle);
    bookingData.vehicleId = card.dataset.vehicleId;
    bookingData.vehiclePrice = card.dataset.price;
    bookingData.vehicleName = `${vehicleData.name} (${vehicleData.type})`;
    bookingData.vehicleData = vehicleData;
}

// Rest of booking.js remains the same...
// (Keep all existing functions like handleNextStep, validateStep, etc.)

// Load stored data (keep existing code)
function loadStoredData() {
    const estimatedPrice = sessionStorage.getItem('estimatedPrice');
    const serviceType = sessionStorage.getItem('serviceType');
    const vehicleClass = sessionStorage.getItem('vehicleClass');
    
    if (serviceType) {
        const serviceSelect = document.getElementById('service-type-booking');
        if (serviceSelect) {
            serviceSelect.value = serviceType;
        }
    }
}

// Update the handleNextStep function to ensure data is saved:
function handleNextStep() {
    if (validateStep(currentStep)) {
        saveStepData(currentStep);
        
        // Load saved data from session storage to ensure persistence
        const savedData = sessionStorage.getItem('bookingData');
        if (savedData) {
            bookingData = JSON.parse(savedData);
        }
        
        currentStep++;
        showStep(currentStep);
        updateProgressBar();
        
        if (currentStep === 2) {
            loadAvailableVehicles();
        } else if (currentStep === 3) {
            showReviewSummary();
        }
    }
}

// Handle previous step
function handlePrevStep() {
    currentStep--;
    showStep(currentStep);
    updateProgressBar();
}

// Also update the validateStep function to be more specific:
function validateStep(step) {
    const currentStepEl = document.querySelector(`.booking-step[data-step="${step}"]`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value || field.value.trim() === '') {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Special validation for step 2 (vehicle selection)
    if (step === 2 && !bookingData.vehicleId) {
        showToast('Please select a vehicle', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Save step data
function saveStepData(step) {
    const currentStepEl = document.querySelector(`.booking-step[data-step="${step}"]`);
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name) {
            // For select elements, also save the text content
            if (input.tagName === 'SELECT' && input.selectedIndex > 0) {
                bookingData[input.name] = input.value;
                bookingData[input.name + 'Text'] = input.options[input.selectedIndex].text;
            } else {
                bookingData[input.name] = input.value;
            }
        }
    });
    
    // Save to session storage
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    console.log('Saved booking data:', bookingData); // Debug log
}

// Show specific step
function showStep(step) {
    const steps = document.querySelectorAll('.booking-step');
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const submitBtn = document.getElementById('submit-booking');
    
    steps.forEach((stepEl, index) => {
        stepEl.style.display = index + 1 === step ? 'block' : 'none';
    });
    
    // Update navigation buttons
    prevBtn.style.display = step === 1 ? 'none' : 'block';
    nextBtn.style.display = step < 3 ? 'block' : 'none';
    submitBtn.style.display = step === 3 ? 'block' : 'none';
    
    // Start status ticker on confirmation
    if (step === 4) {
        startStatusTicker();
    }
}

// Update progress bar
function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            stepEl.classList.add('progress-step--completed');
            stepEl.classList.remove('progress-step--active');
        } else if (stepNum === currentStep) {
            stepEl.classList.add('progress-step--active');
            stepEl.classList.remove('progress-step--completed');
        } else {
            stepEl.classList.remove('progress-step--active', 'progress-step--completed');
        }
    });
}

// Update the showReviewSummary function to properly display the saved data:
function showReviewSummary() {
    const summaryDiv = document.getElementById('trip-summary');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    // Ensure we have the latest data
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
        bookingData = JSON.parse(savedData);
    }
    
    // Format service type for display
    const serviceTypeDisplay = bookingData.serviceTypeText || 
        (bookingData.serviceType ? bookingData.serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A');
    
    summaryDiv.innerHTML = `
        <p><strong>Service:</strong> <span>${serviceTypeDisplay}</span></p>
        <p><strong>Pickup:</strong> <span>${bookingData.pickup || 'N/A'}</span></p>
        <p><strong>Drop-off:</strong> <span>${bookingData.dropoff || 'N/A'}</span></p>
        <p><strong>Date:</strong> <span>${bookingData.date || 'N/A'}</span></p>
        <p><strong>Time:</strong> <span>${bookingData.time || 'N/A'}</span></p>
        <p><strong>Vehicle:</strong> <span>${bookingData.vehicleName || 'N/A'}</span></p>
        <p><strong>Passengers:</strong> <span>${bookingData.passengers || 'N/A'} passenger(s)</span></p>
        <p><strong>Luggage:</strong> <span>${bookingData.luggage || '0'} bag(s)</span></p>
    `;
    
    const subtotal = parseFloat(bookingData.vehiclePrice) || 0;
    subtotalEl.textContent = `$${subtotal}`;
    totalEl.textContent = `$${subtotal}`;
    
    bookingData.subtotal = subtotal;
    bookingData.total = subtotal;
}

// Handle promo code
function handlePromoCode() {
    const promoInput = document.getElementById('promo-code');
    const promoMessage = document.getElementById('promo-message');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    
    const code = promoInput.value.trim().toUpperCase();
    
    // Mock promo codes
    const promoCodes = {
        'SAVE10': 0.1,
        'FIRST20': 0.2,
        'VIP15': 0.15
    };
    
    if (promoCodes[code]) {
        const discount = bookingData.subtotal * promoCodes[code];
        bookingData.discount = discount;
        bookingData.total = bookingData.subtotal - discount;
        
        discountEl.textContent = `-$${discount.toFixed(2)}`;
        totalEl.textContent = `$${bookingData.total.toFixed(2)}`;
        
        promoMessage.textContent = 'Promo code applied successfully!';
        promoMessage.className = 'promo-message promo-message--success';
        
        showToast('Promo code applied!', 'success');
    } else {
        promoMessage.textContent = 'Invalid promo code';
        promoMessage.className = 'promo-message promo-message--error';
    }
}

// Handle booking submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Validate terms acceptance
    const termsCheckbox = document.getElementById('accept-terms');
    if (!termsCheckbox.checked) {
        showToast('Please accept the terms and conditions', 'error');
        return;
    }
    
    // Save final data
    saveStepData(3);
    
    const submitBtn = document.getElementById('submit-booking');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        // Simulate API call
        await processBooking();
        
        // Generate booking number
        const bookingNumber = 'LUX-' + Date.now().toString().slice(-6);
        bookingData.bookingNumber = bookingNumber;
        
        // Show confirmation
        currentStep = 4;
        showStep(4);
        showConfirmation(bookingNumber);
        
    } catch (error) {
        showToast('Booking failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
    }
}

// Process booking (mock)
function processBooking() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 2000);
    });
}

// Show confirmation details
function showConfirmation(bookingNumber) {
    document.getElementById('booking-number').textContent = bookingNumber;
    
    const serviceTypeDisplay = bookingData.serviceType ? 
        bookingData.serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
        'N/A';
    
    const summaryDiv = document.getElementById('confirmation-summary');
    summaryDiv.innerHTML = `
        <div class="summary-details">
            <p><strong>Service:</strong> ${serviceTypeDisplay}</p>
            <p><strong>Pickup:</strong> ${bookingData.pickup}</p>
            <p><strong>Drop-off:</strong> ${bookingData.dropoff}</p>
            <p><strong>Date & Time:</strong> ${bookingData.date} at ${bookingData.time}</p>
            <p><strong>Vehicle:</strong> ${bookingData.vehicleName}</p>
            <p><strong>Total Paid:</strong> $${bookingData.total.toFixed(2)}</p>
        </div>
    `;
    
    // Clear session storage
    sessionStorage.removeItem('bookingData');
    sessionStorage.removeItem('estimatedPrice');
    sessionStorage.removeItem('serviceType');
    sessionStorage.removeItem('vehicleClass');
    
    showToast('Booking confirmed successfully!', 'success');
}

// Status ticker
function startStatusTicker() {
    const tickerContent = document.querySelector('.ticker-content');
    const statuses = [
        'Booking confirmed - Processing...',
        'Assigning your chauffeur...',
        'Chauffeur assigned - John Smith',
        'Vehicle prepared - ' + (bookingData.vehicleName || 'Premium Vehicle'),
        'Ready for your trip!'
    ];
    
    let currentStatus = 0;
    
    // Clear existing content
    tickerContent.innerHTML = '';
    
    const interval = setInterval(() => {
        if (currentStatus < statuses.length) {
            const statusEl = document.createElement('span');
            statusEl.className = 'ticker-status';
            statusEl.textContent = `${new Date().toLocaleTimeString()} - ${statuses[currentStatus]}`;
            tickerContent.appendChild(statusEl);
            
            // Scroll to bottom
            tickerContent.scrollTop = tickerContent.scrollHeight;
            
            currentStatus++;
        } else {
            clearInterval(interval);
        }
    }, 3000);
}

// Autocomplete functionality
function initializeAutocomplete() {
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');
    const pickupSuggestions = document.getElementById('pickup-suggestions');
    const dropoffSuggestions = document.getElementById('dropoff-suggestions');
    
    // Mock addresses
    const addresses = [
        '123 Main Street, Downtown',
        '456 Airport Road, Terminal 1',
        '789 Business Plaza, Suite 100',
        '321 Hotel Avenue, Grand Hotel',
        '654 Shopping Center, West Mall',
        '987 Tech Park, Innovation Drive',
        '147 Medical Center, Health Boulevard',
        '258 University Campus, College Road',
        '369 Stadium Drive, Sports Complex',
        '741 Convention Center, Expo Lane'
    ];
    
    function setupAutocomplete(input, suggestionsDiv) {
        let debounceTimer;
        
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const value = this.value.toLowerCase();
                if (value.length < 2) {
                    suggestionsDiv.classList.remove('autocomplete-suggestions--active');
                    return;
                }
                
                const matches = addresses.filter(addr => 
                    addr.toLowerCase().includes(value)
                );
                
                if (matches.length > 0) {
                    suggestionsDiv.innerHTML = matches.map(addr => 
                        `<div class="autocomplete-suggestion">${addr}</div>`
                    ).join('');
                    suggestionsDiv.classList.add('autocomplete-suggestions--active');
                } else {
                    suggestionsDiv.classList.remove('autocomplete-suggestions--active');
                }
            }, 300);
        });
        
        suggestionsDiv.addEventListener('click', function(e) {
            if (e.target.classList.contains('autocomplete-suggestion')) {
                input.value = e.target.textContent;
                suggestionsDiv.classList.remove('autocomplete-suggestions--active');
                clearFieldError(input);
            }
        });
    }
    
    if (pickupInput && pickupSuggestions) {
        setupAutocomplete(pickupInput, pickupSuggestions);
    }
    
    if (dropoffInput && dropoffSuggestions) {
        setupAutocomplete(dropoffInput, dropoffSuggestions);
    }
}

// Date/time picker initialization
function initializeDateTimePickers() {
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    
    if (dateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today; // Set default to today
    }
    
    if (timeInput) {
        // Set default time to next hour
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0);
        const timeString = nextHour.toTimeString().slice(0, 5);
        timeInput.value = timeString;
    }
}

// Field error helpers
function showFieldError(field, message) {
    field.classList.add('error');
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
}

// Clear error on input
document.addEventListener('input', function(e) {
    if (e.target.matches('.booking-form input, .booking-form select')) {
        clearFieldError(e.target);
    }
});

// Hide autocomplete on click outside
document.addEventListener('click', function(e) {
    if (!e.target.matches('#pickup, #dropoff') && !e.target.closest('.autocomplete-suggestions')) {
        const suggestions = document.querySelectorAll('.autocomplete-suggestions--active');
        suggestions.forEach(s => s.classList.remove('autocomplete-suggestions--active'));
    }
});

// Add additional CSS for vehicle cards
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .vehicle-card__description {
        font-size: 0.875rem;
        color: var(--text-light);
        margin-top: var(--spacing-sm);
    }
    
    .autocomplete-suggestions {
        box-shadow: var(--shadow-md);
    }
    
    .ticker-content {
        max-height: 150px;
        overflow-y: auto;
        padding: var(--spacing-sm);
    }
    
    .ticker-status {
        display: block;
        padding: var(--spacing-xs) 0;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.875rem;
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(additionalStyles);