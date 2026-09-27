/**
 * Concept Page - Enhanced Navigation
 * Handles smooth scrolling to showreel video and auto-play
 */

document.addEventListener('DOMContentLoaded', () => {
  // Handle Showreel link in menu to scroll to video
  const showreelLinks = document.querySelectorAll('a[href="concept.html"]');

  showreelLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Only handle if we're already on the concept page
      if (window.location.pathname.includes('concept.html') ||
          window.location.pathname.endsWith('/concept')) {
        e.preventDefault();

        const showreelSection = document.getElementById('Showreel');
        if (showreelSection) {
          // Close menu if open
          const menuWrapper = document.querySelector('.nav-menu-wrapper');
          if (menuWrapper && menuWrapper.dataset.menuOpen === 'true') {
            const closer = menuWrapper.querySelector('.menu-icon-wrap.long');
            if (closer) closer.click();
          }

          // Scroll to showreel and open lightbox
          setTimeout(() => {
            showreelSection.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });

            // Click the lightbox to open the video
            setTimeout(() => {
              const lightboxLink = document.querySelector('.light-box a.w-lightbox');
              if (lightboxLink) {
                lightboxLink.click();
              }
            }, 600);
          }, 100);
        }
      }
    });
  });

  // Handle hash navigation on page load
  if (window.location.hash === '#showreel' || window.location.hash === '#Showreel') {
    setTimeout(() => {
      const showreelSection = document.getElementById('Showreel');
      if (showreelSection) {
        showreelSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Click the lightbox to open the video
        setTimeout(() => {
          const lightboxLink = document.querySelector('.light-box a.w-lightbox');
          if (lightboxLink) {
            lightboxLink.click();
          }
        }, 800);
      }
    }, 500);
  }
});
