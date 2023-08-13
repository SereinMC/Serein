import NpmHandler from './npm.js';
import NetWork from '../base/network.js';
import { warning } from '../base/console.js';
import { getDeps } from '../base/inquirer.js';
import DelayHanlderWithInfo from './delayInfo.js';
import { ALL, SERVER } from '../base/constants.js';

class ModuleClass extends DelayHanlderWithInfo {
	constructor() {
		super();
		this.packages = {};
	}

	async update() {
		const { mode, auto } = this.info;

		if (mode === 'init') {
			if (auto) {
				this.packages = {
					[SERVER]: await NetWork.getLatestVersion(SERVER)
				};
			} else {
				console.log(
					'Now I will inquire you the dependencies of your project, including the version. Please follow the guide to choose a specific version to download.'
				);
				console.log(
					warning(
						'You should make sure the dependencies are well organized if you want to use dependencies (latest version) besides @mc/server.'
					)
				);
				this.packages = await getDeps(ALL, 'Select dependencies:');
			}
		} else {
			if (auto) {
				this.packages = {
					[SERVER]: await NetWork.getLatestVersion(SERVER)
				};
			} else {
				this.packages = await getDeps(
					Object.keys(await NpmHandler.getDependencies()).filter(
						(v) => ALL.includes(v)
					),
					'Select dependencies which need to swicth:'
				);
			}
		}
        
		this.done();
	}

	async getDependencies() {
		await this.check();
		return this.packages;
	}
}

const ModuleResolver = new ModuleClass();

export default ModuleResolver;
