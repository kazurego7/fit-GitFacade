import * as path from 'path';
import { run } from './suite';

// import { runTests } from 'vscode-test';

async function main() {
	try {
		await run();
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
