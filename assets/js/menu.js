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

  const toggleButton = menu.querySelector('button[aria-label="Toggle menu"]');
  const menuList = menu.querySelector('.menu-list');
  if (!toggleButton || !menuList) return;

  function getFocusableElements() {
    return menuList.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function trapFocus() {
    const focusable = getFocusableElements();
    if (!focusable.length) return () => {};

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    menuList.addEventListener('keydown', handleTab);
    firstEl.focus();

    return () => menuList.removeEventListener('keydown', handleTab);
  }

  let removeFocusTrap;

  function openMenu() {
    menu.classList.add('open');
    toggleButton.setAttribute('aria-expanded', 'true');
    menuList.hidden = false;
    menuList.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    removeFocusTrap = trapFocus();
    requestAnimationFrame(() => menu.classList.add('visible'));
  }

  function closeMenu() {
    menu.classList.remove('visible');
    toggleButton.setAttribute('aria-expanded', 'false');
    menuList.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (removeFocusTrap) removeFocusTrap();
    toggleButton.blur();

    menuList.addEventListener("transitionend", function handler() {
      menu.classList.remove("open");
      menuList.hidden = true;
      menuList.removeEventListener("transitionend", handler);
    });
  }

  toggleButton.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  menu.addEventListener('click', e => {
    if (e.target.closest('.menu-close')) {
      e.stopPropagation();
      closeMenu();
    }
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  menuList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
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
