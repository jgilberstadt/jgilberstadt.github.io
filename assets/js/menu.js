function setupMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const button = menu.querySelector('button');
  const list = menu.querySelector('.menu-list');
  const closeBtn = menu.querySelector(".menu-close");

  function closeMenu() {
    menu.classList.remove('visible');
    button.setAttribute('aria-expanded', 'false');
    list.setAttribute('aria-hidden', 'true');

   list.addEventListener("transitionend", function handler() {
      menu.classList.remove("open");
      document.body.style.overflow = "";
      list.removeEventListener("transitionend", handler);
    });
  }

  function openMenu() {
    const firstLink = list.querySelector("a");
    if (firstLink) firstLink.focus();
    menu.classList.add('open');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => menu.classList.add('visible'))
    );
    button.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  button.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  
  closeBtn.addEventListener("click", e => {
    e.stopPropagation();
    closeMenu();
  });
  
  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  highlightCurrentPage(menu);
}

function highlightCurrentPage(menu) {
  const current = window.location.pathname.split("/").pop() || "index.html";

  menu.querySelectorAll(".menu-list a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("current");
      link.setAttribute("aria-current", "page");
      link.setAttribute("tabindex", "-1");
    }
  });
}
