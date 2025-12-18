import { webcrypto } from 'node:crypto';
globalThis.window = { crypto: webcrypto };

import {test, describe} from 'node:test';
import { rejects, expect, toBe } from 'node:assert';
const { convertPassword, ALPHABETS, CHAR_CLASSES } = await import('../src/converter.js');

describe('convertPassword', () => {
    const password = 'TestPass123!';
    const salt = 'MySalt123!';
    const length = 16;

    test('generates deterministic password for same input', async () => {
        const pwd1 = await convertPassword(password, salt, length, 'specialSimple');
        const pwd2 = await convertPassword(password, salt, length, 'specialSimple');
        expect(pwd1).toBe(pwd2);
    });

    test('different salts produce different passwords', async () => {
        const pwd1 = await convertPassword(password, 'salt1', length);
        const pwd2 = await convertPassword(password, 'salt2', length);
        expect(pwd1).not.toBe(pwd2);
    });

    test('output respects alphabet selection', async () => {
        const pwd = await convertPassword(password, salt, length, 'base');
        const alphabetChars = ALPHABETS.base.map(c => CHAR_CLASSES[c]).join('');
        for (const char of pwd) {
            expect(alphabetChars).toContain(char);
        }
    });

    test('includes at least one character from each required class', async () => {
        const pwd = await convertPassword(password, salt, length, 'specialAdvanced');
        const requiredClasses = ALPHABETS.specialAdvanced.map(c => CHAR_CLASSES[c]);
        requiredClasses.forEach(cls => {
            const hasChar = cls.split('').some(ch => pwd.includes(ch));
            expect(hasChar).toBe(true);
        });
    });

    test('throws error for too short password', async () => {
        await expect(convertPassword('short', salt, length))
            .rejects
            .toThrow('Password must be at least');
    });

    test('throws error for too short salt', async () => {
        await expect(convertPassword(password, '123', length))
            .rejects
            .toThrow('Salt must be between');
    });

    test('throws error for invalid output alphabet', async () => {
        await expect(convertPassword(password, salt, length, 'invalidAlphabet'))
            .rejects
            .toThrow('Invalid alphabet name');
    });

    test('generates correct length', async () => {
        const len = 32;
        const pwd = await convertPassword(password, salt, len, 'specialSimple');
        expect(pwd.length).toBe(len);
    });

    test('handles minimum length edge case', async () => {
        const pwd = await convertPassword(password, salt, 8, 'base');
        expect(pwd.length).toBe(8);
    });

    test('handles maximum length edge case', async () => {
        const pwd = await convertPassword(password, salt, 64, 'specialAdvanced');
        expect(pwd.length).toBe(64);
    });

    test('invalid characters in password or salt reject', async () => {
        // use a character not present in the allowed alphabets (e.g. emoji)
        await rejects(
            () => convertPassword('pass💥word', 'example.com', 12),
            Error
        );
    });
});


