import { basename } from 'path';
import DelayHanlder from './delay.js';
import ConfigRender from './config.js';
import { magenta } from '../base/console.js';
import { askProjectInfo, askYes, askList, askText } from '../base/inquirer.js';

class InfoClass extends DelayHanlder {
	constructor() {
		super();
		this.info = {};
	}

	bind(mode) {
		this.info['mode'] = mode;
	}

	async init() {
		if (this.info.mode === 'init') {
			Object.assign(this.info, {
				name: basename(process.cwd()),
				description: '',
				version: '1.0.0',
				versionArray: [1, 0, 0],
				allow_eval: false,
				res: true,
				mode: 'init',
				language: 'js',
				behPath: 'behavior_packs/',
				resPath: 'resource_packs/',
				scriptsPath: 'scripts/',
				entry: 'main.js',
				auto: true
			});
		} else {
			Object.assign(this.info, {
				mode: 'switch',
				auto: true,
				...(await ConfigRender.getConfig())
			});
		}

		this.done();
	}

	async update() {
		if (this.info.mode === 'init') {
			console.log(
				'This utility will walk you through creating a project.'
			);
			console.log('Press ^C at any time to quit.');

			const { name, version, description } = await askProjectInfo();
			const versionArray = version.split('.').map((x) => parseInt(x));
			const res = await askYes(
				`Create ${magenta('resource_packs')}?`,
				true
			);
			const allow_eval = await askYes(
				`Allow ${magenta('eval')} and ${magenta('new Function')}?`
			);
			const language = await askList('Language:', ['ts', 'js']);

			const entry = await askText('Scripts entry(suffixless):', 'main');

			Object.assign(this.info, {
				name,
				version,
				description,
				versionArray,
				res,
				allow_eval,
				language,
				entry,
				auto: false,
				mode: 'init',
				scriptsPath: 'scripts/',
				behPath: 'behavior_packs/',
				resPath: 'resource_packs/'
			});
		} else {
			Object.assign(this.info, {
				mode: 'switch',
				...(await ConfigRender.getConfig())
			});
		}

		this.done();
	}

	async getInfo() {
		await this.check();
		return this.info;
	}
}

const InfoHandler = new InfoClass();

export default InfoHandler;
