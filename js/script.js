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
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => handleFormSubmit(e, 'sendBtn', null, true));
    }

    const modalSendBtn = document.getElementById('modalSendBtn');
    if (modalSendBtn) {
        modalSendBtn.addEventListener('click', (e) => handleFormSubmit(e, 'modalSendBtn', null, false));
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

// Shared submit logic for modal and offcanvas
function handleFormSubmit(e, btnId, formId, isOffcanvas = false) {
    e.preventDefault();
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const originalText = btn.innerHTML;

    let name, phone, email, message, type;

    if (isOffcanvas) {
        name = document.getElementById('tele-name').value.trim();
        phone = document.getElementById('tele-phone').value.trim();
        email = document.getElementById('tele-email').value.trim();
        message = document.getElementById('message').value.trim();
        const typeInput = document.querySelector('input[name="inquiry_type"]:checked');
        type = typeInput ? typeInput.value : 'General Inquiry';
    } else {
        name = document.getElementById('modal-name').value.trim();
        phone = document.getElementById('modal-phone').value.trim();
        email = document.getElementById('modal-email').value.trim();
        message = document.getElementById('modal-message').value.trim();
        const typeInput = document.querySelector('#enquiryModal input[name="inquiry_type"]:checked');
        type = typeInput ? typeInput.value : 'Franchise Inquiry';
    }

    if (!name || !phone || !email || !message) {
        alert('Please fill all required fields.');
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
                alert('Thank you! Your message has been sent successfully.');
                if (isOffcanvas) {
                    ['tele-name', 'tele-phone', 'tele-email', 'message'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });
                    const offcanvasEl = document.getElementById('contactOffcanvas');
                    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                    if (offcanvas) offcanvas.hide();
                } else {
                    ['modal-name', 'modal-phone', 'modal-email', 'modal-message'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });
                    const modalEl = document.getElementById('enquiryModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong. Please try again later.');
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
        alert('Please fill all fields.');
        return;
    }

    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('message', message);

    fetch('mail.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Thank you! Your message has been sent successfully.');
                contactForm.reset();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong. Please check your internet connection or try again later.');
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
