import { convertPassword, POLICIES, CHAR_CLASSES } from './js/converter.js';
import { MaskedInputController } from './js/maskedInputController.js';
import { UserSettingsController } from './js/userSettingsController.js';

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
const rememberSettingsCheckbox = document.getElementById('remember-settings');
const deleteUserPreferencesBtn = document.getElementById('delete-user-settings');

let alphabetHTMLInfo = buildAlphabetInfoHtml();
let userSettingsCtrl;


// ----- User preferences handling -----
userSettingsCtrl = new UserSettingsController(
  [lengthInput, alphabetSelect],
  rememberSettingsCheckbox,
  deleteUserPreferencesBtn
);


// ----- Alphabet tooltip handling -----

function buildAlphabetInfoHtml() {
  const list = [
    { key: 'base', name: 'Base' },
    { key: 'specialSimple', name: 'Special Characters Simple' },
    { key: 'specialAdvanced', name: 'Special Characters Advanced' }
  ];

  const lines = list.map(it => {
    const policy = POLICIES[it.key];
    const chars = (policy?.alphabet || [])
      .map(c => CHAR_CLASSES[c])
      .join('');
    return `<b>${it.name}:</b><br>"${chars.replace(/ /g, '·')}"<br>`;
  });

  return `<div class="alphabet-tooltip">${lines.join('<br>')}</div>`;
}

function openAlphabetInfo() {
  tooltip.innerHTML = alphabetHTMLInfo;
  tooltip.style.display = 'block';
  tooltip.setAttribute('aria-hidden', 'false');
  alphabetInfo.setAttribute('aria-expanded', 'true');
}

function closeAlphabetInfo() {
  tooltip.style.display = 'none';
  tooltip.setAttribute('aria-hidden', 'true');
  alphabetInfo.setAttribute('aria-expanded', 'false');
}
// open/close info on button click
alphabetInfo.addEventListener('click', (e) => {
  console.log('click');
  e.stopPropagation();
  const expanded = alphabetInfo.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeAlphabetInfo();
    console.log('close');
  } else {
    console.log('open');
    openAlphabetInfo();
  }
});
// close info when clicking outside
document.addEventListener('click', (e) => {
  const wrapper = alphabetSelect.closest('.select-with-info');
  if (!wrapper) return;
  if (!wrapper.contains(e.target)) closeAlphabetInfo();
});


// ----- Input fields handling -----

const passwordCtrl = new MaskedInputController(passwordInput, 700);
const saltCtrl = new MaskedInputController(saltInput, 700);

passwordToggle.addEventListener('click', () => {
  passwordCtrl.toggleMask();
});
saltToggle.addEventListener('click', () => {
  saltCtrl.toggleMask();
});


// ----- Output mask toggle -----

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


// ----- Generate output handling -----

generateBtn.addEventListener('click', async () => {
  try {
    const len = parseInt(lengthInput.value, 10);
    const alphabetKey = alphabetSelect.value;
    const result = await convertPassword(passwordCtrl.value, saltCtrl.value, len, alphabetKey);
    output.value = result;
  } catch (err) {
    output.value = '';
    alert('Error: ' + err.message);
  }
});