const test = require('node:test');
const assert = require('assert');
const { convertPassword, Alphabets } = require('../src/converter');

test('deterministic output and correct length', async () => {
  const out1 = await convertPassword('correcthorseb', 'example.com', 16, Alphabets.specialSimple);
  const out2 = await convertPassword('correcthorseb', 'example.com', 16, Alphabets.specialSimple);
  assert.strictEqual(out1, out2, 'Outputs must be identical for identical inputs');
  assert.strictEqual(out1.length, 16, 'Output length must match requested length');
});

test('different salts produce different outputs', async () => {
  const a = await convertPassword('correcthorseb', 'site1.example', 12, Alphabets.base);
  const b = await convertPassword('correcthorseb', 'site2.example', 12, Alphabets.base);
  assert.notStrictEqual(a, b, 'Different salts should yield different derived passwords');
});

test('output characters are from the selected alphabet', async () => {
  const alphabet = Alphabets.base;
  const out = await convertPassword('correcthorseb', 'example.com', 24, alphabet);
  for (const ch of out) {
    assert.ok(alphabet.includes(ch), `Character ${ch} is not in the chosen alphabet`);
  }
});

test('invalid length rejects', async () => {
  await assert.rejects(
    () => convertPassword('password123', 'example.com', 1),
    {
      name: 'RangeError'
    }
  );
});

test('invalid characters in password or salt reject', async () => {
  // use a character not present in the allowed alphabets (e.g. emoji)
  await assert.rejects(
    () => convertPassword('pass💥word', 'example.com', 12),
    Error
  );
});
