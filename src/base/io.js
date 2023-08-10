import { done } from './console.js';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

function mkdir(dirs) {
	for (const x of dirs) {
		if (!existsSync(x)) {
			mkdirSync(x);
			done('Create ' + x);
		}
	}
}

function writeText(filename, text) {
	writeFileSync(filename, text);
	done('Create ' + filename);
}

function writeJSON(filename, obj) {
	writeFileSync(filename, JSON.stringify(obj, null, '\t'));
	done('Create ' + filename);
}

function readJSON(filename) {
	return JSON.parse(readFileSync(filename, 'utf-8'));
}

function exec(command, withLog = true) {
	if (withLog) execSync(command, { stdio: [0, 1, 2] });
	else execSync(command, { stdio: 'ignore' });
}

export { mkdir, writeText, writeJSON, readJSON, exec };
