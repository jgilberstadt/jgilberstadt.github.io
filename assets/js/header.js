document.addEventListener("DOMContentLoaded", () => {
  fetch("partials/header.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("site-header").innerHTML = html;
      setupMenu();
    })
    .catch(err => console.error("Failed to load header:", err));
});
