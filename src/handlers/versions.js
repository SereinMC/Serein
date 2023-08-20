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

		const choices = this.packageList.map((v) => ({ name: v, value: v }));

		if (mode === 'module') {
			const { deps } = await inquirer.prompt([
				{
					type: 'checkbox',
					message: 'Select dependencies:',
					name: 'deps',
					choices: choices,
					default: this.defaultOption
				}
			]);

			this.packageVersions = {};
			const addList = [],
				delList = [];

			for (const packageName of deps) {
				if (this.defaultOption.includes(packageName)) continue;
				addList.push(packageName);
			}

			for (const packageName of this.defaultOption) {
				if (!deps.includes(packageName)) delList.push(packageName);
			}

			if (addList.length) {
				start('Getting version information...');
				this.versions = {};
				for (const packageName of addList) {
					if (DATA.includes(packageName))
						this.versions[packageName] =
							await NetWork.getNpmPackageVersions(
								packageName,
								true
							);
					else
						this.versions[packageName] =
							await NetWork.getNpmPackageVersions(
								packageName,
								false
							);
				}
				done('Getting version information.');

				for (const packageName of addList) {
					if (DATA.includes(packageName))
						this.packageVersions[packageName] =
							await this.askVersion(packageName, true);
					else
						this.packageVersions[packageName] =
							await this.askVersion(packageName);
					this.packageVersions[packageName]['type'] = 'add';
				}
			}

			for (const packageName of delList) {
				this.packageVersions[packageName] = {
					type: 'del'
				};
			}
		} else {
			const { deps } = await inquirer.prompt([
				{
					type: 'checkbox',
					message: 'Select dependencies:',
					name: 'deps',
					choices: choices,
					default: [SERVER]
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
		}

		this.done();
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

	async getPackageVersions(packages, defaultOption = []) {
		this.packageList = packages;
		this.defaultOption = defaultOption;
		await this.check();
		return this.packageVersions;
	}
}

const VerionsHandler = new Versions();

export default VerionsHandler;
