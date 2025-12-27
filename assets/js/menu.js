document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.scrollPaddingTop = 
  document.querySelector(".site-header").offsetHeight + "px";
  
  // Inject Header
  fetch("./partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;
      setupMenu();
      setupHeaderScroll();
      setupThemeToggle();
      // Re-trigger just in case header fetch was slow
      triggerPageFadeIn();
    })
    .catch(err => console.error("Failed to load header:", err));

  // Inject Footer
  fetch("./partials/footer.html")
    .then(response => response.text())
    .then(html => {
      const footerContainer = document.getElementById("site-footer");
      if (footerContainer) {
        footerContainer.innerHTML = html;
      }
    })
    .catch(err => console.error("Failed to load footer:", err));

  // Fade-in animation trigger
  triggerPageFadeIn();
});

// =========================
// Menu Toggle + Focus Trap
// =========================
function setupMenu() {
  const toggleButton = document.querySelector(".menu-toggle");
  const menuList = document.querySelector(".menu-list");
  const closeButton = document.querySelector(".menu-close");

  if (!toggleButton || !menuList) return;

  let removeFocusTrap = null;

  function getFocusableElements() {
    // This finds the X button AND all the links
    return Array.from(document.querySelectorAll('.menu-close, .menu-list a[href]'));
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

    // Listen on the document so it catches the "X" button too
    document.addEventListener("keydown", handleTab);
    
    // Start focus on the Close Button (best practice for mobile menus)
    setTimeout(() => {
    if (closeButton) closeButton.focus({ preventScroll: true });
  }, 400);

    return () => document.removeEventListener("keydown", handleTab);
  }

  function openMenu() {
  if (window.innerWidth >= 769) return;
  
  // Lock scroll immediately
  document.body.classList.add("menu-open");
  toggleButton.setAttribute("aria-expanded", "true");
  
  // Delay the focus trap slightly longer than the CSS transition
  // to ensure the menu is visually "there" before the browser jumps to the X
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

    // Safety: Always show header at the very top of the page
  if (currentScrollY < 10) {
    header.classList.remove("header-hidden");
    header.classList.add("header-visible");
    return;
  }

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
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  if (!toggle) return;

  // Sync state immediately - no delay
  const isLight = document.documentElement.classList.contains("light-mode");
  document.body.classList.toggle("light-mode", isLight);
  
  const syncMetaTag = () => {
    const activeLight = document.body.classList.contains("light-mode");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", activeLight ? "#ffffff" : "#000000");
    }
  };

  syncMetaTag();

  toggle.addEventListener("click", () => {
    // Apply to both to ensure CSS selectors always find it
    document.body.classList.toggle("light-mode");
    document.documentElement.classList.toggle("light-mode");
    
    const isNowLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isNowLight ? "light" : "dark");
    syncMetaTag();
    toggle.blur();
  });
}

document.addEventListener('click', (e) => {
  const isInteractive = e.target.closest('a, button, .project-item');
  
  if (isInteractive && document.activeElement instanceof HTMLElement) {
    requestAnimationFrame(() => {
      document.activeElement.blur();
    });
  }
});

function triggerPageFadeIn() {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    // Adding a small delay ensures the transition is visible
    requestAnimationFrame(() => {
      setTimeout(() => {
        mainContent.classList.add("active");
      }, 200); 
    });
  }
}

if (document.readyState === "interactive" || document.readyState === "complete") {
  triggerPageFadeIn();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker registered!"))
      .catch((err) => console.log("Service Worker failed:", err));
  });
}
