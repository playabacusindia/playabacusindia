// ==========================================
// Main Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Sticky Navbar Shadow Effect
    const navBar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navBar.classList.add("shadow-md");
        } else {
            navBar.classList.remove("shadow-md");
        }
    });

    // 2. Close offcanvas on link click (Mobile UX)
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
    const offcanvas = document.getElementById('offcanvasNavbar');
    if (offcanvas) {
        navLinks.forEach(function (l) {
            l.addEventListener('click', function () {
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
                if (offcanvasInstance) offcanvasInstance.hide();
            });
        });
    }

    // 3. Counter Animation
    const counters = document.querySelectorAll(".counter");
    let started = false;

    const animateCount = (counter) => {
        const target = +counter.getAttribute("data-target");
        const duration = 2000;
        const step = target / (duration / 20);

        let count = 0;
        const update = setInterval(() => {
            count += step;
            if (count >= target) {
                counter.textContent = target.toLocaleString() + "+";
                clearInterval(update);
            } else {
                counter.textContent = Math.floor(count).toLocaleString();
            }
        }, 20);
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                counters.forEach(counter => animateCount(counter));
                started = true;
                obs.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const infoSec = document.querySelector("#info-new-sec");
    if (infoSec) counterObserver.observe(infoSec);

    // 4. Copyright Year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 5. Back to Top Logic
    const backToTopButton = document.getElementById("backToTop");
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add("show");
            } else {
                backToTopButton.classList.remove("show");
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 6. Form Submission Listeners
    const modalSendBtn = document.getElementById('modalSendBtn');
    if (modalSendBtn) {
        modalSendBtn.addEventListener('click', (e) => handleFormSubmit(e, 'modalSendBtn', null));
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleMainContactSubmit);
    }
});

// Keywords toggle
function toggleKeywords() {
    const wrapper = document.getElementById('keywordsWrapper');
    const btn = document.querySelector('.see-more-btn');
    if (wrapper && btn) {
        wrapper.classList.toggle('expanded');
        btn.textContent = wrapper.classList.contains('expanded') ? 'See Less' : 'See More';
    }
}

// ==========================================
// Form Submission Handlers
// ==========================================

// ==========================================
// Toast Notifications Logic
// ==========================================

function showToast(title, message, type = 'success') {
    // Check if toast container exists, if not create it
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 start-50 translate-middle-x p-3';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';

    const toastHTML = `
        <div id="${toastId}" class="toast premium-toast fade ${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header border-0 pb-0">
                <div class="toast-icon-wrapper-sm me-2">
                    <i class="bi ${icon}"></i>
                </div>
                <strong class="me-auto toast-title">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body pt-1 pb-3">
                ${message}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
    toast.show();

    // Clean up DOM after toast is hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Shared submit logic for modal and offcanvas
function handleFormSubmit(e, btnId, formId) {
    e.preventDefault();
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const originalText = btn.innerHTML;

    let name, phone, email, message, type;

    // Use modal IDs exclusively for unified experience
    name = document.getElementById('modal-name')?.value.trim();
    phone = document.getElementById('modal-phone')?.value.trim();
    email = document.getElementById('modal-email')?.value.trim();
    message = document.getElementById('modal-message')?.value.trim();
    const typeInput = document.querySelector('#enquiryModal input[name="inquiry_type"]:checked');
    type = typeInput ? typeInput.value : 'General Inquiry';

    if (!name || !phone || !email || !message) {
        showToast('Required Fields', 'Please fill all required fields before sending.', 'error');
        return;
    }

    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('message', message);
    formData.append('type', type);

    fetch('mail.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast('Success!', 'Your enquiry has been sent. We will contact you shortly.', 'success');
                ['modal-name', 'modal-phone', 'modal-email', 'modal-message'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                const modalEl = document.getElementById('enquiryModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            } else {
                showToast('Failed to Send', data.message || 'There was an error sending your message.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('System Error', 'Something went wrong. Please check your connection and try again.', 'error');
        })
        .finally(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}

// Main Contact Page Form handler
function handleMainContactSubmit(e) {
    e.preventDefault();
    const contactForm = e.target;
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !phone || !message) {
        showToast('Missing Fields', 'Please complete all fields in the contact form.', 'error');
        return;
    }

    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('message', message);
    formData.append('type', 'Contact Inquiry');

    fetch('mail.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast('Message Sent', 'Thank you for reaching out! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showToast('Error', data.message || 'Could not send your message at this time.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Connection Error', 'Please check your internet connection or try again later.', 'error');
        })
        .finally(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}

// Character Limiter Helper
window.limitLetters = function (textarea, max) {
    if (textarea.value.length > max) {
        textarea.value = textarea.value.substring(0, max);
    }
    const counter = document.getElementById('wordCountMsg');
    if (counter) {
        counter.textContent = `${textarea.value.length} / ${max}`;
    }
};
