const filters = document.querySelectorAll('.catalog-filter');
const items = document.querySelectorAll('.catalog-item');

filters.forEach((btn) => {
  btn.addEventListener('click', () => {
    const cat = btn.getAttribute('data-category');
    filters.forEach((f) => f.removeAttribute('data-active'));
    btn.setAttribute('data-active', '');
    items.forEach((item) => {
      const el = item as HTMLElement;
      el.style.display = (cat === 'todos' || item.getAttribute('data-category') === cat) ? '' : 'none';
    });
  });
});
