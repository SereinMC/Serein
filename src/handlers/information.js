/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import DelayClass from './delay.js';
import { basename, join } from 'path';
import ConfigRender from './config.js';
import { magenta } from '../base/console.js';
import {
	askYes,
	askList,
	askText,
	askFile,
	askProjectInfo
} from '../base/inquirer.js';

class InfoClass extends DelayClass {
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
				behManifestPath: 'behavior_packs/manifest.json',
				resManifestPath: 'resource_packs/manifest.json',
				scriptsPath: 'scripts/',
				entry: 'main',
				auto: true
			});
		} else if (this.info.mode === 'switch') {
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
				resPath: 'resource_packs/',
				behManifestPath: 'behavior_packs/manifest.json',
				resManifestPath: 'resource_packs/manifest.json'
			});
		} else if (
			this.info.mode === 'switch' ||
			this.info.mode === 'module' ||
			this.info.mode === 'ext' ||
			this.info.mode === 'rescue'
		) {
			Object.assign(this.info, {
				mode: this.info.mode,
				...(await ConfigRender.getConfig())
			});
		} else if (this.info.mode === 'adapt') {
			console.log(
				'This process will guide you through importing your project into serein.'
			);
			console.log('Press ^C at any time to quit.');

			const behPath = await askFile(
				'Behavior pack path:',
				'behavior_packs'
			);

			const behManifestPath = await askFile(
				'Path to manifest.json in the behavior pack:',
				join(behPath, 'manifest.json')
			);

			const res = await askYes('Does your project have a resource pack?');

			const resPath = res
				? await askFile('Resource pack path:', 'resource_packs')
				: 'resource_pack';

			const resManifestPath = res
				? await askFile(
						'Path to manifest.json in the resource pack:',
						join(resPath, 'manifest.json')
				  )
				: 'resource_pack';

			const scriptsPath = await askFile(
				'The directory where the script is stored:',
				join(behPath, 'scripts')
			);

			const language = await askList(
				'The language in which you wrote the project:',
				['ts', 'js']
			);

			Object.assign(this.info, {
				res,
				behPath,
				resPath,
				language,
				scriptsPath,
				behManifestPath,
				resManifestPath,
				mode: 'adapt'
			});
		}

		this.done();
	}

	async merge(key, value) {
		await this.check();

		this.info[key] = value;
	}

	async getInfo() {
		await this.check();
		return this.info;
	}
}

const InfoHandler = new InfoClass();

export default InfoHandler;
