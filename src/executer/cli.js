import IO from '../base/io.js';
import initProject from './init.js';
import { program } from 'commander';
import adaptProject from './adapt.js';
import switchVersion from './switch.js';
import { CLI_VERSION } from '../base/constants.js';

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

export default program;
