// Immediately reserve header space
const headerEl = document.getElementById("site-header");
headerEl.innerHTML = "<div class='header-placeholder'></div>"; // placeholder to prevent layout shift

document.addEventListener("DOMContentLoaded", () => {
  const cachedHeader = localStorage.getItem("site-header");
  const cachedHash = localStorage.getItem("site-header-hash");

  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      const hash = hashString(html);

      // Use cached HTML immediately if hash matches
      if (cachedHeader && cachedHash === hash) {
        headerEl.innerHTML = cachedHeader;
      } else {
        headerEl.innerHTML = html; // populate new header
        localStorage.setItem("site-header", html);
        localStorage.setItem("site-header-hash", hash);
      }

      setupMenu(); // initialize menu functionality
    })
    .catch(err => console.error("Failed to load header:", err));
});

// Simple hash function
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
}

function setupMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const button = menu.querySelector('button');
  const list = menu.querySelector('.menu-list');
  const closeBtn = menu.querySelector(".menu-close");

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

    button.blur();
    button.classList.add("blur-fix");
    setTimeout(() => button.classList.remove("blur-fix"), 50);
  }

  button.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  closeBtn.addEventListener("click", e => {
    e.stopPropagation();
    closeMenu();
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  list.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      const isInternal = href && !href.startsWith('http') && !href.startsWith('#');

      if (isInternal) closeMenu();
    });
  });

  highlightCurrentPage(menu);
}

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
