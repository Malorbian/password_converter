import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MaskedInputController } from '../src/maskedInputController.js';

class FakeInput {
    constructor() {
        this.value = '';
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this._listeners = {};
    }
    addEventListener(name, fn) {
        (this._listeners[name] ||= []).push(fn);
    }
    removeEventListener(name, fn) {
        const arr = this._listeners[name] || [];
        const i = arr.indexOf(fn);
        if (i >= 0) arr.splice(i, 1);
    }
    dispatchBeforeInput(detail) {
        const e = { inputType: detail.inputType, data: detail.data ?? null };
        (this._listeners['beforeinput'] || []).forEach(fn => fn.call(this, e));
    }
    dispatchInput(detail) {
        const e = { inputType: detail.inputType, data: detail.data ?? null };
        (this._listeners['input'] || []).forEach(fn => fn.call(this, e));
    }
    setSelectionRange(start, end) {
        this.selectionStart = start;
        this.selectionEnd = end;
    }
}

describe('MaskedInputController', () => {
    const input = new FakeInput();

    test('insertText shows revealed char then masks after delay', async () => {
        const ctrl = new MaskedInputController(input, 5);

        // simulate typing 'a'
        input.selectionStart = 0; input.selectionEnd = 0;
        input.dispatchBeforeInput({ inputType: 'insertText', data: 'a' });
        input.dispatchInput({ inputType: 'insertText', data: 'a' });

        // immediately the input should show masked then revealed char
        assert.ok(input.value.includes('a') || input.value.includes('•'), 'input shows temporary state');

        // wait for the controller to re-mask (delay 5ms)
        await new Promise(r => setTimeout(r, 20));
        assert.strictEqual(input.value, '•', 'after delay input is masked');
        assert.strictEqual(ctrl.value, 'a');
    });

    test('deleteContentBackward updates internal value', () => {
        const ctrl = new MaskedInputController(input, 0);
        // set initial value via public API
        ctrl.value = 'ab';
        // simulate backspace at end
        input.selectionStart = 2; input.selectionEnd = 2;
        input.dispatchBeforeInput({ inputType: 'deleteContentBackward' });
        // after beforeinput the controller internal value should be updated
        assert.strictEqual(ctrl.value, 'a');
    });

    test('replace selection on insertText', () => {
        const ctrl = new MaskedInputController(input, 0);
        ctrl.value = 'abcd';
        // select 'bc' (1..3) and replace with 'X'
        input.selectionStart = 1; input.selectionEnd = 3;
        input.dispatchBeforeInput({ inputType: 'insertText', data: 'X' });
        input.dispatchInput({ inputType: 'insertText', data: 'X' });
        assert.strictEqual(ctrl.value, 'aXd');
    });

    test('paste (insertFromPaste) works', () => {
        const ctrl = new MaskedInputController(input, 0);
        input.selectionStart = 0; input.selectionEnd = 0;
        input.dispatchBeforeInput({ inputType: 'insertFromPaste', data: 'PASTE' });
        input.dispatchInput({ inputType: 'insertFromPaste', data: 'PASTE' });
        assert.strictEqual(ctrl.value, 'PASTE');
    });

    test('toggle/show/hide API works', () => {
        const ctrl = new MaskedInputController(input, 0);
        ctrl.value = 'secret';
        // initially masked
        assert.strictEqual(input.value, '••••••');
        ctrl.toggleMask();
        assert.strictEqual(input.value, 'secret');
        ctrl.hide();
        assert.strictEqual(input.value, '••••••');
        ctrl.show();
        assert.strictEqual(input.value, 'secret');
    });

});
