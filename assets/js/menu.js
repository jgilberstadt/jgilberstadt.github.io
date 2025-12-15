// Toggle dropdown menu and handle outside clicks
document.addEventListener('DOMContentLoaded', function () {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  const button = menu.querySelector('button');
  const list = menu.querySelector('.menu-list');

  function closeMenu() {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    list.setAttribute('aria-hidden', 'true');
  }

  function openMenu() {
    menu.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');
  }

  button.addEventListener('click', function (e) {
    e.stopPropagation();
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target)) closeMenu();
  });

  // Close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
});
