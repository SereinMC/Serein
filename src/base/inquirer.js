import inquirer from 'inquirer';
import { basename } from 'path';
import { existsSync } from 'fs';
import NetWork from './network.js';
import { DATA } from './constants.js';
import { error, magenta } from './console.js';

async function askText(msg, defaultOption) {
	const { answer } = await inquirer.prompt([
		{
			type: 'input',
			name: 'answer',
			message: msg,
			default: defaultOption
		}
	]);
	return answer;
}

async function askList(str, options) {
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
	return (await askList(str, filp ? ['yes', 'no'] : ['no', 'yes'])) === 'yes';
}

async function askProjectInfo() {
	return inquirer.prompt([
		{
			type: 'input',
			name: 'name',
			message: 'project name:',
			default: basename(process.cwd())
		},
		{
			type: 'input',
			name: 'version',
			message: 'version:',
			default: '1.0.0'
		},
		{
			type: 'input',
			name: 'description',
			message: 'description:',
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

async function askVersion(packageName, isData = false) {
	const versions = await NetWork.getNpmPackageVersions(packageName, isData);
	if (isData) {
		const npm = await promptUser(
			`Select your ${magenta(packageName)} version in manifest`,
			versions
		);

		return {
			npm,
			isData: true
		};
	} else {
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
			npm,
			isData: false
		};
	}
}

async function getDeps(versions, msg) {
	const choices = versions.map((v) => ({ name: v, value: v }));
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
		if (DATA.includes(packageName))
			packageVersions[packageName] = await askVersion(packageName, true);
		else packageVersions[packageName] = await askVersion(packageName);
	}
	return packageVersions;
}

async function askFile(msg,defaultOption) {
	let directory = await askText(msg,defaultOption);

	while (!existsSync(directory)) {
		console.log(error('The directory does not exist, please re-enter it!'));
		directory = await askText(msg,defaultOption);
	}

	return directory;
}

export { askYes, askText, askList, askFile, askProjectInfo, getDeps };
