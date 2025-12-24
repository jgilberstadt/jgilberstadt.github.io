if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
}

document.addEventListener("DOMContentLoaded", () => {
  // Inject Header
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;
      setupMenu();
      setupHeaderScroll();
      setupThemeToggle();
    })
    .catch(err => console.error("Failed to load header:", err));

  // Inject Footer
  fetch("partials/footer.html")
    .then(response => response.text())
    .then(html => {
      const footerContainer = document.getElementById("site-footer");
      if (footerContainer) {
        footerContainer.innerHTML = html;
      }
    })
    .catch(err => console.error("Failed to load footer:", err));
});

// =========================
// Menu Toggle + Focus Trap
// =========================
function setupMenu() {
  const navContainer = document.querySelector("nav.menu");
  const toggleButton = document.querySelector(".menu-toggle");
  const menuList = document.querySelector(".menu-list");
  const closeButton = document.querySelector(".menu-close"); // Add this

  if (!navContainer || !toggleButton || !menuList) return;

  let removeFocusTrap = null;

  function getFocusableElements() {
  // Use the entire header or a shared container to find both the list links AND the close button
  return document.querySelectorAll(
    '.menu-list a[href], .menu-close, .menu-list button:not([disabled])'
  );
}

  function trapFocus() {
    const focusable = getFocusableElements();
    if (!focusable.length) return () => {};

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    function handleTab(e) {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    menuList.addEventListener("keydown", handleTab);
    firstEl.focus();

    return () => menuList.removeEventListener("keydown", handleTab);
  }

  function openMenu() {
  if (window.innerWidth >= 769) return;
  
  // 1. Prevent vertical jumping by locking the scroll without shifting position
  document.body.classList.add("menu-open");
  
  toggleButton.setAttribute("aria-expanded", "true");
  removeFocusTrap = trapFocus();
}

function closeMenu() {
  if (!document.body.classList.contains("menu-open")) return;

  // 1. Restore scroll and remove padding
  document.body.classList.remove("menu-open");
  
  toggleButton.setAttribute("aria-expanded", "false");

  setTimeout(() => {
    if (removeFocusTrap) removeFocusTrap();
    toggleButton.focus();
  }, 400); 
}

  toggleButton.addEventListener("click", e => {
    e.stopPropagation();
    document.body.classList.contains("menu-open")
      ? closeMenu()
      : openMenu();
  });

  document.addEventListener("click", e => {
    if (
      document.body.classList.contains("menu-open") &&
      !menuList.contains(e.target) &&
      !toggleButton.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      closeMenu();
    }
  });

  menuList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      const isInternal =
        href && !href.startsWith("http") && !href.startsWith("#");

      if (isInternal) closeMenu();
    });
  });

  highlightCurrentPage();

  document.addEventListener("click", e => {
    if (e.target.closest(".menu-close")) {
      closeMenu();
    }
  });
  
}

// =========================
// Highlight Current Page
// =========================
function highlightCurrentPage() {
  // Get the current filename, defaulting to 'index.html' if empty
  let currentPath = window.location.pathname.split("/").pop();
  if (currentPath === "" || currentPath === "/") currentPath = "index.html";

  const navLinks = document.querySelectorAll(".menu-list a");

  navLinks.forEach(link => {
    link.classList.remove("current"); // Clean start
    const href = link.getAttribute("href");
    
    // Match exact filename
    if (href === currentPath) {
      link.classList.add("current");
      link.setAttribute("aria-current", "page");
    }
  });
}

// =========================
// Sticky Header Scroll
// =========================
function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const currentScrollY = window.scrollY;

    if (window.innerWidth < 769) {
      header.classList.remove("header-hidden");
      header.classList.add("header-visible");
    } else {
      if (currentScrollY < 50 || currentScrollY < lastScrollY) {
        header.classList.remove("header-hidden");
        header.classList.add("header-visible");
      } else {
        header.classList.add("header-hidden");
        header.classList.remove("header-visible");
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });

  window.addEventListener("resize", updateHeader);
  updateHeader();
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    
    // Save preference
    let theme = "dark";
    if (document.body.classList.contains("light-mode")) {
      theme = "light";
    }
    localStorage.setItem("theme", theme);
  });
}

document.addEventListener('click', (e) => {
  const isInteractive = e.target.closest('a, button');
  
  if (isInteractive && document.activeElement instanceof HTMLElement) {
    requestAnimationFrame(() => {
      document.activeElement.blur();
    });
  }
});
