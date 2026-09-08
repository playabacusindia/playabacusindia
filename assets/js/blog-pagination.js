/**
 * Blog Dynamic Pagination
 * Seamlessly handles switching between Blog Page 1 and Blog Page 2
 */
document.addEventListener('DOMContentLoaded', function () {
    const totalPages = 2;
    let currentPage = 1;

    const page1 = document.getElementById('blog-page-1');
    const page2 = document.getElementById('blog-page-2');
    const pageItem1 = document.getElementById('page-item-1');
    const pageItem2 = document.getElementById('page-item-2');
    const prevItem = document.getElementById('prev-page-item');
    const nextItem = document.getElementById('next-page-item');
    const articlesSection = document.getElementById('articles-section');

    function switchPage(page, scrollToTop = true) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;

        if (currentPage === 1) {
            if (page2) {
                page2.style.display = 'none';
                page2.classList.remove('fade-in');
            }
            if (page1) {
                page1.style.display = 'flex';
                page1.classList.remove('fade-in');
                void page1.offsetWidth; // Trigger reflow
                page1.classList.add('fade-in');
            }
            if (pageItem1) pageItem1.classList.add('active');
            if (pageItem2) pageItem2.classList.remove('active');
            if (prevItem) prevItem.classList.add('disabled');
            if (nextItem) nextItem.classList.remove('disabled');
        } else if (currentPage === 2) {
            if (page1) {
                page1.style.display = 'none';
                page1.classList.remove('fade-in');
            }
            if (page2) {
                page2.style.display = 'flex';
                page2.classList.remove('fade-in');
                void page2.offsetWidth; // Trigger reflow
                page2.classList.add('fade-in');
            }
            if (pageItem1) pageItem1.classList.remove('active');
            if (pageItem2) pageItem2.classList.add('active');
            if (prevItem) prevItem.classList.remove('disabled');
            if (nextItem) nextItem.classList.add('disabled');
        }

        // Update URL hash without forcing hard scroll
        if (window.location.hash !== '#page-' + currentPage) {
            if (history.pushState) {
                history.pushState(null, null, '#page-' + currentPage);
            } else {
                location.hash = '#page-' + currentPage;
            }
        }

        // Smooth scroll to top of articles section
        if (scrollToTop && articlesSection) {
            const yOffset = -70; // Header offset
            const y = articlesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    // Event listeners for page numbers
    const pageLinks = document.querySelectorAll('#blog-pagination [data-page]');
    pageLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = parseInt(this.getAttribute('data-page'), 10);
            switchPage(targetPage, true);
        });
    });

    // Prev button listener
    const prevBtn = document.getElementById('prev-page-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                switchPage(currentPage - 1, true);
            }
        });
    }

    // Next button listener
    const nextBtn = document.getElementById('next-page-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                switchPage(currentPage + 1, true);
            }
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function () {
        const hash = window.location.hash;
        if (hash === '#page-2') {
            switchPage(2, false);
        } else {
            switchPage(1, false);
        }
    });

    // Initial page load check (?page=2 or #page-2)
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const hash = window.location.hash;

    if (hash === '#page-2' || pageParam === '2') {
        switchPage(2, false);
    } else {
        switchPage(1, false);
    }
});
