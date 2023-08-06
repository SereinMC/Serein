import inquirer from 'inquirer';
import { basename } from 'path';
import { magenta, warning } from './console.js';
import {
	req,
	getJSON,
	getNpmPackageVersions,
	getLatestServerVersion
} from './net.js';
import {
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR
} from './constants.js';

async function askBase(str, options) {
	const { answer } = await inquirer.prompt([
		{
			type: 'list',
			name: 'answer',
			message: str,
			choices: options
		}
	]);
	return answer;
}

async function askYes(str, filp = false) {
	return (await askBase(str, filp ? ['yes', 'no'] : ['no', 'yes'])) === 'yes';
}

async function askProjectInfo() {
	return inquirer.prompt([
		{
			type: 'input',
			name: 'name',
			message: `project name: (${warning(basename(process.cwd()))}) `,
			default: basename(process.cwd())
		},
		{
			type: 'input',
			name: 'version',
			message: `version: ${warning('(1.0.0)')} `,
			default: '1.0.0'
		},
		{
			type: 'input',
			name: 'description',
			message: 'description: ',
			default: ''
		}
	]);
}

async function promptUser(message, choices) {
	const { selected } = await inquirer.prompt([
		{
			type: 'list',
			name: 'selected',
			message: message,
			choices: choices.map((choice) => ({ name: choice }))
		}
	]);
	return selected;
}

async function askVersion(packageName) {
	const versions = await getNpmPackageVersions(packageName);
	const keys = Object.keys(versions).sort().reverse();

	const api = await promptUser(
		`Select your ${magenta(packageName)} version in manifest`,
		keys
	);
	const npm = await promptUser(
		`Select your ${magenta(packageName)} version in npm`,
		versions[api].sort().reverse()
	);

	return {
		api,
		npm
	};
}

async function getDeps(versions, msg) {
	const choices = [
		{ name: SERVER, value: SERVER },
		{ name: SERVER_UI, value: SERVER_UI },
		{ name: SERVER_ADMIN, value: SERVER_ADMIN },
		{ name: SERVER_GAMETEST, value: SERVER_GAMETEST },
		{ name: SERVER_NET, value: SERVER_NET },
		{ name: SERVER_EDITOR, value: SERVER_EDITOR }
	].filter((v) => versions.includes(v.name));
	const { deps } = await inquirer.prompt([
		{
			type: 'checkbox',
			message: msg,
			name: 'deps',
			choices: choices
		}
	]);
	const packageVersions = {};
	for (const packageName of deps) {
		packageVersions[packageName] = await askVersion(packageName);
	}
	return packageVersions;
}

export {
	getDeps,
	askProjectInfo,
	askBase,
	askVersion,
	askYes
};
