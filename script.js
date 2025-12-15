import { convertPassword, Alphabets } from './js/converter.js';

const passwordInput = document.getElementById('password-input');
const passwordToggle = document.getElementById('password-toggle');
const saltInput = document.getElementById('salt-input');
const saltToggle = document.getElementById('salt-toggle');
const lengthInput = document.getElementById('length-input');
const alphabetSelect = document.getElementById('alphabet-select');
const tooltip = document.getElementById('alphabet-tooltip');
const alphabetInfo = document.getElementById('alphabet-info');
const output = document.getElementById('generated-output');
const outputToggle = document.getElementById('output-toggle');
const generateBtn = document.getElementById('generate');

let maskTimeout;
const passwordState = { value: '' };
const saltState = { value: '' };


// ----- Alphabet tooltip handling -----

function buildAlphabetInfoHtml(){
  const list = [
    {key:'base', name:'Base'},
    {key:'specialSimple', name:'Special Characters Simple'},
    {key:'specialAdvanced', name:'Special Characters Advanced'}
  ];
  return list.map(it => `<div class="alphabet-item"><b>${it.name}</b><div class="alphabet-chars">${(Alphabets[it.key]||'').replace(/ /g,'·')}</div></div>`).join('');
}

function openAlphabetInfo(){
  tooltip.innerHTML = buildAlphabetInfoHtml();
  tooltip.style.display = 'block';
  tooltip.setAttribute('aria-hidden','false');
  alphabetInfo.setAttribute('aria-expanded','true');
}

function closeAlphabetInfo(){
  tooltip.style.display = 'none';
  tooltip.setAttribute('aria-hidden','true');
  alphabetInfo.setAttribute('aria-expanded','false');
}
// open/close info on button click
alphabetInfo.addEventListener('click', (e)=>{
  e.stopPropagation();
  const expanded = alphabetInfo.getAttribute('aria-expanded') === 'true';
  if (expanded) closeAlphabetInfo(); else openAlphabetInfo();
});
// close info when clicking outside
document.addEventListener('click', (e)=>{
  const wrapper = alphabetSelect.closest('.select-with-info');
  if (!wrapper) return;
  if (!wrapper.contains(e.target)) closeAlphabetInfo();
});


// ----- Input/Output mask toggle -----

toggleTextMaskListener(passwordInput, passwordState, passwordToggle);
toggleTextMaskListener(saltInput, saltState, saltToggle);

function toggleTextMaskListener(inputField, storedValue, toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const visible = toggleBtn.getAttribute('aria-pressed') === 'true';

    if (visible) {
      inputField.value = createMaskedString(storedValue.value.length);
      toggleBtn.setAttribute('aria-pressed', 'false');
      inputField.title = 'Show';
    } else {
      inputField.value = storedValue.value;
      toggleBtn.setAttribute('aria-pressed', 'true');
      inputField.title = 'Hide';
    }
  });
}

togglePasswordVisibilityListener(outputToggle, output);

function togglePasswordVisibilityListener(toggleBtn, outputField) {
  toggleBtn.addEventListener('click', () => {
    if (toggleBtn.getAttribute('aria-pressed') === 'false') {
      outputField.type = 'text';
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.title = 'Hide';
    } else {
      outputField.type = 'password';
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.title = 'Show';
    }
  });
}


// ----- Mask delay for masked input fields -----

passwordMaskDelayListener(passwordInput, passwordState);
passwordMaskDelayListener(saltInput, saltState);

/**
 * Makes a text field behave like a password field with delayed masking. Actual input values are stored separately.
 * @param {HTMLInputElement} inputField - input element 
 * @param {Object} storedValue - external object with correct stored value of input 
 * @param {number} duration - duration until masking in ms
 */
function passwordMaskDelayListener(inputField, storedValue, duration = 500) {
  inputField.addEventListener('input', () => {
    const newChar = inputField.value.slice(-1);
    storedValue.value += newChar;

    inputField.value = createMaskedString(storedValue.value.length - 1) + newChar;

    if (maskTimeout) clearTimeout(maskTimeout);

    maskTimeout = setTimeout(() => {
      inputField.value = createMaskedString(storedValue.value.length);
    }, duration);
  });

  // Correct stored value for backspaces and mask immediately on keydown
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      storedValue.value = storedValue.value.slice(0, -1);
    } else {
      clearTimeout(maskTimeout);
      inputField.value = createMaskedString(storedValue.value.length);
    }
});
}


// ----- Generate output handling -----

generateBtn.addEventListener('click', async () => {
  try {
    const len = parseInt(lengthInput.value, 10);
    const alphabetKey = alphabetSelect.value;
    const alphabet = Alphabets[alphabetKey] || Alphabets.specialSimple;
    const result = await convertPassword(passwordState.value, saltState.value, len, alphabet);
    output.value = result;
  } catch (err) {
    output.value = '';
    alert('Error: ' + err.message);
  }
});


// ----- Helper -----

// Creates a chain of dots as masked string of given length.
function createMaskedString(iterations) {
  return '•'.repeat(iterations);
}