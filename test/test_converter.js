import { webcrypto } from 'node:crypto';
globalThis.window = { crypto: webcrypto };

import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
const { convertPassword, POLICIES: ALPHABETS, CHAR_CLASSES, __test__ } = await import('../src/converter.js');

describe('convertPassword', () => {
    const password = 'TestPass123!';
    const password2 = 'AnotherPass456#';
    const salt = 'MySalt123!';
    const salt2 = 'AnotherSalt456@';
    const length = 8;
    const length2 = 64;
    const alphabetKey = 'specialSimple';
    const alphabetKey2 = 'base';
    const saltPassMinLen = 8;
    const passMaxLen = 64;
    const saltMaxLen = 32;

    test('deterministic for same inputs', async () => {
        const a = await convertPassword(password, salt, length, alphabetKey);
        const b = await convertPassword(password, salt, length, alphabetKey);
        assert.strictEqual(a, b);
    });

    test('different salts produce different outputs', async () => {
        const a = await convertPassword(password, salt, length, alphabetKey2);
        const b = await convertPassword(password, salt2, length, alphabetKey2);
        assert.notStrictEqual(a, b);
    });

    test('different passwords produce different outputs', async () => {
        const a = await convertPassword(password, salt, length, alphabetKey2);
        const b = await convertPassword(password2, salt, length, alphabetKey2);
        assert.notStrictEqual(a, b);
    });

    test('output length matches requested length', async () => {
        const out = await convertPassword(password, salt, length2, alphabetKey2);
        assert.strictEqual(out.length, length2);
    });

    test('rejects invalid length values', async () => {
        await assert.rejects(() => convertPassword(password, salt, saltPassMinLen - 1), { name: 'RangeError' });
        await assert.rejects(() => convertPassword(password, salt, passMaxLen + 1), { name: 'RangeError' });
        await assert.rejects(() => convertPassword(password, salt, 'not-a-number'), { name: 'RangeError' });
    });

    test('rejects short password or salt', async () => {
        await assert.rejects(() => convertPassword('a'.repeat(saltPassMinLen - 1), salt, 12), { name: 'RangeError' });
        await assert.rejects(() => convertPassword(password, 'a'.repeat(saltPassMinLen - 1), 12), { name: 'RangeError' });
    });

    test('rejects too long password or salt', async () => {
        await assert.rejects(() => convertPassword('a'.repeat(passMaxLen + 1), salt, 12), { name: 'RangeError' });
        await assert.rejects(() => convertPassword(password, 'a'.repeat(saltMaxLen + 1), 12), { name: 'RangeError' });
    });

    test('rejects non-string password/salt', async () => {
        await assert.rejects(() => convertPassword(null, salt, 12), { name: 'TypeError' });
        await assert.rejects(() => convertPassword(password, 12345, 12), { name: 'TypeError' });
    });

    test('output characters belong to chosen alphabet and include required classes', async () => {
        const out = await convertPassword(password, salt, 48, alphabetKey2);

        // build allowed chars string from ALPHABETS (POLICIES) and CHAR_CLASSES
        const allowed = ALPHABETS[alphabetKey2].alphabet.map(k => CHAR_CLASSES[k]).join('');
        for (const ch of out) {
            assert.ok(allowed.includes(ch), `Character ${ch} not allowed for alphabet ${alphabetKey2}`);
        }

        // ensure at least one char from each required class (supporting grouped requirements)
        for (const req of ALPHABETS[alphabetKey2].require) {
            if (Array.isArray(req)) {
                const group = req.map(k => CHAR_CLASSES[k]).join('');
                assert.ok(out.split('').some(c => group.includes(c)), `Output must include at least one char from one of ${req.join(',')}`);
            } else {
                const chars = CHAR_CLASSES[req];
                assert.ok(out.split('').some(c => chars.includes(c)), `Output must include at least one char from class ${req}`);
            }
        }
    });

    test('changing output alphabet changes allowed characters', async () => {
        const outBase = await convertPassword(password, salt, 48, 'base');
        const outSpecial = await convertPassword(password, salt, 48, 'specialSimple');

        const specials = CHAR_CLASSES.specialCharsSimple;

        assert.ok(![...outBase].some(c => specials.includes(c)),
            'base alphabet must not contain special chars');

        assert.ok([...outSpecial].some(c => specials.includes(c)),
            'specialSimple alphabet must contain special chars');
    });

    test('invalid alphabet name rejects', async () => {
        await assert.rejects(() => convertPassword(password, salt, 12, 'no-such-alphabet'), Error);
    });

    test('deterministic shuffle produces consistent results', async () => {
        const out1 = await convertPassword(password, salt, 32, 'specialAdvanced');
        const out2 = await convertPassword(password, salt, 32, 'specialAdvanced');
        assert.strictEqual(out1, out2);
    });

    test('deterministic shuffle creates same output given same bytes and actually shuffles', async () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        const bytes = new Uint8Array([1, 2, 3, 4, 5]);
        const arrayCopy = [...array];

        __test__.deterministicShuffle(array, bytes);
        __test__.deterministicShuffle(arrayCopy, bytes);

        assert.deepStrictEqual(array, arrayCopy);
        assert.notDeepStrictEqual(array, ['a', 'b', 'c', 'd', 'e']);
    });

});


