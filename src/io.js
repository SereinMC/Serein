import { done } from './console.js';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

async function mkdir(dirs) {
	for (const x of dirs) {
		if (!existsSync(x)) {
			mkdirSync(x);
			console.log(x, done);
		}
	}
}

function writeText(filename, text) {
	writeFileSync(filename, text);
	console.log(filename, done);
}

function writeJSON(filename, obj) {
	writeFileSync(filename, JSON.stringify(obj, null, '\t'));
	console.log(filename, done);
}

function exec(command, withLog = true) {
	if (withLog) execSync(command, { stdio: [0, 1, 2] });
	else execSync(command, { stdio: 'ignore' });
}

function checkPnpm() {
	try {
		exec('pnpm --version', false);
	} catch (e) {
		return false;
	}
	return true;
}

function npmInstall(pnpm) {
	const platform = process.platform;
	const android_suffix = platform === 'android' ? ' --no-bin-links' : '';
	if (pnpm) {
		console.log(
			accept(
				'Detects that you have pnpm and will automatically enable the pnpm installation dependency.'
			)
		);
		exec('pnpm install');
	} else exec('npm install' + android_suffix);
}

export { mkdir, writeText, writeJSON, exec, checkPnpm, npmInstall };
