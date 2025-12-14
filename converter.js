'use strict';

const { subtle } = require('crypto').webcrypto;

const DEFAULT_ITERATIONS = 100_000;
const ALPHABET_BASE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ALPHABET_SPECIAL_SIMPLE = ALPHABET_BASE + '!@#$%*()-_=+.?';
const ALPHABET_SPECIAL_ADVANCED = ALPHABET_SPECIAL_SIMPLE + '[]{}<>^&;:,';
const DEFAULT_SALT = 'Pas0Gen1';
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const MIN_SALT_LENGTH = 8;
const MAX_SALT_LENGTH = 32;

/**
 * @typedef {'base' | 'specialSimple' | 'specialAdvanced'} AlphabetType
 */
const Alphabets = Object.freeze({
  base: ALPHABET_BASE,
  specialSimple: ALPHABET_SPECIAL_SIMPLE,
  specialAdvanced: ALPHABET_SPECIAL_ADVANCED
});

/**
 * Generates a password from input password + salt using PBKDF2 (sha512).
 * Deterministic: identical inputs -> identical output.
 *
 * @param {string} password - input password (length between 8 and 64)
 * @param {string} salt - salt (length between 8 and 32)
 * @param {number} length - desired length (number of characters) >= 8 and <= 64
 * @param {AlphabetType} alphabet - which alphabet to map to (default: specialSimple)
 * @returns {string}
 */
async function convertPassword(password, salt, length, alphabet = Alphabets.specialSimple) {
  
  length = Number(length) || 0;
  isValidInput(password, salt, length, Alphabets.specialAdvanced);

  const combinedSalt = DEFAULT_SALT + salt;

  const bytes = await pbkdf2Async(password, combinedSalt, DEFAULT_ITERATIONS, length);
  
  // Create a string from the derived bytes using the specified alphabet
  return mapBytesToAlphabet(bytes, length, alphabet);
}

module.exports = { convertPassword, Alphabets };


// ----- Helper -----

async function pbkdf2Async(password, salt, iterations, lengthBytes) {
  const enc = new TextEncoder();

  // Import password as key material
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations,
      hash: 'SHA-512'
    },
    keyMaterial,
    lengthBytes * 8 // Bits!
  );

  return new Uint8Array(derivedBits);
}

// Checks if all characters are in the provided alphabet.
function isInAlphabet(input, alphabet) {
  for (const char of input) {
    if (!alphabet.includes(char)) {
      return false;
    }
  }
  return true;
}

// Maps derived bytes to characters in the provided alphabet.
function mapBytesToAlphabet(derived, length, alphabet) {
  const chars = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = derived[i];
    chars[i] = alphabet[byte % alphabet.length];
  }
  return chars.join('');
}

// Check for correct types and ranges
function isValidInput(password, salt, length, alphabet) {
  if (typeof password !== 'string' || typeof salt !== 'string') {
    throw new TypeError('password and salt must be strings');
  }

  if (!Number.isInteger(length) || length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    throw new RangeError(`length must be an integer between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}`);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new RangeError(`password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  if (salt.length < MIN_SALT_LENGTH || salt.length > MAX_SALT_LENGTH) {
    throw new RangeError(`salt must be between ${MIN_SALT_LENGTH} and ${MAX_SALT_LENGTH} characters long`);
  }

  if (!Object.values(Alphabets).includes(alphabet)) {
    throw new RangeError(`Invalid alphabet. Import and use one of the Alphabets provided by this module.`);
  }

  if (!isInAlphabet(password, alphabet)) {
    throw new RangeError('password contains invalid characters');
  }

  if (!isInAlphabet(salt, alphabet)) {
    throw new RangeError('salt contains invalid characters');
  }

  return true;
}