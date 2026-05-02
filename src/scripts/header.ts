/**
 * Header — comportamento client-side:
 * 1. Toggle do menu mobile (slide-in lateral).
 * 2. Sombra na barra principal quando há scroll.
 *
 * O scroll handler usa requestAnimationFrame + flag de estado para evitar
 * trabalho desnecessário (até 120 eventos/seg em mobile sem este filtro).
 */

// ── Mobile menu ──────────────────────────────────────────────────────────
const toggle  = document.getElementById('mobile-menu-toggle');
const closeBtn = document.getElementById('mobile-menu-close');
const menu    = document.getElementById('mobile-menu');

function openMenu(): void {
  menu?.classList.remove('translate-x-full');
  menu?.classList.add('translate-x-0');
  toggle?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu(): void {
  menu?.classList.remove('translate-x-0');
  menu?.classList.add('translate-x-full');
  toggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

toggle?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);

// Fecha ao clicar em qualquer link interno do menu
menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Fecha ao apertar Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ── Scroll: sombra dinâmica na navbar ────────────────────────────────────
const navbar = document.getElementById('main-navbar');
const SCROLL_THRESHOLD = 10;

let isScrolled = false;
let ticking = false;

function applyScrollState(scrolled: boolean): void {
  if (scrolled === isScrolled) return;
  isScrolled = scrolled;

  if (scrolled) {
    navbar?.classList.add('shadow-md');
  } else {
    navbar?.classList.remove('shadow-md');
  }
}

function onScrollFrame(): void {
  applyScrollState(window.scrollY > SCROLL_THRESHOLD);
  ticking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  },
  { passive: true }
);

// Inicializa estado correto
applyScrollState(window.scrollY > SCROLL_THRESHOLD);