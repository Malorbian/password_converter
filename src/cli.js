#! /usr/bin/env node
'use strict';

import { webcrypto } from 'node:crypto';
globalThis.window = { crypto: webcrypto };

const { convertPassword, POLICIES: ALPHABETS} = await import('../src/converter.js');

function printUsageAndExit() {
	console.error('Usage: node src/cli.js <password> <salt> <length> [policy]');
	console.error('Available policies:', Object.keys(ALPHABETS).join(', '));
	process.exit(2);
}

async function main() {
	const argv = process.argv.slice(2);
	if (argv.length !== 3 && argv.length !== 4) {
		printUsageAndExit();
	}

	const [password, salt, lengthStr, policyName = 'specialSimple'] = argv;
	const length = Number.parseInt(lengthStr, 10);
	if (!Number.isInteger(length)) {
		console.error('Error: <length> must be an integer');
		process.exit(2);
	}

	if (!ALPHABETS[policyName]) {
		console.error('Error: unknown policy', policyName);
		printUsageAndExit();
	}

	try {
		const out = await convertPassword(password, salt, length, policyName);
		console.log(out);
	} catch (err) {
		console.error('Error:', err.message ?? err);
		process.exit(1);
	}
}

if (process.argv[1] && process.argv[1].endsWith('cli.js')) {
	main();
}

