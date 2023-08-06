import chalk from 'chalk';
import inquirer from 'inquirer';
import { request } from 'https';
import { basename } from 'path';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
const error = chalk.bold.red;
const gary = chalk.bold.whiteBright;
const magenta = chalk.bold.magenta;
const warning = chalk.hex('#FFA500');
const accept = chalk.bold.green;
const done = accept('[done]');
import {
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR
} from './constants.js';

function req(options) {
	return new Promise((resolve, reject) => {
		const req = request(options, (res) => {
			let body = '';
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				resolve(body);
			});
		});
		req.on('error', (err) => {
			reject(err);
		});
		req.end();
	});
}

async function getJSON(url) {
	const str = await req(url);
	return JSON.parse(str);
}

async function getNpmPackageVersions(packageName) {
	process.stdout.write(
		`Getting the dependencies versions for ${magenta(packageName)}...  `
	);
	const data = await getJSON(`https://registry.npmjs.org/${packageName}`);
	console.log(done);
	const versions = Object.keys(data.versions)
		.map((v) => [...v.split('-'), v])
		.filter((v) => v[0] !== '0.0.1' && !v[1].includes('internal'))
		.map((v) => {
			if (v.length < 3) return [v[0], v[0]];
			const gameVersion = v[1];
			const version = v[v.length - 1];
			if (gameVersion.startsWith('rc')) {
				return [v[0] + '-rc', version];
			} else if (gameVersion.startsWith('beta')) {
				return [v[0] + '-beta', version];
			} else if (gameVersion.startsWith('preview')) {
				return [v[0] + '-rc', version];
			}
		})
		.reduce((acc, [key, value]) => {
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(value);
			return acc;
		}, {});
	return versions;
}

async function getLatestServerVersion() {
	const versions = await getNpmPackageVersions('@minecraft/server');
	const api = Object.keys(versions).sort().reverse()[0];
	const npm = versions[api].sort().reverse()[0];
	return { api, npm };
}

async function mkdir(dirs) {
	for (const x of dirs) {
		if (!existsSync(x)) {
			mkdirSync(x);
			console.log(x, done);
		}
	}
}

function writeText(filename, text) {
	writeFileSync(filename, text);
	console.log(filename, done);
}

function writeJSON(filename, obj) {
	writeFileSync(filename, JSON.stringify(obj, null, '\t'));
	console.log(filename, done);
}

function exec(command, withLog = true) {
	if (withLog) execSync(command, { stdio: [0, 1, 2] });
	else execSync(command, { stdio: 'ignore' });
}

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
	return await inquirer.prompt([
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

function checkPnpm() {
	try {
		exec('pnpm --version', false);
	} catch (e) {
		return false;
	}
	return true;
}

function npmInstall(pnpm) {
	const platform = process.platform;
	const android_suffix = platform === 'android' ? ' --no-bin-links' : '';
	if (pnpm) {
		console.log(
			accept(
				'Detects that you have pnpm and will automatically enable the pnpm installation dependency.'
			)
		);
		exec('pnpm install');
	} else exec('npm install' + android_suffix);
}

export {
	error,
	gary,
	magenta,
	warning,
	accept,
	done,
	getJSON,
	req,
	getLatestServerVersion,
	getDeps,
	mkdir,
	writeJSON,
	writeText,
	exec,
	askProjectInfo,
	askBase,
	askVersion,
	askYes,
	checkPnpm,
	npmInstall
};
