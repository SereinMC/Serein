import { request } from 'https';
import { done, start } from './console.js';
import { magenta } from './console.js';
import { Mirrors } from './constants.js';

class MirrorClass {
	constructor(mirror) {
		this.mirrors = mirror;
		this.updated = false;
		this.mirror = 'https://registry.npmjs.org/';
	}

	async check() {
		if (this.updated === true) return;
		else await this.updateMirror();
	}

	async updateMirror() {
		start(`Getting the fastest ${magenta('npm source')}...`);
		const promises = this.mirrors.map((mirror) => {
			const start = Date.now();
			return new Promise((resolve) => {
				const req = request(
					{ hostname: mirror, path: '/', method: 'GET' },
					() => {
						resolve({ mirror, time: Date.now() - start });
					}
				);
				req.on('error', () => {
					resolve({ mirror, time: Infinity });
				});
				req.end();
			});
		});

		const results = await Promise.all(promises);
		results.sort((a, b) => a.time - b.time);
		done(`Get the fastest ${magenta('npm source')}.`);
		this.mirror = results[0].mirror;
		this.updated = true;
	}

	async getFastestMirror() {
		await this.check();
		return this.mirror;
	}
}

const MirrorHandler = new MirrorClass(Mirrors);

export default MirrorHandler;
