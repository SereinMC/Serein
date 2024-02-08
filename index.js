#!/usr/bin/env node

import program from './src/executer/cli.js';
import rescue from './src/executer/rescue.js';
import ExtensionHandler from './src/handlers/extension.js';

if (['rescue', 'r'].includes(process.argv[2])) await rescue();
else {
	await ExtensionHandler.init();
	await ExtensionHandler.load(program);
	program.parse(process.argv);
}
