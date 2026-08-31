// ============================================================
// GoDiet Survey — Application Logic
// ============================================================

const ADMIN_EMAIL = 'YOUR_EMAIL@example.com'; // <-- ЗАМЕНИТЕ НА ВАШИ EMAIL
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';   // <-- Ваш EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // <-- Ваш EmailJS Template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';    // <-- Ваш EmailJS Public Key

// ============================================================
// STATE
// ============================================================
let currentStep = 1;
const TOTAL_STEPS = 5;

const formData = {
  // Step 1
  fullName: '', phone: '', location: '', gender: '', age: '',
  // Step 2
  weight: '', height: '', goal: '', duration: '',
  // Step 3
  package: '', preferences: [], disliked: '', allergens: '',
  // Step 4
  deliveryAddress: '', zone: '', deliveryNote: '',
  // Step 5
  orderDuration: '', payment: '', clientEmail: '',
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initRadioCards();
  initCheckboxCards();
  initGoalCards();
  initPackageCards();
  initDurationCards();
  initPaymentCards();
  initBMI();
  initSummaryUpdates();
  initPhoneMask();
  loadEmailJS();
});

function loadEmailJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = () => {
    if (typeof emailjs !== 'undefined') {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  };
  document.head.appendChild(script);
}

// ============================================================
// NAVIGATION
// ============================================================
function startSurvey() {
  document.getElementById('hero').style.display = 'none';
  document.getElementById('surveySection').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(step) {
  if (!validateStep(step)) return;
  collectStepData(step);
  goToStep(step + 1);
  updateSummary();
}

function prevStep(step) {
  goToStep(step - 1);
}

function goToStep(targetStep) {
  // hide current
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  document.getElementById(`dot-${currentStep}`)?.classList.remove('active');

  // mark completed dots
  for (let i = 1; i < targetStep; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      dot.classList.remove('active');
      dot.classList.add('completed');
    }
  }

  currentStep = targetStep;

  // show new step
  const newCard = document.getElementById(`step-${currentStep}`);
  if (newCard) {
    newCard.classList.add('active');
    newCard.style.animation = 'none';
    void newCard.offsetWidth;
    newCard.style.animation = 'slideInCard 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  const dot = document.getElementById(`dot-${currentStep}`);
  if (dot) {
    dot.classList.remove('completed');
    dot.classList.add('active');
  }

  // update progress
  const pct = (currentStep / TOTAL_STEPS) * 100;
  document.getElementById('progressBar').style.width = `${pct}%`;
  document.getElementById('progressLabel').textContent = `Шаг ${currentStep} из ${TOTAL_STEPS}`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// VALIDATION
// ============================================================
function validateStep(step) {
  clearErrors();

  if (step === 1) {
    const name = getValue('fullName');
    const phone = getValue('phone');
    const loc = getValue('location');
    const gender = getRadioValue('gender');
    const age = getValue('age');

    let ok = true;
    if (!name.trim()) { showError('fullName', 'Укажите ФИО'); ok = false; }
    if (!phone.trim()) { showError('phone', 'Укажите номер телефона'); ok = false; }
    if (!loc.trim()) { showError('location', 'Укажите место проживания'); ok = false; }
    if (!gender) { showToast('Выберите пол', 'error'); ok = false; }
    if (!age || age < 10 || age > 100) { showError('age', 'Укажите корректный возраст'); ok = false; }
    return ok;
  }

  if (step === 2) {
    const weight = getValue('weight');
    const height = getValue('height');
    const goal = getRadioValue('goal');

    let ok = true;
    if (!weight || weight < 30 || weight > 300) { showError('weight', 'Укажите корректный вес'); ok = false; }
    if (!height || height < 100 || height > 250) { showError('height', 'Укажите корректный рост'); ok = false; }
    if (!goal) { showToast('Выберите желаемый результат', 'error'); ok = false; }
    return ok;
  }

  if (step === 3) {
    const pkg = getRadioValue('package');
    if (!pkg) { showToast('Выберите тип пакета', 'error'); return false; }
    return true;
  }

  if (step === 4) {
    const addr = getValue('deliveryAddress');
    const zone = getValue('zone');

    let ok = true;
    if (!addr.trim()) { showError('deliveryAddress', 'Çatdırılma ünvanını qeyd edin'); ok = false; }
    if (!zone.trim()) { showError('zone', 'Rayonu qeyd edin (məs. Nəsimi, Nizami...)'); ok = false; }
    return ok;
  }

  return true;
}

function showError(fieldId, msg) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.classList.add('error-field');
  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = msg;
  el.parentNode.appendChild(err);
  el.addEventListener('input', () => {
    el.classList.remove('error-field');
    const e = el.parentNode.querySelector('.field-error');
    if (e) e.remove();
  }, { once: true });
}

function clearErrors() {
  document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
  document.querySelectorAll('.field-error').forEach(el => el.remove());
}

// ============================================================
// DATA COLLECTION
// ============================================================
function collectStepData(step) {
  if (step === 1) {
    formData.fullName = getValue('fullName');
    formData.phone = getValue('phone');
    formData.location = getValue('location');
    formData.gender = getRadioValue('gender');
    formData.age = getValue('age');
  }

  if (step === 2) {
    formData.weight = getValue('weight');
    formData.height = getValue('height');
    formData.goal = getRadioValue('goal');
    formData.duration = getValue('duration');
  }

  if (step === 3) {
    formData.package = getRadioValue('package');
    formData.preferences = getCheckboxValues('preferences');
    formData.disliked = getValue('disliked');
    formData.allergens = getValue('allergens');
  }

  if (step === 4) {
    formData.deliveryAddress = getValue('deliveryAddress');
    formData.zone = getValue('zone');
    formData.deliveryNote = getValue('deliveryNote');
  }
}

function collectAllData() {
  collectStepData(1);
  collectStepData(2);
  collectStepData(3);
  collectStepData(4);
  formData.orderDuration = getRadioValue('orderDuration');
  formData.payment = getRadioValue('payment');
  formData.clientEmail = getValue('clientEmail');
}

// ============================================================
// SUBMIT
// ============================================================
async function submitForm() {
  if (!validateStep(5)) return;

  const duration = getRadioValue('orderDuration');
  const payment = getRadioValue('payment');
  const agree = document.getElementById('agreeTerms').checked;

  if (!duration) { showToast('Выберите продолжительность программы', 'error'); return; }
  if (!payment) { showToast('Выберите способ оплаты', 'error'); return; }
  if (!agree) { showToast('Необходимо согласиться с условиями', 'error'); return; }

  collectAllData();

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="submit-icon">⏳</span> Отправка...';

  try {
    await sendEmail();
    showSuccess();
  } catch (err) {
    console.error('Email error:', err);
    // Still show success to user — log error for admin
    showSuccess();
    showToast('Заявка принята (email-уведомление может быть недоступно)', 'warning');
  }
}

async function sendEmail() {
  const prefsStr = formData.preferences.length ? formData.preferences.join(', ') : 'Не указаны';
  const bmiVal = calcBMI();

  const emailBody = `
🥗 НОВАЯ ЗАЯВКА GODIET
═══════════════════════════════

👤 ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
ФИО:              ${formData.fullName}
Телефон:          ${formData.phone}
Место проживания: ${formData.location}
Пол:              ${formData.gender}
Возраст:          ${formData.age} лет

⚖️ ДАННЫЕ ДЛЯ ДИЕТЫ
Вес:              ${formData.weight} кг
Рост:             ${formData.height} см
ИМТ:              ${bmiVal || 'Не рассчитан'}
Цель:             ${formData.goal}
Срок:             ${formData.duration || 'Не указан'}

📦 ВЫБОР ПАКЕТА
Пакет:            ${formData.package}
Предпочтения:     ${prefsStr}
Нелюбимые:        ${formData.disliked || 'Не указаны'}
Аллергены:        ${formData.allergens || 'Нет'}

🚚 ДОСТАВКА
Адрес:            ${formData.deliveryAddress}
Зона/Время:       ${formData.zone}
Комментарий:      ${formData.deliveryNote || 'Нет'}

✅ ЗАКАЗ
Продолжительность: ${formData.orderDuration}
Способ оплаты:     ${formData.payment}
Email клиента:     ${formData.clientEmail || 'Не указан'}

═══════════════════════════════
Дата: ${new Date().toLocaleString('ru-RU')}
  `;

  if (typeof emailjs !== 'undefined' &&
      EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: ADMIN_EMAIL,
      subject: `GoDiet — Новая заявка от ${formData.fullName}`,
      message: emailBody,
      from_name: formData.fullName,
      from_phone: formData.phone,
      client_email: formData.clientEmail || 'Не указан',
      package: formData.package,
      goal: formData.goal,
      order_duration: formData.orderDuration,
      delivery_zone: formData.zone,
    });
  } else {
    // Fallback: mailto link (opens email client)
    console.log('EmailJS не настроен. Данные формы:', formData);
    console.log('Тело письма:', emailBody);

    // Открыть mailto как запасной вариант
    const subject = encodeURIComponent(`GoDiet — Новая заявка от ${formData.fullName}`);
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;

    const a = document.createElement('a');
    a.href = mailtoLink;
    a.click();
  }
}

function showSuccess() {
  // Hide current step
  document.getElementById(`step-${currentStep}`).classList.remove('active');

  // Show success
  const successCard = document.getElementById('step-success');
  successCard.style.display = 'block';
  successCard.classList.add('active');
  successCard.style.animation = 'slideInCard 0.5s ease';

  // Fill in details
  const details = document.getElementById('successDetails');
  details.innerHTML = `
    <div class="success-detail-row"><span>👤 Клиент:</span><span>${formData.fullName}</span></div>
    <div class="success-detail-row"><span>📦 Пакет:</span><span>${formData.package}</span></div>
    <div class="success-detail-row"><span>📅 Срок:</span><span>${formData.orderDuration}</span></div>
    <div class="success-detail-row"><span>🚚 Зона:</span><span>${formData.zone}</span></div>
    <div class="success-detail-row"><span>💳 Оплата:</span><span>${formData.payment}</span></div>
  `;

  // Update progress
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('progressLabel').textContent = 'Заявка отправлена!';

  // Mark all dots completed
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) { dot.classList.remove('active'); dot.classList.add('completed'); }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  launchConfetti();
}

function resetSurvey() {
  currentStep = 1;
  document.getElementById('step-success').style.display = 'none';
  document.getElementById('step-success').classList.remove('active');

  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const card = document.getElementById(`step-${i}`);
    if (card) card.classList.remove('active');
    const dot = document.getElementById(`dot-${i}`);
    if (dot) { dot.classList.remove('active', 'completed'); }
  }

  document.getElementById('step-1').classList.add('active');
  document.getElementById('dot-1').classList.add('active');
  document.getElementById('progressBar').style.width = '20%';
  document.getElementById('progressLabel').textContent = 'Шаг 1 из 5';

  document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], input[type="email"], textarea, select')
    .forEach(el => { el.value = ''; });
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]')
    .forEach(el => { el.checked = false; });
  document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
  document.getElementById('agreeTerms').checked = false;

  Object.keys(formData).forEach(k => {
    formData[k] = Array.isArray(formData[k]) ? [] : '';
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// BMI CALCULATOR
// ============================================================
function initBMI() {
  const weightEl = document.getElementById('weight');
  const heightEl = document.getElementById('height');

  const update = () => {
    const bmi = calcBMI();
    const widget = document.getElementById('bmiWidget');
    if (bmi) {
      widget.style.display = 'flex';
      document.getElementById('bmiValue').textContent = bmi;
      document.getElementById('bmiStatus').textContent = getBMIStatus(parseFloat(bmi));
    } else {
      widget.style.display = 'none';
    }
  };

  weightEl?.addEventListener('input', update);
  heightEl?.addEventListener('input', update);
}

function calcBMI() {
  const w = parseFloat(document.getElementById('weight')?.value);
  const h = parseFloat(document.getElementById('height')?.value);
  if (!w || !h || h < 50) return null;
  return (w / ((h / 100) ** 2)).toFixed(1);
}

function getBMIStatus(bmi) {
  if (bmi < 18.5) return '⚡ Недостаток веса';
  if (bmi < 25)   return '✅ Нормальный вес';
  if (bmi < 30)   return '⚠️ Избыточный вес';
  return '🔴 Ожирение';
}

// ============================================================
// SUMMARY
// ============================================================
function initSummaryUpdates() {
  document.querySelectorAll('input[name="orderDuration"]').forEach(el => {
    el.addEventListener('change', updateSummary);
  });
  document.querySelectorAll('input[name="payment"]').forEach(el => {
    el.addEventListener('change', updateSummary);
  });
}

function updateSummary() {
  const pkg = formData.package || getRadioValue('package') || '—';
  const orderDur = getRadioValue('orderDuration') || '—';
  const zone = formData.zone || getRadioValue('zone') || '—';
  const pay = getRadioValue('payment') || '—';

  document.getElementById('sumPackage').textContent = pkg;
  document.getElementById('sumDuration').textContent = orderDur;
  document.getElementById('sumZone').textContent = zone;
  document.getElementById('sumPayment').textContent = pay;
}

// ============================================================
// INTERACTIVE COMPONENTS
// ============================================================
function initRadioCards() {
  // Gender cards
  document.querySelectorAll('.radio-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    input.addEventListener('change', () => {
      document.querySelectorAll(`.radio-card`).forEach(c => {
        if (c.querySelector('input')?.name === input.name) {
          c.classList.remove('selected');
        }
      });
      card.classList.add('selected');
    });
    card.addEventListener('click', () => {
      input.checked = true;
      input.dispatchEvent(new Event('change'));
    });
  });
}

function initGoalCards() {
  document.querySelectorAll('.goal-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      input.checked = true;
    });
  });
}

function initPackageCards() {
  document.querySelectorAll('.package-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    card.addEventListener('click', () => {
      document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      input.checked = true;
    });
  });
}

function initZoneCards() {
  document.querySelectorAll('.zone-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    card.addEventListener('click', () => {
      document.querySelectorAll('.zone-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      input.checked = true;
    });
  });
}

function initDurationCards() {
  document.querySelectorAll('.duration-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    card.addEventListener('click', () => {
      document.querySelectorAll('.duration-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      input.checked = true;
      updateSummary();
    });
  });
}

function initPaymentCards() {
  document.querySelectorAll('.payment-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      input.checked = true;
      updateSummary();
    });
  });
}

function initCheckboxCards() {
  document.querySelectorAll('.checkbox-card').forEach(card => {
    const input = card.querySelector('input[type="checkbox"]');
    if (!input) return;
    card.addEventListener('click', () => {
      input.checked = !input.checked;
      card.classList.toggle('selected', input.checked);
    });
  });
}

// ============================================================
// PHONE MASK
// ============================================================
function initPhoneMask() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    // Handle +994 Azerbaijan format
    if (val.startsWith('994')) {
      val = val.slice(0, 12);
      let fmt = '+994';
      if (val.length > 3) fmt += ' ' + val.slice(3, 5);
      if (val.length > 5) fmt += ' ' + val.slice(5, 8);
      if (val.length > 8) fmt += ' ' + val.slice(8, 10);
      if (val.length > 10) fmt += ' ' + val.slice(10, 12);
      e.target.value = fmt;
    } else if (val.startsWith('0')) {
      // Local format starting with 0
      val = '994' + val.slice(1);
      e.target.value = '+994 ';
    } else if (val.length > 0 && !val.startsWith('994')) {
      e.target.value = '+994 ' + val.slice(0, 9);
    }
  });

  phoneInput.addEventListener('focus', (e) => {
    if (!e.target.value) e.target.value = '+994 ';
  });
}

// ============================================================
// PARTICLES
// ============================================================
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --duration: ${6 + Math.random() * 8}s;
      --delay: ${Math.random() * 6}s;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      opacity: ${0.2 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
}

// ============================================================
// CONFETTI
// ============================================================
function launchConfetti() {
  const colors = ['#10b981', '#34d399', '#a3e635', '#84cc16', '#6ee7b7', '#d1fae5'];
  const container = document.getElementById('particles');

  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -20px;
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 9999;
        animation: confettiFall ${1.5 + Math.random() * 2}s ease-in forwards;
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }, i * 30);
  }

  // Add confetti animation if not exists
  if (!document.getElementById('confettiStyle')) {
    const style = document.createElement('style');
    style.id = 'confettiStyle';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(${Math.random() > 0.5 ? '' : '-'}${360 + Math.random() * 360}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(msg, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    `;
    document.body.appendChild(container);
  }

  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  const colors = {
    info: 'rgba(16, 185, 129, 0.15)',
    success: 'rgba(163, 230, 53, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
    warning: 'rgba(245, 158, 11, 0.15)',
  };
  const borders = {
    info: 'rgba(16, 185, 129, 0.4)',
    success: 'rgba(163, 230, 53, 0.4)',
    error: 'rgba(239, 68, 68, 0.4)',
    warning: 'rgba(245, 158, 11, 0.4)',
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.25rem;
    background: ${colors[type]};
    border: 1px solid ${borders[type]};
    border-radius: 12px;
    font-size: 0.9rem;
    color: #f0fdf4;
    font-family: Inter, sans-serif;
    backdrop-filter: blur(16px);
    max-width: 320px;
    animation: slideInRight 0.3s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  `;

  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = `
      @keyframes slideInRight {
        from { opacity:0; transform:translateX(30px); }
        to { opacity:1; transform:translateX(0); }
      }
      .field-error {
        font-size: 0.8rem;
        color: #f87171;
        margin-top: 0.25rem;
      }
      .error-field {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
      }
    `;
    document.head.appendChild(s);
  }

  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================
// HELPERS
// ============================================================
function getValue(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function getCheckboxValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => el.value);
}
