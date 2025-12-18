export class MaskedInputController {
    #MASK_CHAR = '•';
    #input;
    #value = '';
    #masked = true;
    #delay;
    #timeout = null;

    constructor(input, delay = 500) {
        if (!input || typeof input.addEventListener !== 'function' || typeof input.setSelectionRange !== 'function') {
            throw new TypeError('input must be an input-like element with addEventListener and setSelectionRange');
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
        this.#input.addEventListener('copy', this.#onCopy);
        this.#input.addEventListener('cut', this.#onCut);
    }

    /* ---------- Event Handlers ---------- */

    #onBeforeInput = e => {
        if (e.isComposing) return;

        const start = this.#input.selectionStart;
        const end = this.#input.selectionEnd;

        // DELETE / CUT
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
        if (e.isComposing) return;

        const cursor = this.#input.selectionStart ?? this.#value.length;

        this.#render();

        // Delayed reveal
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

        if (typeof document !== 'undefined' && this.#input === document.activeElement) {
            this.#input.setSelectionRange(cursor, cursor);
        }
    };

    #onCopy = e => {
        return this.#copySelectionToClipboard(e);
    };

    #onCut = e => {
        return this.#copySelectionToClipboard(e);
    };


    /* ---------- Clipboard Handling ---------- */

    #copySelectionToClipboard(e) {
        const selectionStart = this.#input.selectionStart;
        const selectionEnd = this.#input.selectionEnd;

        if (selectionStart === selectionEnd) return false;

        const realText = this.#value.slice(selectionStart, selectionEnd);

        e.preventDefault();
        e.clipboardData.setData('text/plain', realText);
        return true;
    }


    /* ---------- Rendering ---------- */

    #render() {
        clearTimeout(this.#timeout);

        this.#input.value = this.#masked
            ? this.#mask(this.#value)
            : this.#value;
    }

    #mask(str) {
        return this.#MASK_CHAR.repeat(str.length);
    }
}
