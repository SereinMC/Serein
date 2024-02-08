#!/usr/bin/env node

import program from './src/executer/cli.js';
import rescue from './src/executer/rescue.js';
import ExtensionHandler from './src/handlers/extension.js';

if (['rescue', 'r'].includes(process.argv[2])) await rescue();
else {
	ExtensionHandler.init();
	ExtensionHandler.load(process);
	program.parse(process.argv);
}
