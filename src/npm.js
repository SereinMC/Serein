import { exec } from './io.js';
import { existsSync } from 'fs';
import { deleteSync } from 'del';
import { writeText } from './io.js';
import { accept } from './console.js';
import MirrorHandler from './mirror.js';

function checkPnpm() {
	try {
		exec('pnpm --version', false);
	} catch (e) {
		return false;
	}
	return true;
}

class NpmClass {
	constructor() {
		this.updated = false;
		this.mirror = '';
		this.platform = '';
		this.pnpm = false;
	}

	async check() {
		if (this.updated) return;
		else await this.updateNpm();
	}

	async updateNpm() {
		this.pnpm = checkPnpm();
		this.platform = process.platform;
		this.mirror = await MirrorHandler.getFastestMirror();
		this.updated = true;
	}

	clearModules() {
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
				writeText('.npmrc', 'node-linker=hoisted');
			console.log(
				accept(
					'Detects that you have pnpm and will automatically enable the pnpm installation dependency.'
				)
			);
			exec(`pnpm install --registry=${this.mirror}`);
		} else exec(`npm install --registry=${this.mirror} ${android_suffix}`);
	}
}

const NpmHandler = new NpmClass();

export default NpmHandler;
