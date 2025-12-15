import { convertPassword, Alphabets } from './js/converter.js';

const passwordInput = document.getElementById('password-input');
const passwordToggle = document.getElementById('password-toggle');
const saltInput = document.getElementById('salt-input');
const saltToggle = document.getElementById('salt-toggle');
const lengthInput = document.getElementById('length-input');
const alphabetSelect = document.getElementById('alphabet-select');
const tooltip = document.getElementById('alphabet-tooltip');
const output = document.getElementById('generated-output');
const outputToggle = document.getElementById('output-toggle');
const generateBtn = document.getElementById('generate');

let revealTimeouts = new Map();
let revealSpans = new Map();
// offscreen canvas for text measurement
const _textMeasureCanvas = document.createElement('canvas');
const _textMeasureCtx = _textMeasureCanvas.getContext('2d');


function showAlphabetTooltip(key) {
  const alpha = Alphabets[key] || Alphabets.specialSimple;
  tooltip.textContent = alpha;
  tooltip.style.display = 'block';
  tooltip.setAttribute('aria-hidden', 'false');
}

function hideAlphabetTooltip() {
  tooltip.style.display = 'none';
  tooltip.setAttribute('aria-hidden', 'true');
}

alphabetSelect.addEventListener('mouseover', () => {
  const key = alphabetSelect.value || 'specialSimple';
  showAlphabetTooltip(key);
});

alphabetSelect.addEventListener('mousemove', () => {
  const key = alphabetSelect.value || 'specialSimple';
  showAlphabetTooltip(key);
});

alphabetSelect.addEventListener('mouseleave', hideAlphabetTooltip);

alphabetSelect.addEventListener('change', () => {
  showAlphabetTooltip(alphabetSelect.value);
});

// Brief reveal: show only the last typed character for 700ms using an overlay span
function briefReveal(input) {
  // don't reveal if user explicitly toggled visibility on
  if (input.dataset.userVisible === 'true') return;

  // Clear previous timeout if any
  if (revealTimeouts.has(input)) {
    clearTimeout(revealTimeouts.get(input));
  }

  const val = input.value || '';
  if (val.length === 0) return;
  const last = val.slice(-1);

  // wrapper is .input-with-icon or parent
  const wrapper = input.closest('.input-with-icon') || input.parentElement;

  let span = revealSpans.get(input);
  if (!span) {
    span = document.createElement('span');
    span.className = 'char-reveal';
    span.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(span);
    revealSpans.set(input, span);
  }

  span.textContent = last;
  span.style.opacity = '1';

  // position near the right by default so it appears before the eye icon
  span.style.right = '40px';

  // clear after timeout
  const t = setTimeout(() => {
    span.style.opacity = '0';
    // remove after transition
    setTimeout(() => {
      if (span && span.parentElement) span.parentElement.removeChild(span);
      revealSpans.delete(input);
    }, 150);
    revealTimeouts.delete(input);
  }, 700);
  revealTimeouts.set(input, t);
}

passwordInput.addEventListener('input', () => briefReveal(passwordInput));
saltInput.addEventListener('input', () => briefReveal(saltInput));

// Toggle buttons for password and salt
passwordToggle.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordInput.dataset.userVisible = 'true';
    passwordToggle.setAttribute('aria-pressed', 'true');
  } else {
    passwordInput.type = 'password';
    passwordInput.dataset.userVisible = 'false';
    passwordToggle.setAttribute('aria-pressed', 'false');
  }
});

saltToggle.addEventListener('click', () => {
  if (saltInput.type === 'password') {
    saltInput.type = 'text';
    saltInput.dataset.userVisible = 'true';
    saltToggle.setAttribute('aria-pressed', 'true');
  } else {
    saltInput.type = 'password';
    saltInput.dataset.userVisible = 'false';
    saltToggle.setAttribute('aria-pressed', 'false');
  }
});

generateBtn.addEventListener('click', async () => {
  try {
    const pwd = passwordInput.value;
    const salt = saltInput.value;
    const len = parseInt(lengthInput.value, 10);
    const alphabetKey = alphabetSelect.value;
    const alphabet = Alphabets[alphabetKey] || Alphabets.specialSimple;
    const result = await convertPassword(pwd, salt, len, alphabet);
    output.value = result;
  } catch (err) {
    output.value = '';
    alert('Error: ' + err.message);
  }
});

outputToggle.addEventListener('click', () => {
  if (output.type === 'password') {
    output.type = 'text';
    outputToggle.setAttribute('aria-pressed', 'true');
    outputToggle.title = 'Hide generated';
  } else {
    output.type = 'password';
    outputToggle.setAttribute('aria-pressed', 'false');
    outputToggle.title = 'Show generated';
  }
});

// show tooltip when hovering the selected option in the opened select (best-effort)
alphabetSelect.addEventListener('focus', () => showAlphabetTooltip(alphabetSelect.value));
alphabetSelect.addEventListener('blur', hideAlphabetTooltip);
