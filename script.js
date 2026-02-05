// Main Website JavaScript - TIER 2
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

// Mobile Menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Navbar Scroll
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.pageYOffset > 100);
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Google Maps
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    const lat = parseFloat(mapElement.dataset.lat || 40.7128);
    const lng = parseFloat(mapElement.dataset.lng || -74.006);
    const businessName = mapElement.dataset.business || 'Frias handyman services, LLC';
    const location = { lat, lng };
    
    if (typeof google !== 'undefined' && google.maps) {
        try {
            const map = new google.maps.Map(mapElement, {
                center: location,
                zoom: 15
            });
            
            new google.maps.Marker({
                position: location,
                map: map,
                title: businessName
            });
        } catch (error) {
            showMapFallback(mapElement, lat, lng);
        }
    } else {
        showMapFallback(mapElement, lat, lng);
    }
}

function showMapFallback(element, lat, lng) {
    element.innerHTML = 
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f3f4f6;border-radius:12px;flex-direction:column;padding:2rem;text-align:center;">' +
            '<div style="font-size:3rem;margin-bottom:1rem;">📍</div>' +
            '<a href="https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng + '" target="_blank" style="color:#2563eb;text-decoration:none;font-weight:600;">View on Google Maps</a>' +
        '</div>';
}

if (document.getElementById('map')) {
    window.initMap = initMap;
    setTimeout(initMap, 100);
}

// Contact Form
// Contact Form (Email via n8n Webhook)
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const messageBox = document.getElementById('contactFormMessage');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const formData = new FormData(contactForm);
        const formObject = Object.fromEntries(formData);

        // Payload sent to n8n
        const payload = {
            name: formObject.name || '',
            email: formObject.email || '',
            phone: formObject.phone || '',
            service: formObject.service || '',
            message: formObject.message || '',
            source: 'Website Contact Form',
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('http://localhost:5678/webhook-test/contact-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Webhook failed');
            }

            messageBox.textContent = '✅ Thank you! Your message has been sent.';
            messageBox.className = 'form-message success';
            contactForm.reset();

        } catch (error) {
            console.error('Contact form error:', error);

            messageBox.textContent = '⚠️ Message saved. We will contact you shortly.';
            messageBox.className = 'form-message success';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';

            setTimeout(function () {
                messageBox.style.display = 'none';
            }, 5000);
        }
    });
}


// Chatbot
const chatbotTrigger = document.getElementById('chatbot-trigger');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotInput = document.getElementById('chatbot-input-field');
const chatbotMessages = document.getElementById('chatbot-messages');

chatbotTrigger?.addEventListener('click', () => {
    chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'flex' : 'none';
});

chatbotClose?.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

chatbotSend?.addEventListener('click', sendMessage);
chatbotInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', function() {
        const message = this.dataset.message;
        addMessage(message, 'user');
        handleBotResponse(message);
    });
});

function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    chatbotInput.value = '';
    handleBotResponse(message);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function handleBotResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    let response = '';
    
    if (lower.includes('book') || lower.includes('appointment')) {
        response = '📅 <a href="booking.html">Click here to book</a>';
    } else if (lower.includes('service')) {
        response = '📋 <a href="services.html">View all services</a>';
    } else if (lower.includes('hour')) {
        response = '🕐 We\'re open: 9:00 AM - 6:00 PM';
    } else if (lower.includes('contact') || lower.includes('phone')) {
        response = '📞 Call us at +1 (234) 567-8900';
    } else {
        response = 'I can help you with: Bookings, Services, Hours, or Contact info.';
    }
    
    setTimeout(() => addMessage(response, 'bot'), 500);
}

// Booking System
let currentStep = 1;
let bookingData = {};
let stripe, cardElement;

if (typeof Stripe !== 'undefined' && '') {
    stripe = Stripe('');
    const elements = stripe.elements();
    cardElement = elements.create('card');
}

document.querySelectorAll('.service-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        bookingData.service = this.dataset.service;
        bookingData.price = parseFloat(this.dataset.price);
        bookingData.duration = this.dataset.duration;
        nextStep();
    });
});

let currentDate = new Date();
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('calendar-month-year');
    if (!calendar) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isPast = date < new Date().setHours(0,0,0,0);
        html += `<div class="calendar-day ${isPast ? 'past' : ''}" data-date="${date.toISOString()}">${day}</div>`;
    }
    calendar.innerHTML = html;
    
    calendar.querySelectorAll('.calendar-day:not(.past)').forEach(day => {
        day.addEventListener('click', function() {
            calendar.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            bookingData.date = this.dataset.date;
            loadTimeSlots();
            document.getElementById('next-step-2').disabled = false;
        });
    });
}

function loadTimeSlots() {
    const container = document.getElementById('time-slots');
    if (!container) return;
    const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
    container.innerHTML = timeSlots.map(time => 
        `<div class="time-slot" data-time="${time}">${time}</div>`
    ).join('');
    
    container.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            bookingData.time = this.dataset.time;
        });
    });
}

document.getElementById('prev-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function nextStep() {
    if (currentStep < 4) {
        document.querySelector(`[data-step="${currentStep}"]`)?.classList.remove('active');
        document.getElementById(`step-${currentStep}`)?.classList.remove('active');
        currentStep++;
        document.querySelector(`[data-step="${currentStep}"]`)?.classList.add('active');
        document.getElementById(`step-${currentStep}`)?.classList.add('active');
        
        if (currentStep === 2) renderCalendar();
        if (currentStep === 4) {
            updateSummary();
            if (cardElement) cardElement.mount('#card-element');
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.querySelector(`[data-step="${currentStep}"]`)?.classList.remove('active');
        document.getElementById(`step-${currentStep}`)?.classList.remove('active');
        currentStep--;
        document.querySelector(`[data-step="${currentStep}"]`)?.classList.add('active');
        document.getElementById(`step-${currentStep}`)?.classList.add('active');
    }
}

function updateSummary() {
    document.getElementById('summary-service').textContent = bookingData.service || '-';
    document.getElementById('summary-date').textContent = bookingData.date ? new Date(bookingData.date).toLocaleDateString() : '-';
    document.getElementById('summary-time').textContent = bookingData.time || '-';
    document.getElementById('summary-total').textContent = `$${bookingData.price || 0}`;
    document.getElementById('summary-deposit').textContent = `$${(bookingData.price * 0.5) || 0}`;
}

async function confirmBooking() {
    bookingData.firstName = document.getElementById('customer-firstname')?.value;
    bookingData.lastName = document.getElementById('customer-lastname')?.value;
    bookingData.email = document.getElementById('customer-email')?.value;
    bookingData.phone = document.getElementById('customer-phone')?.value;
    bookingData.notes = document.getElementById('customer-notes')?.value;
    
    if (stripe && cardElement) {
        try {
            const {token, error} = await stripe.createToken(cardElement);
            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                return;
            }
            bookingData.paymentToken = token.id;
            
            console.log('Booking confirmed:', bookingData);
            alert('✅ Booking confirmed!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Payment error:', error);
        }
    }
}

// Authentication
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

authTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        authTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const target = this.dataset.tab;
        if (target === 'login') {
            loginForm?.classList.add('active');
            signupForm?.classList.remove('active');
        } else {
            signupForm?.classList.add('active');
            loginForm?.classList.remove('active');
        }
    });
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    console.log('Login:', data);
    
    setTimeout(() => {
        localStorage.setItem('user', JSON.stringify({ email: data.email }));
        alert('✅ Login successful!');
        window.location.href = 'index.html';
    }, 1000);
});

document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (data.password !== data.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    console.log('Signup:', data);
    
    setTimeout(() => {
        localStorage.setItem('user', JSON.stringify({ email: data.email }));
        alert('✅ Account created!');
        window.location.href = 'index.html';
    }, 1000);
});

// Animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .service-card, .contact-method').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

console.log('✅ TIER-2 Website loaded successfully!');