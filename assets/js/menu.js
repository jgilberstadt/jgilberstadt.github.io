document.addEventListener("DOMContentLoaded", () => {
  // Inject Header
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;
      setupMenu();
      setupHeaderScroll();
      adjustBodyPadding();
      setupThemeToggle();
      window.addEventListener("resize", adjustBodyPadding);
    })
    .catch(err => console.error("Failed to load header:", err));

  // Inject Footer
  fetch("partials/footer.html")
    .then(response => response.text())
    .then(html => {
      // Create a div for the footer if it doesn't exist
      let siteFooter = document.getElementById("site-footer");
      if (!siteFooter) {
        siteFooter = document.createElement("div");
        siteFooter.id = "site-footer";
        document.body.appendChild(siteFooter);
      }
      siteFooter.innerHTML = html;
    })
    .catch(err => console.error("Failed to load footer:", err));
});

// =========================
// Menu Toggle + Focus Trap
// =========================
function setupMenu() {
  const menu = document.querySelector(".menu");
  const toggleButton = document.querySelector(".menu-toggle");
  const menuList = document.querySelector(".menu-list");

  if (!menu || !toggleButton || !menuList) return;

  let removeFocusTrap = null;

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

  // Make menu visible first
  menuList.style.display = "flex";

  // Use requestAnimationFrame to ensure the display change is applied before adding the body class
  requestAnimationFrame(() => {
    document.body.classList.add("menu-open");
    toggleButton.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    removeFocusTrap = trapFocus();
  });
}

function closeMenu() {
  if (!document.body.classList.contains("menu-open")) return;

  document.body.classList.remove("menu-open");
  toggleButton.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";

  // Delay hiding the menuList slightly to allow any CSS transitions (optional)
  setTimeout(() => {
    menuList.style.display = "none";
  }, 50);

  if (removeFocusTrap) removeFocusTrap();
  toggleButton.focus();
}

  toggleButton.addEventListener("click", e => {
    e.stopPropagation();
    document.body.classList.contains("menu-open")
      ? closeMenu()
      : openMenu();
  });

  menuList.addEventListener("click", e => {
    if (e.target.closest(".menu-close")) closeMenu();
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
}

// =========================
// Highlight Current Page
// =========================
function highlightCurrentPage() {
  // 1. Get the current path and clean it up
  // This handles trailing slashes and empty paths (home)
  let currentPath = window.location.pathname.split("/").pop();
  
  // Default to index.html if the path is empty (common on homepages)
  if (currentPath === "" || currentPath === "/") {
    currentPath = "index.html";
  }

  const navLinks = document.querySelectorAll(".menu-list a");

  navLinks.forEach(link => {
    // Remove existing states first to be safe
    link.classList.remove("current");
    link.removeAttribute("aria-current");
    link.removeAttribute("tabindex");

    const href = link.getAttribute("href");

    // 2. Check for a match
    if (href === currentPath) {
      link.classList.add("current");
      link.setAttribute("aria-current", "page");
      // Prevent tabbing to the current page for better accessibility
      link.setAttribute("tabindex", "-1");
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

// =========================
// Body Padding = Header Height
// =========================
function adjustBodyPadding() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  // Calculate header height + 32px (2rem) for a comfortable gap
  const gap = 32; 
  document.body.style.paddingTop = `${header.offsetHeight + gap}px`;
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  // Check for saved preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "light") {
    document.body.classList.add("light-mode");
  }

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
