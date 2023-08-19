/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import inquirer from 'inquirer';
import NetWork from '../base/network.js';
import { ALL, DATA, SERVER } from '../base/constants.js';
import DelayHanlderWithInfo from './delayInfo.js';
import { start, done, magenta } from '../base/console.js';

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

class Versions extends DelayHanlderWithInfo {
	constructor() {
		super();
	}

	async update() {
		const { mode } = this.info;

		const msg =
			mode === 'init'
				? 'Select dependencies:'
				: 'Select dependencies which need to swicth(or add):';

		const choices = ALL.map((v) => ({ name: v, value: v }));

		const { deps } = await inquirer.prompt([
			mode === 'init'
				? {
						type: 'checkbox',
						message: msg,
						name: 'deps',
						choices: choices,
						default: [SERVER]
				  }
				: {
						type: 'checkbox',
						message: msg,
						name: 'deps',
						choices: choices
				  }
		]);

		start('Getting version information...');
		this.versions = {};
		for (const packageName of deps) {
			if (DATA.includes(packageName))
				this.versions[packageName] =
					await NetWork.getNpmPackageVersions(packageName, true);
			else
				this.versions[packageName] =
					await NetWork.getNpmPackageVersions(packageName, false);
		}
		done('Getting version information.');

		this.packageVersions = {};
		for (const packageName of deps) {
			if (DATA.includes(packageName))
				this.packageVersions[packageName] = await this.askVersion(
					packageName,
					true
				);
			else
				this.packageVersions[packageName] = await this.askVersion(
					packageName
				);
		}

		this.done();
		return this.packageVersions;
	}

	async askVersion(packageName, isData = false) {
		const versions = this.versions[packageName];

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

	async getPackageVersions() {
		await this.check();

		return this.packageVersions;
	}
}

const VerionsHandler = new Versions();

export default VerionsHandler;
