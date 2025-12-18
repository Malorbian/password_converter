"use strict";

const crypto = window.crypto;
const subtle = crypto.subtle;

const DEFAULT_ITERATIONS = 100_000;
const DEFAULT_SALT = 'Pas0Gen1';
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;
const MIN_SALT_LENGTH = 8;
const MAX_SALT_LENGTH = 32;

/**
 * Character sets for different character classes.
 * @typedef {'lower' | 'upper' | 'numeric' | 'specialSimple' | 'specialAdvanced'} CharClass
 */
export const CHAR_CLASSES = Object.freeze({
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numeric: '0123456789',
  specialSimple: '!@#$%*()-_=+.?',
  specialAdvanced: '[]{}<>^&;:,'
});

/**
 * Alphabets composed of different character classes combined as arrays.
 * @typedef {'base' | 'specialSimple' | 'specialAdvanced'} AlphabetType
 */
export const ALPHABETS = Object.freeze({
  base: ['lower', 'upper', 'numeric'],
  specialSimple: ['lower', 'upper', 'numeric', 'specialSimple'],
  specialAdvanced: ['lower', 'upper', 'numeric', 'specialSimple', 'specialAdvanced']
});

/**
 * Generates a password from input password + salt using PBKDF2 (sha512).
 * Deterministic: identical inputs -> identical output.
 *
 * @param {string} password - input password (length between 8 and 64)
 * @param {string} salt - salt (length between 8 and 32)
 * @param {number} length - desired length (number of characters) >= 8 and <= 64
 * @param {AlphabetType} outputAlphabet - which alphabet to map to (default: specialSimple)
 * @returns {string}
 */
export async function convertPassword(password, salt, length, outputAlphabet = 'specialSimple') {

  length = Number(length) || 0;
  isValidInput(password, salt, length);

  const enc = new TextEncoder();
  const combinedSalt = new Uint8Array([
    ...enc.encode(DEFAULT_SALT),
    ...enc.encode(salt)
  ]);
  const encPassword = enc.encode(password);

  const requiredCharClasses = getRequiredCharClasses(outputAlphabet);

  // Calculate required bytes: at least length * 2 + requiredCharClasses.length - 1
  const requiredBytes = (length + requiredCharClasses.length) * 2;

  const bytes = await pbkdf2Async(encPassword, combinedSalt, DEFAULT_ITERATIONS, requiredBytes);

  let offset = 0;

  // Ensure at least one character from each required class
  let chars = Object.values(requiredCharClasses).map(charSet => {
    const byte = bytes[offset++];
    return charSet[byte % charSet.length];
  });

  // Fill the rest of the password length with derived bytes
  const alphabetChars = buildAlphabetString(outputAlphabet);
  while (chars.length < length) {
    const byte = bytes[offset++];
    chars.push(alphabetChars[byte % alphabetChars.length]);
  }

  // Shuffle the result to avoid predictable positions
  deterministicShuffle(chars, bytes.slice(offset));

  // Create a string from the derived bytes using the specified alphabet
  return chars.join('');
}


// ----- Helper -----

async function pbkdf2Async(encPassword, salt, iterations, lengthBytes) {
  const enc = new TextEncoder();

  // Import password as key material
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
      salt: enc.encode(salt),
      iterations,
      hash: 'SHA-512'
    },
    keyMaterial,
    lengthBytes * 8 // Bits!
  );

  return new Uint8Array(derivedBits);
}

function deterministicShuffle(array, bytes) {
  let i;
  let byteIndex = 0;

  while (i > 1) {
    const j = bytes[byteIndex++ % bytes.length] % i;
    i--;
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function buildAlphabetString(alphabetName) {
  const charSets = ALPHABETS[alphabetName];
  if (!charSets) {
    throw new Error(`Invalid alphabet name: ${alphabetName}`);
  }

  const completeAlphabetString = charSets
    .map(name => {
      const chars = CHAR_CLASSES[name];
      if (!chars) {
        throw new Error(`Invalid character class name: ${name}`);
      }
      return chars;
    })
    .join('');

  return completeAlphabetString;
}

function getRequiredCharClasses(alphabetName) {
  const classNames = ALPHABETS[alphabetName];
  if (!classNames) {
    throw new Error(`Invalid alphabet name: ${alphabetName}`);
  }
  return classNames.map(name => CHAR_CLASSES[name]);
}

function isInAlphabet(input, alphabet) {
  const alphabetChars = buildAlphabetString(alphabet);
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

  if (!isInAlphabet(password, 'specialAdvanced')) {
    throw new RangeError('Password contains invalid characters');
  }

  if (!isInAlphabet(salt, 'specialAdvanced')) {
    throw new RangeError('Salt contains invalid characters');
  }

  return true;
}