function setupMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const button = menu.querySelector('button');
  const list = menu.querySelector('.menu-list');

  function closeMenu() {
    menu.classList.remove('visible');
    button.setAttribute('aria-expanded', 'false');
    list.setAttribute('aria-hidden', 'true');

    const onEnd = () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
      list.removeEventListener('transitionend', onEnd);
    };
    list.addEventListener('transitionend', onEnd);
  }

  function openMenu() {
    menu.classList.add('open');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => menu.classList.add('visible'))
    );
    button.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const first = list.querySelector('a:not(.current)');
      if (first) first.focus();
    }, 250);
  }

  button.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  const closeBtn = menu.querySelector('.menu-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeMenu();
    });
  }

  highlightActiveMenuItem(menu);
}

function initMenu() {
  const menu = document.querySelector(".menu");
  if (!menu) return;

  const button = menu.querySelector("button");
  const menuList = menu.querySelector(".menu-list");
  const closeButton = menu.querySelector(".menu-close");

  button.addEventListener("click", () => {
    menu.classList.add("open");
    requestAnimationFrame(() => menu.classList.add("visible"));
    button.setAttribute("aria-expanded", "true");
    menuList.setAttribute("aria-hidden", "false");
  });

  closeButton.addEventListener("click", () => {
    menu.classList.remove("visible");
    menu.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    menuList.setAttribute("aria-hidden", "true");
  });
}
