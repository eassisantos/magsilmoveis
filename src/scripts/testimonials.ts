const track = document.getElementById('testimonial-track') as HTMLElement;
const prevBtn = document.getElementById('testimonial-prev') as HTMLButtonElement;
const nextBtn = document.getElementById('testimonial-next') as HTMLButtonElement;
const dots = document.querySelectorAll('.testimonial-dot');
const cards = document.querySelectorAll('.testimonial-card');

const totalCards = cards.length;
const isMobile = window.innerWidth < 768;
const perPage = isMobile ? 1 : 3;
const totalPages = Math.ceil(totalCards / perPage);
let currentPage = 0;

function getCardWidth(): number {
  const card = cards[0] as HTMLElement;
  if (!card) return 0;
  const gap = 32; // gap-8 = 2rem = 32px
  return card.offsetWidth + gap;
}

function updateCarousel(): void {
  const offset = currentPage * perPage * getCardWidth();
  track.style.transform = `translateX(-${offset}px)`;

  // Update dots
  dots.forEach((dot, i) => {
    if (i === currentPage) {
      dot.classList.add('bg-gold');
      dot.classList.remove('bg-border');
    } else {
      dot.classList.remove('bg-gold');
      dot.classList.add('bg-border');
    }
  });

  // Update button states
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage >= totalPages - 1;
  prevBtn.style.opacity = currentPage === 0 ? '0.4' : '1';
  nextBtn.style.opacity = currentPage >= totalPages - 1 ? '0.4' : '1';
}

prevBtn?.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    updateCarousel();
  }
});

nextBtn?.addEventListener('click', () => {
  if (currentPage < totalPages - 1) {
    currentPage++;
    updateCarousel();
  }
});

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = parseInt(dot.getAttribute('data-index') || '0', 10);
    currentPage = index;
    updateCarousel();
  });
});

// Auto-play (pause on hover)
let autoplayInterval: ReturnType<typeof setInterval> | null = null;

function startAutoplay(): void {
  autoplayInterval = setInterval(() => {
    currentPage = currentPage < totalPages - 1 ? currentPage + 1 : 0;
    updateCarousel();
  }, 5000);
}

function stopAutoplay(): void {
  if (autoplayInterval) clearInterval(autoplayInterval);
}

track.addEventListener('mouseenter', stopAutoplay);
track.addEventListener('mouseleave', startAutoplay);

// Initialize
updateCarousel();
startAutoplay();
