document.addEventListener("DOMContentLoaded", () => {
  // Inject header
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      const siteHeaderContainer = document.getElementById("site-header");
      siteHeaderContainer.innerHTML = html;

      setupMenu();
      setupHeaderScroll();
      adjustBodyPadding();

      window.addEventListener("resize", adjustBodyPadding);
    })
    .catch(err => console.error("Failed to load header:", err));
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

    document.body.classList.add("menu-open");
    toggleButton.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    removeFocusTrap = trapFocus();
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
    toggleButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

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
  const current = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".menu-list a").forEach(link => {
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

  document.body.style.paddingTop = `${header.offsetHeight}px`;
}
