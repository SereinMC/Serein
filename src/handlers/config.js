import DelayHanlder from './delay.js';
import { writeJSON } from '../base/io.js';
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
			this.updated = true;
		}
	}

	async init() {
		this.check();
		const { language, res, name, behPath, resPath } =
			await InfoHandler.getInfo();

		this.context = {
			type: language,
			res,
			name,
			behPath,
			resPath,
			mc_preview: false,
			output: 'build',
			mc_dir: null
		};

		this.updated = true;
	}

	async write() {
		await this.check();
		writeJSON('.serein.json', this.context);
	}

	async getConfig() {
		await this.check();
		return this.context;
	}
}

const ConfigRender = new ConfigClass();

export default ConfigRender;
