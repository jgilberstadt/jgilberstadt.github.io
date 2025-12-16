document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;

      // Initialize menu AFTER header is injected
      if (typeof initMenu === "function") {
        initMenu();
      }

      // Highlight active page
      highlightActivePage();
    })
    .catch(err => console.error("Failed to load header:", err));
});

function highlightActivePage() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".menu-list a");

  links.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("current");
      link.setAttribute("aria-current", "page");
    }
  });
}
