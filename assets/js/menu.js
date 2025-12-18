document.addEventListener("DOMContentLoaded", () => {
  // 1️⃣ Inject header
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      const siteHeaderContainer = document.getElementById("site-header");
      siteHeaderContainer.innerHTML = html;

      // 2️⃣ Setup menu toggle and focus trap
      setupMenu();

      // 3️⃣ Setup sticky header scroll behavior
      setupHeaderScroll();
    })
    .catch(err => console.error("Failed to load header:", err));
});

// =========================
// Menu Toggle + Focus Trap
// =========================
function setupMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const toggleButton = menu.querySelector('button[aria-label="Toggle menu"]');
  const menuList = menu.querySelector('.menu-list');
  if (!toggleButton || !menuList) return;

  let removeFocusTrap;

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

  function openMenu() {
    if (window.innerWidth >= 769) return; // desktop: ignore
    menu.classList.add('open');
    toggleButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    removeFocusTrap = trapFocus();
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggleButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (removeFocusTrap) removeFocusTrap();
    toggleButton.focus();
  }

  toggleButton.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  menu.addEventListener('click', e => {
    if (e.target.closest('.menu-close')) closeMenu();
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && menu.classList.contains('open')) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
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

// =========================
// Highlight Current Page
// =========================
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

// =========================
// Sticky Header Scroll
// =========================
function setupHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const currentScrollY = window.scrollY;

    if (window.innerWidth < 769) {
      // Mobile: always show
      header.classList.remove('header-hidden');
      header.classList.add('header-visible');
    } else {
      // Desktop: show/hide on scroll
      if (currentScrollY < 50 || currentScrollY < lastScrollY) {
        // Top of page or scrolling up → show
        header.classList.remove('header-hidden');
        header.classList.add('header-visible');
      } else {
        // Scrolling down → hide
        header.classList.add('header-hidden');
        header.classList.remove('header-visible');
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });

  window.addEventListener('resize', updateHeader);
  updateHeader(); // initial check
}
