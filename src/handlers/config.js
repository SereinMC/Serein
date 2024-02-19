import IO from '../base/io.js';
import DelayHandler from './delay.js';
import InfoHandler from './information.js';
import { existsSync, readFileSync } from 'fs';

class ConfigClass extends DelayHandler {
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
		await this.check();
		const {
			language,
			res,
			name,
			behPath,
			resPath,
			behManifestPath,
			resManifestPath,
			scriptsPath
		} = await InfoHandler.getInfo();

		this.context = {
			language,
			res,
			name,
			behPath,
			resPath,
			scriptsPath,
			behManifestPath,
			resManifestPath,
			mc_preview: false,
			output: 'build',
			mc_dir: null,
			esbuild: {},
			tsconfig: {}
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
