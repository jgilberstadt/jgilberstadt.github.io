document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      const headerContainer = document.getElementById("site-header");
      headerContainer.innerHTML = html;
      setupMenu();
    })
    .catch(err => console.error("Failed to load header:", err));
});

function setupMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const button = menu.querySelector('button');
  const list = menu.querySelector('.menu-list');
  const closeBtn = menu.querySelector(".menu-close");

  // Focus trap for accessibility
  function getFocusableElements() {
    return list.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function trapFocus() {
    const focusable = getFocusableElements();
    if (!focusable.length) return;
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    list.addEventListener('keydown', handleTab);
    firstEl.focus();
    return () => list.removeEventListener('keydown', handleTab);
  }

  let removeFocusTrap;

  function openMenu() {
    menu.classList.add('open');
    requestAnimationFrame(() => menu.classList.add('visible'));

    button.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    removeFocusTrap = trapFocus();
  }

  function closeMenu(focusButton = true) {
    menu.classList.remove('visible');
    button.setAttribute('aria-expanded', 'false');
    list.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';

    if (removeFocusTrap) removeFocusTrap();

    list.addEventListener("transitionend", function handler() {
      menu.classList.remove("open");
      list.removeEventListener("transitionend", handler);
    });

    if (focusButton) button.focus();
  }

  // Toggle menu button
  button.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu(true) : openMenu();
  });

  // Close button inside overlay
  closeBtn.addEventListener("click", e => {
    e.stopPropagation();
    closeMenu(true);
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu(true);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu(true);
    }
  });

  // Close menu on clicking any link, but do NOT focus button
  list.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  highlightCurrentPage(menu);
}

// Highlight the current page link
function highlightCurrentPage(menu) {
  const current = window.location.pathname.split("/").pop() || "index.html";
  menu.querySelectorAll(".menu-list a").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("current");
      link.setAttribute("aria-current", "page");
      link.setAttribute("tabindex", "-1");
    }
  });
}
