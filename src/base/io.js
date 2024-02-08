import { done } from './console.js';
import { execSync } from 'child_process';
import stripJsonComments from 'strip-json-comments';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

const IO = {
	mkdir: (dirs) => {
		for (const x of dirs) {
			if (!existsSync(x)) {
				mkdirSync(x);
				done('Create ' + x);
			}
		}
	},

	exists: (filename) => existsSync(filename),

	writeText: (filename, text) => {
		writeFileSync(filename, text);
		done('Create ' + filename);
	},

	writeJSON: (filename, obj) => {
		writeFileSync(filename, JSON.stringify(obj, null, '\t'));
		done('Create ' + filename);
	},

	readJSON: (filename) => {
		return JSON.parse(stripJsonComments(readFileSync(filename, 'utf-8')));
	},

	exec: (command, withLog = true) => {
		if (withLog) execSync(command, { stdio: [0, 1, 2] });
		else execSync(command, { stdio: 'ignore' });
	}
};

export default IO;
