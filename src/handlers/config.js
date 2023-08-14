import IO from '../base/io.js';
import DelayHanlder from './delay.js';
import InfoHandler from './information.js';
import { existsSync, readFileSync } from 'fs';

class ConfigClass extends DelayHanlder {
	constructor() {
		super();
		this.context = {};
	}

	async update() {
		if (existsSync('.serein.json')) {
			this.context = JSON.parse(readFileSync('.serein.json', 'utf-8'));
			this.done();
		}
	}

	async init() {
		this.check();
		const { language, res, name, behPath, resPath, entry, scriptsPath } =
			await InfoHandler.getInfo();

		this.context = {
			language,
			res,
			name,
			behPath,
			resPath,
			entry,
			scriptsPath,
			mc_preview: false,
			output: 'build',
			mc_dir: null
		};

		this.done();
	}

	async write() {
		await this.check();
		IO.writeJSON('.serein.json', this.context);
	}

	async getConfig() {
		await this.check();
		return this.context;
	}
}

const ConfigRender = new ConfigClass();

export default ConfigRender;
