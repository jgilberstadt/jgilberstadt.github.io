document.addEventListener("DOMContentLoaded", () => {
  // 1. Sync theme classes immediately and FORCE background
  const isLight = document.documentElement.classList.contains("light-mode");
  if (isLight) {
    document.body.classList.add("light-mode");
    // Explicitly set background to prevent the 'computed' default flash
    document.body.style.backgroundColor = "#ffffff"; 
  } else {
    document.body.style.backgroundColor = "#000000";
  }

  // 2. Lock EVERYTHING during injection
  document.documentElement.classList.add("no-transition");

  // Inject Header
  fetch("./partials/header.html")
    .then(response => response.text())
    .then(html => {
      const headerContainer = document.getElementById("site-header");
      headerContainer.classList.add("no-transition");
      headerContainer.innerHTML = html;

      setupMenu();
      setupHeaderScroll();
      setupThemeToggle();
      highlightCurrentPage();

      void headerContainer.offsetWidth; // Force reflow

      // 3. NOW it is safe to unlock and enable future transitions
      requestAnimationFrame(() => {
        setTimeout(() => {
          headerContainer.classList.remove("no-transition");
          document.documentElement.classList.remove("no-transition");
          
          // Clear the inline style so CSS variables take over permanently
          document.body.style.backgroundColor = "";
          document.documentElement.classList.add("transitions-enabled");
          document.body.classList.add("transitions-enabled"); 
        }, 150);
      });
    })
    .catch(err => {
      console.error("Failed to load header:", err);
      document.documentElement.classList.remove("no-transition");
    });

  // Inject Footer (Can remain separate)
  fetch("./partials/footer.html")
    .then(response => response.text())
    .then(html => {
      const footerContainer = document.getElementById("site-footer");
      if (footerContainer) {
        footerContainer.innerHTML = html;
        
        // RE-SYNC THEME FOR INJECTED FOOTER
        const isLight = document.documentElement.classList.contains("light-mode");
        footerContainer.classList.toggle("light-mode", isLight);
      }
    });

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
  // 1. Get the current filename (e.g., 'projects.html')
  const path = window.location.pathname;
  let currentPage = path.split("/").pop();

  // 2. Handle the "Home" edge case (empty path or just a slash)
  if (currentPage === "" || currentPage === "/") {
    currentPage = "index.html";
  }

  // 3. Select all links in your navigation
  const navLinks = document.querySelectorAll(".menu-list a");

  navLinks.forEach(link => {
    // 4. Reset states first to prevent "Double Highlights"
    link.classList.remove("current");
    link.removeAttribute("aria-current");
    
    const href = link.getAttribute("href");
    if (!href) return;

    // 5. Normalize the link's href (removes './')
    const linkPage = href.replace("./", "").split("/").pop();
    
    // 6. Compare and Apply
    if (linkPage === currentPage) {
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
  const headerHeight = header.offsetHeight;

  // 1. Always show at the very top
  if (currentScrollY <= 0) {
    header.classList.remove("header-hidden");
    return;
  }

  // 2. Hide on scroll down (if we've scrolled past the header height)
  if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
    header.classList.add("header-hidden");
  } 
  // 3. Show on scroll up
  else {
    header.classList.remove("header-hidden");
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
}

// =========================
// Theme Logic & Toggle
// =========================
function applyTheme(isLight) {
  // 1. Update Classes
  document.documentElement.classList.toggle("light-mode", isLight);
  document.body.classList.toggle("light-mode", isLight);

  // 2. Update Mobile UI (Notch/Address Bar)
  const metaTheme = document.getElementById("meta-theme-color");
  if (metaTheme) {
    metaTheme.setAttribute("content", isLight ? "#ffffff" : "#000000");
  }

  // 3. Save Preference
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    // Briefly remove transitions so the colors swap instantly
    document.body.classList.remove("transitions-enabled");
    document.documentElement.classList.remove("transitions-enabled");
    
    const isCurrentlyLight = document.documentElement.classList.contains("light-mode");
    applyTheme(!isCurrentlyLight);

    // Re-enable transitions after the swap
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.add("transitions-enabled");
        document.documentElement.classList.add("transitions-enabled");
        toggle.blur(); // Ensures the moon/sun icon doesn't stay blue
      }, 50);
    });
  });
}

document.addEventListener('click', (e) => {
  const isInteractive = e.target.closest('a, button, .project-item');
  const isMenuOpen = document.body.classList.contains("menu-open");
  
  // Only blur if it's NOT a link (navigation should be handled by the browser)
  // and NOT while the menu is open (to preserve focus trap)
  if (isInteractive && !isMenuOpen && !e.target.closest('a')) {
    requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
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
