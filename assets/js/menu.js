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

  // Highlight the current page in the menu
  try {
    const anchors = Array.from(menu.querySelectorAll('.menu-list a'));
    // Determine current page file name (e.g., index.html or about.html)
    let current = window.location.pathname.split('/').pop();
    if (!current) current = 'index.html';

    anchors.forEach(a => {
      const href = a.getAttribute('href').split('/').pop();
      if (!href) return;
      if (href === current) {
        a.classList.add('current');
        a.setAttribute('aria-current', 'page');
        a.setAttribute('tabindex', '-1');
      } else {
        a.removeAttribute('aria-current');
        a.removeAttribute('tabindex');
      }
    });
  } catch (err) {
    // fail silently
    console.warn('Menu highlight error', err);
  }
});
