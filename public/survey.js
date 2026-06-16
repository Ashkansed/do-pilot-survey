document.querySelectorAll('.rating-scale').forEach((container) => {
  const name = container.dataset.name;
  for (let i = 1; i <= 5; i++) {
    const id = `${name}_${i}`;
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="${name}" value="${i}" required> <span>${i}</span>`;
    container.appendChild(label);
  }
});

document.getElementById('dateCompleted').valueAsDate = new Date();

const form = document.getElementById('surveyForm');
const submitBtn = document.getElementById('submitBtn');
const successView = document.getElementById('successView');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (key === 'productsUtilized') {
      if (!data.productsUtilized) data.productsUtilized = [];
      data.productsUtilized.push(value);
    } else {
      data[key] = value;
    }
  }

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Submit failed');

    form.style.display = 'none';
    successView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    alert('Failed to submit survey. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Survey';
  }
});

function validateForm() {
  let valid = true;

  document.querySelectorAll('.field').forEach((field) => {
    field.classList.remove('invalid');
  });

  const requiredText = ['respondentName', 'dateCompleted'];
  requiredText.forEach((name) => {
    const input = form.elements[name];
    if (!input.value.trim()) {
      input.closest('.field').classList.add('invalid');
      valid = false;
    }
  });

  const period = form.querySelector('input[name="surveyPeriod"]:checked');
  if (!period) {
    document.getElementById('surveyPeriodGroup').closest('.field').classList.add('invalid');
    valid = false;
  }

  const ratingNames = [
    'platform_q1', 'platform_q2', 'platform_q3', 'platform_q4', 'platform_q5', 'platform_q6',
    'product_q1', 'product_q2', 'product_q3', 'product_q4', 'product_q5',
    'satisfaction_q1', 'satisfaction_q2', 'satisfaction_q3', 'satisfaction_q4',
    'continueLikelihood',
  ];

  ratingNames.forEach((name) => {
    if (!form.querySelector(`input[name="${name}"]:checked`)) {
      valid = false;
      const container = document.querySelector(`.rating-scale[data-name="${name}"]`);
      if (container) {
        container.style.outline = '2px solid #e53e3e';
        container.style.borderRadius = '6px';
        container.style.padding = '0.25rem';
      }
    }
  });

  if (!valid) {
    const firstInvalid = document.querySelector('.field.invalid, .rating-scale[style*="outline"]');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alert('Please complete all required fields and rating questions.');
  }

  return valid;
}

form.addEventListener('change', (e) => {
  if (e.target.type === 'radio') {
    const container = e.target.closest('.rating-scale');
    if (container) {
      container.style.outline = '';
      container.style.padding = '';
    }
  }
});
