import IO from '../base/io.js';
import { existsSync } from 'fs';
import { v4 as uuid } from 'uuid';
import InfoHandler from './information.js';
import DelayHanlderWithInfo from './delayInfo.js';

class ManifestClass extends DelayHanlderWithInfo {
	constructor() {
		super();
		this.behContext = {};
		this.resContext = {};
	}

	async update() {
		const { mode, behManifestPath, resManifestPath, res } = this.info;

		if (existsSync(behManifestPath)) {
			this.behContext = IO.readJSON(behManifestPath);
			if (mode === 'adapt') {
				await InfoHandler.Merge('name', this.behContext.header.name);
			}
			this.done();
		}

		if (res && existsSync(resManifestPath)) {
			this.resContext = IO.readJSON(resManifestPath);
		}
	}

	async init() {
		await this.check();

		const { name, description, versionArray, allow_eval, res, entry } =
			this.info;

		const resUUID = uuid();

		this.behContext = {
			format_version: 2,
			header: {
				name: name,
				description: description,
				uuid: uuid(),
				version: versionArray,
				min_engine_version: [1, 19, 20]
			},
			modules: [
				{
					description: 'Script Resources',
					language: 'javascript',
					type: 'script',
					uuid: uuid(),
					version: [2, 0, 0],
					entry: 'scripts/' + entry + '.js'
				}
			],
			dependencies: [],
			capabilities: allow_eval ? ['script_eval'] : []
		};

		if (res) {
			this.resContext = {
				format_version: 2,
				header: {
					name: name,
					description: description,
					uuid: resUUID,
					version: versionArray,
					min_engine_version: [1, 19, 20]
				},
				modules: [
					{
						description: description,
						type: 'resources',
						uuid: uuid(),
						version: versionArray
					}
				]
			};

			this.behContext.dependencies.push({
				uuid: resUUID,
				version: versionArray
			});
		}

		this.done();
	}

	async getDependencies() {
		await this.check();
		return this.behContext.dependencies
			.filter((v) => v.module_name)
			.map((v) => v.module_name);
	}

	async resolveDependencies(deps) {
		await this.check();
		const nowDeps = await this.getDependencies();
		for (const packageName in deps) {
			const current = deps[packageName];
			if (current.isData) continue;
			if (nowDeps.includes(packageName)) {
				for (const idx in this.behContext.dependencies) {
					if (!this.behContext.dependencies[idx].module_name)
						continue;
					if (
						this.behContext.dependencies[idx].module_name ===
						packageName
					) {
						this.behContext.dependencies[idx].version = current.api;
					}
				}
			} else {
				this.behContext.dependencies.push({
					module_name: packageName,
					version: current.api
				});
			}
		}
	}

	async write() {
		await this.check();
		const { behManifestPath, resManifestPath, res } = this.info;

		IO.writeJSON(behManifestPath, this.behContext);
		if (res) IO.writeJSON(resManifestPath, this.resContext);
	}
}

const ManifestHandler = new ManifestClass();

export default ManifestHandler;
