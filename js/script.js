
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


// Header dropdown button functionality

// Dropdown hover on desktop only
function setupDropdownHover() {
  const isDesktop = window.innerWidth >= 992;
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    dropdown.removeEventListener('mouseenter', dropdown._in);
    dropdown.removeEventListener('mouseleave', dropdown._out);

    if (isDesktop) {
      dropdown._in = () => {
        dropdown.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
        menu.classList.add('show');
      };
      dropdown._out = () => {
        dropdown.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('show');
      };
      dropdown.addEventListener('mouseenter', dropdown._in);
      dropdown.addEventListener('mouseleave', dropdown._out);
    }
  });
}

window.addEventListener('load', setupDropdownHover);
window.addEventListener('resize', setupDropdownHover);

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
// Contact Form Logic (Offcanvas)
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  const sendBtn = document.getElementById('sendBtn');

  if (sendBtn) {
    sendBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Get Values
      const name = document.getElementById('tele-name').value.trim();
      const phone = document.getElementById('tele-phone').value.trim();
      const email = document.getElementById('tele-email').value.trim();
      const message = document.getElementById('message').value.trim();
      const captcha = document.getElementById('captcha').value.trim();
      const typeInput = document.querySelector('input[name="inquiry_type"]:checked');
      const type = typeInput ? typeInput.value : 'Inquiry';

      // Basic Validation
      if (!name || !phone || !email || !message) {
        alert('Please fill all required fields.');
        return;
      }

      // Static Captcha Validation (Simulated for UX)
      // In production, sync this with a backend generator or use ReCaptcha
      if (captcha.toUpperCase() !== 'XD5F') {
        alert('Invalid Captcha. Please enter "XD5F".');
        return;
      }

      sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
      sendBtn.disabled = true;

      // Construct Message Payload for Legacy Backend
      const fullMessage = `New Web Inquiry:\n\nType: ${type}\nName: ${name}\nPhone: +91 ${phone}\nEmail: ${email}\n\nMessage:\n${message}`;

      const payload = new URLSearchParams();
      payload.append('message', fullMessage);
      payload.append('photo_url', 'https://placehold.co/100x100/png'); // Legacy placeholder requirement

      // Submit
      fetch('https://www.playabacusindia.com/form/tele-abacus/tele-chatbox.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload
      })
        .then(response => {
          if (response.ok) {
            alert('Thank you! Your message has been sent successfully.');
            // Reset Form
            document.getElementById('tele-name').value = '';
            document.getElementById('tele-phone').value = '';
            document.getElementById('tele-email').value = '';
            document.getElementById('message').value = '';
            document.getElementById('captcha').value = '';

            // Close Offcanvas
            const offcanvasEl = document.getElementById('contactOffcanvas');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) offcanvas.hide();
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Something went wrong. Please try again later.');
        })
        .finally(() => {
          sendBtn.innerHTML = 'Send Message';
          sendBtn.disabled = false;
        });
    });
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
