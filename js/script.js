
const navBar = document.querySelector(".navbar");
const offcanvas = document.querySelector("#offcanvasNavbar");

window.addEventListener("scroll", () => {
  const isOffcanvasOpen = offcanvas.classList.contains("show");

  if (!isOffcanvasOpen && window.scrollY > 60) {
    navBar.classList.add("move");
  } else if (!isOffcanvasOpen) {
    navBar.classList.remove("move");
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



// Attach event listener to the Send button document.getElementById("sendBtn").addEventListener("click", function () { setTimeout(function () { gtag('event', 'conversion', { 'send_to': 'AW-16751882003/E23UCJ2P8_EaEJPe9bM-', 'value': 1.0, 'currency': 'INR' }); }, 500); });

// copy right years
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById("year");
  el && (el.textContent = new Date().getFullYear());
});


