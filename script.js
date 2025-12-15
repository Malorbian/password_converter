const { convertPassword, Alphabets } = require('../js/converter.js');

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

// Brief reveal: show last character typed for 700ms
function briefReveal(input) {
  // Clear previous timeout if any
  if (revealTimeouts.has(input)) {
    clearTimeout(revealTimeouts.get(input));
  }
  // If already type='text' (user toggled), do nothing
  if (input.type === 'text') return;

  // Switch to text to briefly reveal then switch back
  input.type = 'text';
  const t = setTimeout(() => {
    input.type = 'password';
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
    passwordToggle.setAttribute('aria-pressed', 'true');
  } else {
    passwordInput.type = 'password';
    passwordToggle.setAttribute('aria-pressed', 'false');
  }
});

saltToggle.addEventListener('click', () => {
  if (saltInput.type === 'password') {
    saltInput.type = 'text';
    saltToggle.setAttribute('aria-pressed', 'true');
  } else {
    saltInput.type = 'password';
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
