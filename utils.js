const readlineSync = require('readline-sync');
const request = require('request');
const chalk = require('chalk');
const fs = require('fs');
const cp = require('node:child_process');

const error = chalk.bold.red;
const gary = chalk.bold.whiteBright;
const magenta = chalk.bold.magenta;
const warning = chalk.hex('#FFA500');
const accept = chalk.bold.green;
const done = accept('[done]');

async function getJSON(url) {
	const str = await req(url);
	return JSON.parse(str);
}

function req(options) {
	return new Promise((resolve, reject) => {
		request(
			{
				url: options,
				method: 'GET',
				encoding: null
			},
			(err, res, body) => {
				if (err) reject(err);
				else resolve(body);
			}
		);
	});
}

function mkdir(dirs) {
	return new Promise((resolve) => {
		for (let x of dirs) {
			if (!fs.existsSync(x)) {
				fs.mkdirSync(x);
				console.log(x, done);
			}
		}
		resolve();
	});
}

function writeText(filename, text) {
	fs.writeFileSync(filename, text);
	console.log(filename, done);
}

function writeJSON(filename, obj) {
	fs.writeFileSync(filename, JSON.stringify(obj, null, '\t'));
	console.log(filename, done);
}

function exec(command) {
	cp.execSync(command, { stdio: [0, 1, 2] });
}

function askBase(str, defualtOption, options) {
	const result = readlineSync
		.question(
			`${str} ${options
				.map((x) => gary(x[0].toUpperCase()) + x.slice(1))
				.join('/')} (${warning(defualtOption)}) `
		)
		.toLowerCase();
	for (const x of options) if (result === x[0] || result === x) return x;
	return defualtOption;
}

function askYes(str, filp = true) {
	const answer = askBase(str, filp ? 'no' : 'yes', ['yes', 'no']);
	if (filp === true) return answer === 'yes' ? 'yes' : 'no';
	else return answer === 'no' ? 'yes' : 'no';
}

function askVersion(packageName) {
	const askQuestions = () => ({
		mode: 'manual',
		manifestVersion: readlineSync.question(
			`${magenta(packageName)} version in manifest: `
		),
		npmVersion: readlineSync.question(
			`${magenta(packageName)} version in npm: `
		)
	});

	return askBase(
		`Choose dependencies version for ${magenta(packageName)}:`,
		'manual',
		['manual', 'latest']
	) === 'manual'
		? askQuestions()
		: { mode: 'latest' };
}

function askRequire(packagename) {
	const need = askYes(`Require ${magenta(packagename)}? `) === 'yes';
	let version = { mode: 'latest' };
	if (need) version = askVersion(packagename);

	return [need, version];
}

module.exports = {
	error,
	gary,
	magenta,
	warning,
	accept,
	done,
	getJSON,
	req,
	mkdir,
	writeJSON,
	writeText,
	exec,
	askBase,
	askRequire,
	askVersion,
	askYes
};
