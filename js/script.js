
// Sticky Navbar Shadow Effect
const navBar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navBar.classList.add("shadow-md");
  } else {
    navBar.classList.remove("shadow-md");
  }
});

// Close offcanvas on link click (Mobile UX)
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
  const offcanvas = document.getElementById('offcanvasNavbar');
  if (offcanvas) {
    const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
    navLinks.forEach(function (l) {
      l.addEventListener('click', function () {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
        if (offcanvasInstance) offcanvasInstance.hide();
      });
    });
  }
});


// coumter
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");
  let started = false; // run only once

  const animateCount = (counter) => {
    const target = +counter.getAttribute("data-target");
    const duration = 2000; // 2 sec
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

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        counters.forEach(counter => animateCount(counter));
        started = true;
        obs.disconnect(); // stop observing
      }
    });
  }, { threshold: 0.5 });

  observer.observe(document.querySelector("#info-new-sec"));
});


// Header dropdown button functionality removed in favor of pure CSS hover for better stability

// keywords
function toggleKeywords() {
  const wrapper = document.getElementById('keywordsWrapper');
  const btn = document.querySelector('.see-more-btn');
  wrapper.classList.toggle('expanded');
  btn.textContent = wrapper.classList.contains('expanded') ? 'See Less' : 'See More';
}





// copy right years
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById("year");
  el && (el.textContent = new Date().getFullYear());
});



// ==========================================
// Form Submission Handler (Consolidated)
// ==========================================
function handleFormSubmit(e, btnId, formId, isOffcanvas = false) {
  e.preventDefault();
  const btn = document.getElementById(btnId);
  const originalText = btn.innerHTML;

  // Get Form Data based on context
  let name, phone, email, message, type;

  if (isOffcanvas) {
    name = document.getElementById('tele-name').value.trim();
    phone = document.getElementById('tele-phone').value.trim();
    email = document.getElementById('tele-email').value.trim();
    message = document.getElementById('message').value.trim();
    const typeInput = document.querySelector('input[name="inquiry_type"]:checked');
    type = typeInput ? typeInput.value : 'General Inquiry';
  } else {
    // Modal context
    name = document.getElementById('modal-name').value.trim();
    phone = document.getElementById('modal-phone').value.trim();
    email = document.getElementById('modal-email').value.trim();
    message = document.getElementById('modal-message').value.trim();
    const typeInput = document.querySelector('#enquiryModal input[name="inquiry_type"]:checked');
    type = typeInput ? typeInput.value : 'Franchise Inquiry';
  }

  // Basic Validation
  if (!name || !phone || !email || !message) {
    alert('Please fill all required fields.');
    return;
  }

  // Loading State
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
        // Reset Inputs
        if (isOffcanvas) {
          document.getElementById('tele-name').value = '';
          document.getElementById('tele-phone').value = '';
          document.getElementById('tele-email').value = '';
          document.getElementById('message').value = '';
          const offcanvasEl = document.getElementById('contactOffcanvas');
          const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (offcanvas) offcanvas.hide();
        } else {
          document.getElementById('modal-name').value = '';
          document.getElementById('modal-phone').value = '';
          document.getElementById('modal-email').value = '';
          document.getElementById('modal-message').value = '';
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

// Attach listeners
document.addEventListener('DOMContentLoaded', function () {
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => handleFormSubmit(e, 'sendBtn', null, true));
  }

  const modalSendBtn = document.getElementById('modalSendBtn');
  if (modalSendBtn) {
    modalSendBtn.addEventListener('click', (e) => handleFormSubmit(e, 'modalSendBtn', null, false));
  }
});

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

// Back to Top functionality
document.addEventListener('DOMContentLoaded', () => {
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
});
// ==========================================
// Main Contact Page Form Logic (Redesigned Form)
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      // Get Values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !phone || !message) {
        alert('Please fill all fields.');
        return;
      }

      // Loading State
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
    });
  }
});
