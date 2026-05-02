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

// ── Scroll: sombra dinâmica na navbar + colapso do ribbon ──────────────────
const ribbon = document.getElementById('top-ribbon');
const navbar = document.getElementById('main-navbar');
const navContent = document.getElementById('main-nav-content');
const SCROLL_THRESHOLD = 50;

let isScrolled = false;
let ticking = false;

function applyScrollState(scrolled: boolean): void {
  if (scrolled === isScrolled) return;
  isScrolled = scrolled;

  // Colapsa o ribbon ao ultrapassar a primeira dobra
  const pastFold = window.scrollY > window.innerHeight;
  if (pastFold) {
    ribbon?.classList.remove('h-8');
    ribbon?.classList.add('h-0', 'opacity-0', 'pointer-events-none');
  } else {
    ribbon?.classList.add('h-8');
    ribbon?.classList.remove('h-0', 'opacity-0', 'pointer-events-none');
  }

  if (scrolled) {
    navbar?.classList.add('shadow-md');
    navbar?.classList.remove('border-b', 'border-border-light');
    navContent?.classList.remove('h-20');
    navContent?.classList.add('h-16');
  } else {
    navbar?.classList.remove('shadow-md');
    navbar?.classList.add('border-b', 'border-border-light');
    navContent?.classList.remove('h-16');
    navContent?.classList.add('h-20');
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

// Inicializa estado correto (cobre carregamento já com a página rolada)
applyScrollState(window.scrollY > SCROLL_THRESHOLD);