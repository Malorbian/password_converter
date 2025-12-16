import { convertPassword, ALPHABETS } from './js/converter.js';
import { MaskedInputController } from './js/maskedInputController.js';

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


// ----- Alphabet tooltip handling -----

function buildAlphabetInfoHtml(){
  const list = [
    {key:'base', name:'Base'},
    {key:'specialSimple', name:'Special Characters Simple'},
    {key:'specialAdvanced', name:'Special Characters Advanced'}
  ];
  return list.map(it => `<div class="alphabet-item"><b>${it.name}</b><div class="alphabet-chars">${(ALPHABETS[it.key]||'').replace(/ /g,'·')}</div></div>`).join('');
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