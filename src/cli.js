#! /usr/bin/env node
'use strict';

// Dynamic import of ESM module

async function loadConverter() {
  const mod = await import('./converter.js');
  return mod;
}

function printUsageAndExit() {
  console.error('Usage: node cli.js <password> <salt> <length> [alphabet]');
  process.exit(2);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length !== 3 && argv.length !== 4) {
    printUsageAndExit();
  }

  const [password, salt, lengthStr, alphabetStr] = argv;
  const length = parseInt(lengthStr, 10);
  if (!Number.isInteger(length)) {
    console.error('Error: length must be an integer');
    process.exit(2);
  }
  // load converter and call with policy name
  (async () => {
    try {
      const mod = await loadConverter();
      const { convertPassword, POLICIES } = mod;
      const policyName = alphabetStr || 'specialSimple';
      if (!POLICIES[policyName]) {
        console.error('Error: invalid alphabet/policy name:', policyName);
        process.exit(2);
      }

      const out = await convertPassword(password, salt, length, policyName);
      console.log(out);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  })();
}
