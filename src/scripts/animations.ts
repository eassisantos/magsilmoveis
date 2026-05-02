// Scroll reveal via IntersectionObserver
// Elements with [data-animate] start invisible and slide up into view.
// [data-animate-delay="1|2|3|4"] adds staggered transition delays.

const DELAYS: Record<string, string> = {
  '1': '100ms',
  '2': '200ms',
  '3': '300ms',
  '4': '400ms',
};

function initScrollAnimations(): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = el.dataset.animateDelay;
        if (delay && DELAYS[delay]) el.style.transitionDelay = DELAYS[delay];
        el.classList.add('animate-in');
        observer.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}
