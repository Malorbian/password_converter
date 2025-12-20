"use strict";

const crypto = window.crypto;
const subtle = crypto.subtle;
const enc = new TextEncoder();

const DEFAULT_ITERATIONS = 100_000;
const DEFAULT_SALT = 'Pas0Gen1';
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const MIN_SALT_LENGTH = 8;
const MAX_SALT_LENGTH = 32;

/**
 * Character sets for different character classes.
 * @typedef {'lower' | 'upper' | 'numeric' | 'specialCharsSimple' | 'specialCharsAdvanced'} CharClass
 */
export const CHAR_CLASSES = Object.freeze({
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeric: '0123456789',
  specialCharsSimple: '!@#$%*()-_=+.?',
  specialCharsAdvanced: '[]{}<>^&;:,'
});

/**
 * Alphabets composed of different character classes combined as arrays.
 * @typedef {'base' | 'specialSimple' | 'specialAdvanced'} Policies
 */
export const POLICIES = Object.freeze({
  base: {
    alphabet: ['lower', 'upper', 'numeric'],
    require: ['lower', 'upper', 'numeric']
  },
  specialSimple: {
    alphabet: ['lower', 'upper', 'numeric', 'specialCharsSimple'],
    require: ['lower', 'upper', 'numeric', 'specialCharsSimple']
  },
  specialAdvanced: {
    alphabet: ['lower', 'upper', 'numeric', 'specialCharsSimple', 'specialCharsAdvanced'],
    require: ['lower', 'upper', 'numeric', ['specialCharsSimple', 'specialCharsAdvanced']]
  }
});

/**
 * Generates a password from input password + salt using PBKDF2 (sha512).
 * Deterministic: identical inputs -> identical output.
 *
 * @param {string} password - input password (length between 8 and 64)
 * @param {string} salt - salt (length between 8 and 32)
 * @param {number} length - desired length (number of characters) >= 8 and <= 64
 * @param {Policies} outputAlphabet - which alphabet to map to (default: specialSimple)
 * @returns {string}
 */
export async function convertPassword(password, salt, length, outputPolicy = 'specialSimple') {

  length = Number(length);
  isValidInput(password, salt, length);

  const policy = POLICIES[outputPolicy];
  if (!policy) {
    throw new Error(`Invalid output alphabet policy: ${outputPolicy}`);
  }
  const outputAlphabet = policy.alphabet;

  const encCombinedSalt = new Uint8Array([
    ...enc.encode(DEFAULT_SALT),
    ...enc.encode(salt)
  ]);
  const encPassword = enc.encode(password);

  const requiredCharSets = policy.require;

  // Calculate required bytes: at least length * 2 + requiredCharSets.length - 1
  const requiredBytes = (length + requiredCharSets.length) * 2;

  const bytes = await pbkdf2Async(encPassword, encCombinedSalt, DEFAULT_ITERATIONS, requiredBytes);

  let offset = 0;

  // Ensure at least one character from each required class
  let chars = requiredCharSets.map(charSet => {
    if (Array.isArray(charSet)) {
      charSet = charSet.map(name => CHAR_CLASSES[name]).join('');
    } else {
      charSet = CHAR_CLASSES[charSet];
    }
    const byte = bytes[offset++];
    return charSet[byte % charSet.length];
  });

  // Fill the rest of the password length with derived bytes
  const alphabetChars = buildAlphabetString(outputAlphabet);
  while (chars.length < length) {
    const byte = bytes[offset++];
    chars.push(alphabetChars[byte % alphabetChars.length]);
  }

  deterministicShuffle(chars, bytes.slice(offset));

  return chars.join('');
}


// ----- Helper -----

async function pbkdf2Async(encPassword, encSalt, iterations, lengthBytes) {
  const keyMaterial = await subtle.importKey(
    'raw',
    encPassword,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encSalt,
      iterations,
      hash: 'SHA-512'
    },
    keyMaterial,
    lengthBytes * 8 // Bits!
  );

  return new Uint8Array(derivedBits);
}

function deterministicShuffle(array, bytes) {
  let i = array.length;
  let byteIndex = 0;

  while (i > 1) {
    const j = bytes[byteIndex++ % bytes.length] % i;
    i--;
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function buildAlphabetString(alphabetArray) {
  return alphabetArray.map(cls => CHAR_CLASSES[cls]).join('');
}

function isInAlphabet(input, alphabetArray) {
  const alphabetChars = buildAlphabetString(alphabetArray);
  for (const char of input) {
    if (!alphabetChars.includes(char)) {
      return false;
    }
  }
  return true;
}

// Check for correct types and ranges
function isValidInput(password, salt, length) {
  if (typeof password !== 'string' || typeof salt !== 'string') {
    throw new TypeError('password and salt must be strings');
  }

  if (!Number.isInteger(length) || length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    throw new RangeError(`Length must be an integer between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}`);
  }

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new RangeError(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`);
  }

  if (salt.length < MIN_SALT_LENGTH || salt.length > MAX_SALT_LENGTH) {
    throw new RangeError(`Salt must be between ${MIN_SALT_LENGTH} and ${MAX_SALT_LENGTH} characters long`);
  }

  const inputAlphabet = POLICIES['specialAdvanced'].alphabet;

  if (!isInAlphabet(password, inputAlphabet)) {
    throw new RangeError('Password contains invalid characters');
  }

  if (!isInAlphabet(salt, inputAlphabet)) {
    throw new RangeError('Salt contains invalid characters');
  }

  return true;
}


// ----- Exports for testing -----

export const __test__ = {
  deterministicShuffle
};