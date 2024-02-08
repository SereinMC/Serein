import IO from '../base/io.js';
import initProject from './init.js';
import { program } from 'commander';
import adaptProject from './adapt.js';
import moduleManage from './module.js';
import switchVersion from './switch.js';
import { CLI_VERSION } from '../base/constants.js';
import { install, uninstall } from './ext.js';

program
	.name('serein')
	.description('A Minecraft: Bedrock Edition creation manage tool.')
	.version(CLI_VERSION, '-v --version');

program
	.command('init')
	.alias('i')
	.description('init a project')
	.option('-y --yes', 'use default config without asking any questions')
	.action((option) => initProject(option.yes));

program
	.command('switch')
	.alias('s')
	.description('switch dependencies version')
	.option('-y --yes', 'switch to latest version directly')
	.action((option) => switchVersion(option.yes));

program
	.command('module')
	.alias('m')
	.description('managing current dependencies')
	.option('-y --yes', 'switch to latest version directly')
	.action(() => moduleManage());

program
	.command('adapt')
	.alias('a')
	.description('adapt to projects that already exist')
	.action(() => adaptProject());

program
	.command('build')
	.alias('b')
	.description('build scripts for production environment')
	.action(() => IO.exec('gulp build'));

program
	.command('deploy')
	.alias('d')
	.description('deploy project to game')
	.action(() => IO.exec('gulp'));

program
	.command('pack')
	.alias('p')
	.description('build the .mcpack for the current project')
	.action(() => IO.exec('gulp bundle'));

program
	.command('watch')
	.alias('w')
	.description('listen for file changes and deploy project automatically')
	.action(() => IO.exec('gulp watch'));

program
	.command('install <packageName>')
	.alias('ins')
	.description('install an extension for serein')
	.action((packageName) => install(packageName));

program
	.command('uninstall <packageName>')
	.alias('unins')
	.description('uninstall an extension')
	.action((packageName) => uninstall(packageName));

program
	.command('rescue')
	.alias('r')
	.description('recovering a project with an exception dependency');

export default program;
