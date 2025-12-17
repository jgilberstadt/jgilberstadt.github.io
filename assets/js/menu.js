document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;
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

  // Get all focusable elements inside menu
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

  function closeMenu() {
    menu.classList.remove('visible');
    button.setAttribute('aria-expanded', 'false');
    list.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';

    if (removeFocusTrap) removeFocusTrap();

    list.addEventListener("transitionend", function handler() {
      menu.classList.remove("open");
      list.removeEventListener("transitionend", handler);
    });

    button.blur(); // removes "lit up" focus effect
  }

  // Toggle menu on button click
  button.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close menu via close button
  closeBtn.addEventListener("click", e => {
    e.stopPropagation();
    closeMenu();
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu();
  });

  // Close menu on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close menu on link click and prevent lingering highlight
  list.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      const isInternal = href && !href.startsWith('http') && !href.startsWith('#');

      if (isInternal) {
        closeMenu();
        button.blur(); // remove focus from menu button
      }
    });
  });

  highlightCurrentPage(menu);
}

// Highlight current page link
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
