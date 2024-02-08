import IO from '../base/io.js';
import { existsSync } from 'fs';
import { deleteSync } from 'del';
import MirrorHandler from './mirror.js';
import { ALL } from '../base/constants.js';
import DelayHanlderWithInfo from './delayInfo.js';
import { accept, start, done } from '../base/console.js';

function checkPnpm() {
	try {
		IO.exec('pnpm --version', false);
	} catch (e) {
		return false;
	}
	return true;
}

class NpmClass extends DelayHanlderWithInfo {
	constructor() {
		super();
		this.package = {};
		this.mirror = '';
		this.platform = '';
		this.pnpm = false;
	}

	async update() {
		this.pnpm = checkPnpm();
		this.platform = process.platform;
		this.mirror = await MirrorHandler.getFastestMirror();
		if (existsSync('package.json')) {
			this.package = IO.readJSON('package.json');
		}
		this.done();
	}

	async init() {
		const { name, version, description } = this.info;

		this.package = {
			name: name,
			version: version,
			type: 'module',
			description: description,
			devDependencies: {
				del: '7.0.0',
				gulp: '^4.0.2',
				'gulp-esbuild': '^0.11.0',
				'gulp-typescript': '^6.0.0-alpha.1',
				'gulp-zip': '^5.1.0',
				'strip-json-comments': '^5.0.1'
			}
		};
	}

	async addDependencies(deps) {
		await this.check();
		for (const packageName in deps) {
			this.package.devDependencies[packageName] = deps[packageName].npm;
		}
	}

	async resolveDependencies(deps) {
		await this.check();
		for (const packageName in deps) {
			const current = deps[packageName];
			if (current.type === 'del') {
				delete this.package.devDependencies[packageName];
			} else {
				this.package.devDependencies[packageName] = current.npm;
			}
		}
	}

	async tidyDependencies() {
		await this.check();
		if (!this.package.devDependencies) this.package.devDependencies = {};
		if (this.package.dependencies) {
			const packages = [];
			for (const packageName in this.package.dependencies) {
				if (
					ALL.includes(packageName) ||
					[
						'del',
						'gulp',
						'gulp-esbuild',
						'gulp-typescript',
						'gulp-zip',
						'strip-json-comments'
					].includes(packageName)
				) {
					packages.push(packageName);
					this.package.devDependencies[packageName] =
						this.package.dependencies[packageName];
				}
			}
			for (const packageName of packages) {
				delete this.package.dependencies[packageName];
			}
		}
	}

	async toESM() {
		await this.check();
		this.package['type'] = 'module';
	}

	async getDependencies() {
		await this.check();
		return this.package.devDependencies;
	}

	async write() {
		await this.check();
		IO.writeJSON('package.json', this.package);
	}

	async clearModules() {
		await this.check();
		deleteSync('node_modules');
		if (this.pnpm) {
			if (existsSync('pnpm-lock.yaml')) deleteSync('pnpm-lock.yaml');
			if (existsSync('.npmrc')) deleteSync('.npmrc');
		} else deleteSync('package-lock.json');
	}

	async install() {
		await this.check();
		const android_suffix =
			this.platform === 'android' ? '--no-bin-links' : '';
		if (this.pnpm) {
			if (this.platform === 'android')
				IO.writeText('.npmrc', 'node-linker=hoisted');
			console.log(
				accept(
					'Detects that you have pnpm and will automatically enable the pnpm installation dependency.'
				)
			);
			IO.exec(`pnpm install --registry=${this.mirror}`);
		} else
			IO.exec(`npm install --registry=${this.mirror} ${android_suffix}`);
	}

	async add(packageName) {
		await this.check();
		start(`Install extension "${packageName}"...`);
		if (this.pnpm) {
			if (this.platform === 'android')
				IO.writeText('.npmrc', 'node-linker=hoisted');
			console.log(
				accept(
					'Detects that you have pnpm and will automatically enable the pnpm installation dependency.'
				)
			);
			IO.exec(`pnpm install ${packageName} --registry=${this.mirror}`);
		} else
			IO.exec(
				`npm install ${packageName} --registry=${this.mirror} ${android_suffix}`
			);
		done(`Install extension "${packageName}".`);
	}

	async del(packageName) {
		await this.check();
		start(`Uninstall extension "${packageName}"...`);
		if (this.pnpm) {
			IO.exec(`pnpm remove ${packageName}`);
		} else IO.exec(`npm uninstall ${packageName}`);
		done(`Uninstall extension "${packageName}".`);
	}
}

const NpmHandler = new NpmClass();

export default NpmHandler;
