// Toggle dropdown menu and handle outside clicks
document.addEventListener('DOMContentLoaded', function () {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  const button = menu.querySelector('button');
  const list = menu.querySelector('.menu-list');

  function closeMenu() {
    // start closing animation
    menu.classList.remove('visible');
    button.setAttribute('aria-expanded', 'false');
    list.setAttribute('aria-hidden', 'true');
    // after transition, remove open and restore scrolling
    const onEnd = function () {
      try { menu.classList.remove('open'); } catch (e) {}
      try { document.body.style.overflow = ''; } catch (e) {}
      list.removeEventListener('transitionend', onEnd);
    };
    list.addEventListener('transitionend', onEnd);
  }

  function openMenu() {
    // show overlay and trigger slide-in
    menu.classList.add('open');
    // ensure paint then add visible class for transition
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('visible')));
    button.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');
    // prevent background scrolling while menu is open
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    // focus first non-current menu link for keyboard users (slightly after open)
    setTimeout(() => {
      const first = list.querySelector('a:not(.current)');
      if (first) first.focus();
    }, 250);
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

  // Close button inside overlay
  const closeBtn = menu.querySelector('.menu-close');
  if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeMenu(); });

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
