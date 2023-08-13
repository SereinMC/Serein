import { exec } from '../base/io.js';
import { program } from 'commander';
import { CLI_VERSION } from '../base/constants.js';
import initProject from './init.js';
import switchVersion from './switch.js';

program
	.name('serein')
	.description('A Minecraft: Bedrock Edition creation manage tool.')
	.version(CLI_VERSION);

program
	.command('init')
	.alias('i')
	.description('init a project')
	.option('-y --yes', 'use default config without asking any questions')
	.action((option) => initProject(option.yes));

program
	.command('switch')
	.alias('s')
	.description('switch requirements version')
	.option('-y --yes', 'switch to latest version directly')
	.action((option) => switchVersion(option.yes));

program
	.command('build')
	.alias('b')
	.description('build scripts for production environment')
	.action(() => exec('gulp build'));

program
	.command('deploy')
	.alias('d')
	.description('deploy project to game')
	.action(() => exec('gulp'));

program
	.command('pack')
	.alias('p')
	.description('build the .mcpack for the current project')
	.action(() => exec('gulp bundle'));

program
	.command('watch')
	.alias('w')
	.description('listen for file changes and deploy project automatically')
	.action(() => exec('gulp watch'));

export default program;
