export class MaskedInputController {
  #input;
  #value = '';
  #masked = true;
  #delay;
  #timeout = null;

  constructor(input, delay = 600) {
    if (!(input instanceof HTMLInputElement)) {
      throw new TypeError('input must be an HTMLInputElement');
    }
    if (!Number.isInteger(delay) || delay < 0) {
      throw new TypeError('delay must be a non-negative integer');
    }

    this.#input = input;
    this.#delay = delay;

    this.#bindEvents();
    this.#render();
  }

  /* ---------- Public API ---------- */

  get value() {
    return this.#value;
  }

  set value(val) {
    this.#value = String(val);
    this.#render();
  }

  toggleMask() {
    this.#masked = !this.#masked;
    this.#render();
  }

  show() {
    this.#masked = false;
    this.#render();
  }

  hide() {
    this.#masked = true;
    this.#render();
  }

  /* ---------- Event Binding ---------- */

  #bindEvents() {
    this.#input.addEventListener('beforeinput', this.#onBeforeInput);
    this.#input.addEventListener('input', this.#onInput);
  }

  /* ---------- Event Handlers ---------- */

  #onBeforeInput = e => {
    const start = this.#input.selectionStart;
    const end = this.#input.selectionEnd;

    // DELETE
    if (e.inputType.startsWith('delete')) {
        if (start != end) {
            this.#value =
                this.#value.slice(0, start) +
                this.#value.slice(end);
        } else if (e.inputType === 'deleteContentBackward' && start > 0) {
            this.#value =
                this.#value.slice(0, start - 1) +
                this.#value.slice(end);
        } else if (e.inputType === 'deleteContentForward' && start < this.#value.length) {
            this.#value =
                this.#value.slice(0, start) +
                this.#value.slice(end + 1);
        }
        return;
    }

    // INSERT / PASTE
    if (e.inputType.startsWith('insert')) {
      const text = e.data ?? '';
      this.#value =
        this.#value.slice(0, start) +
        text +
        this.#value.slice(end);
    }
  };

  #onInput = e => {
    const cursor = this.#input.selectionStart;

    // Immer zuerst korrekt rendern
    this.#render();

    // Delayed reveal nur bei getipptem Zeichen
    if (
      this.#masked &&
      e.inputType === 'insertText' &&
      cursor > 0
    ) {
      const i = cursor - 1;

      this.#input.value =
        this.#mask(this.#value.slice(0, i)) +
        this.#value[i] +
        this.#mask(this.#value.slice(i + 1));

      clearTimeout(this.#timeout);
      this.#timeout = setTimeout(() => this.#render(), this.#delay);
    }

    this.#input.setSelectionRange(cursor, cursor);
  };

  /* ---------- Rendering ---------- */

  #render() {
    clearTimeout(this.#timeout);

    this.#input.value = this.#masked
      ? this.#mask(this.#value)
      : this.#value;
  }

  #mask(str) {
    return '•'.repeat(str.length);
  }
}
