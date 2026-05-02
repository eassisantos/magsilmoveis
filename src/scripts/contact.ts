const form = document.getElementById('contact-form') as HTMLFormElement;
const statusDiv = document.getElementById('form-status');
const successDiv = document.getElementById('form-success');
const errorDiv = document.getElementById('form-error');
const submitBtn = document.getElementById('form-submit') as HTMLButtonElement;

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  statusDiv?.classList.add('hidden');
  successDiv?.classList.add('hidden');
  errorDiv?.classList.add('hidden');

  try {
    const formData = new FormData(form);
    const res = await fetch('/api/contact', { method: 'POST', body: formData });
    statusDiv?.classList.remove('hidden');
    if (res.ok) {
      successDiv?.classList.remove('hidden');
      form.reset();
    } else {
      errorDiv?.classList.remove('hidden');
    }
  } catch {
    statusDiv?.classList.remove('hidden');
    errorDiv?.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Mensagem';
  }
});
