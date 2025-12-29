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

  if (!toggleButton || !menuList) return;

  let removeFocusTrap = null;

  function getFocusableElements() {
    // We only need the toggle and the links now
    return Array.from(document.querySelectorAll('.menu-toggle, .menu-list a[href]'));
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

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }

  function openMenu() {
    if (window.innerWidth >= 769) return;
    document.body.classList.add("menu-open");
    
    // Add this to lock the background
    document.body.style.overflow = "hidden"; 
    
    toggleButton.setAttribute("aria-expanded", "true");
    removeFocusTrap = trapFocus();
  }

  function closeMenu() {
    if (!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    
    // Restore scrolling when menu closes
    document.body.style.overflow = ""; 
    
    toggleButton.setAttribute("aria-expanded", "false");
    if (removeFocusTrap) removeFocusTrap();
    toggleButton.focus();
  }

  toggleButton.addEventListener("click", e => {
    e.stopPropagation();
    document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
  });

  // Close when clicking outside or on links
  document.addEventListener("click", e => {
    if (document.body.classList.contains("menu-open") && 
        !menuList.contains(e.target) && !toggleButton.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) closeMenu();
  });

  menuList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => closeMenu());
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
  const scrollDelta = currentScrollY - lastScrollY;
  const tolerance = 5; // Pixels to ignore to prevent jitter

  // 1. Force show at the very top (and handle iOS bounce)
  if (currentScrollY <= 50) {
    header.classList.remove("header-hidden");
    header.classList.add("header-visible");
    lastScrollY = currentScrollY;
    ticking = false;
    return;
  }

  // 2. Ignore tiny scrolls (tolerance)
  if (Math.abs(scrollDelta) <= tolerance) {
    ticking = false;
    return;
  }

  // 3. The Core Logic
  if (scrollDelta > 0 && currentScrollY > headerHeight) {
    // Scrolling Down - Hide it
    header.classList.add("header-hidden");
    header.classList.remove("header-visible");
  } else if (scrollDelta < 0) {
    // Scrolling Up - Show it
    header.classList.remove("header-hidden");
    header.classList.add("header-visible");
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
  document.documentElement.classList.toggle("light-mode", isLight);
  document.body.classList.toggle("light-mode", isLight);

  // Sync the footer if it exists in the DOM
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.classList.toggle("light-mode", isLight);
  }

  const metaTheme = document.getElementById("meta-theme-color");
  if (metaTheme) {
    metaTheme.setAttribute("content", isLight ? "#ffffff" : "#000000");
  }

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
      }, 100);
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
