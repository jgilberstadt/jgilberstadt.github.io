document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;

      // Initialize menu AFTER header is injected
      if (typeof initMenu === "function") {
        initMenu();
      }
    })
    .catch(err => console.error("Failed to load header:", err));
});
