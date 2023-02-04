#!/usr/bin/env node
const CLI_VERSION = '1.1.9-typescript';

import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';

const projectInfomations = [
	{
		name: 'projectName',
		message: 'project name:',
		default: path.basename(process.cwd())
	},
	{
		name: 'version',
		message: 'version:',
		default: '1.0.0'
	},
	{
		name: 'description',
		message: 'description:'
	}
];

const program = new Command();

program.name('Serein').version(CLI_VERSION);

program
	.command('init')
	.alias('i')
	.description(
		'Initialise the project in the current directory, using the -y or --yes parameter to use the default configuration.'
	)
	.action((s) => initProject(s.yes));

program.parse(process.argv);

function initProject(option?: boolean): Promise<void> {
	return new Promise((resolve) => {
		if (!option) {
			inquirer.prompt(projectInfomations);
		}
		resolve();
	});
}
