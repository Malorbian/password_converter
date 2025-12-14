'use strict';

const { convertPassword, Alphabets } = require('./converter');

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

  const alphabet = Alphabets[alphabetStr] || Alphabets.specialSimple;

  // convertPassword is async; handle the returned Promise
  convertPassword(password, salt, length, alphabet)
    .then(out => {
      console.log(out);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
