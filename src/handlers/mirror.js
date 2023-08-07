import { first } from '../base/utils.js';
import { request } from 'https';
import { HanlderPromise } from './base.js';
import { Mirrors } from '../base/constants.js';
import { magenta, done, start } from '../base/console.js';

class MirrorClass extends HanlderPromise {
	constructor(mirror) {
		super();
		this.mirrors = mirror;
		this.mirror = 'https://registry.npmjs.org/';
	}

	async update() {
		start(`Getting the fastest ${magenta('npm source')}...`);
		function timeout(ms) {
			return new Promise((reject) => {
				setTimeout(() => {
					reject(new Error('Promise timeout'));
				}, ms);
			});
		}
		const promises = this.mirrors.map((mirror) => {
			const start = Date.now();
			return new Promise((resolve) => {
				const url = new URL(mirror);
				const req = request(
					{
						protocol: url.protocol,
						hostname: url.hostname,
						path: '/',
						method: 'GET'
					},
					() => resolve({ mirror, time: Date.now() - start })
				);
				req.on('error', () => {
					resolve({ mirror, time: Infinity });
				});
				req.end();
				timeout(10000);
			});
		});
		try {
			const result = await Promise.race(promises);
			this.mirror = first(result.mirror, this.mirror);
		} catch (e) {
			/* empty */
		}
		this.updated = true;

		done(`Get the fastest ${magenta('npm source')}.`);
	}

	async getFastestMirror() {
		await this.check();
		return this.mirror;
	}
}

const MirrorHandler = new MirrorClass(Mirrors);

export default MirrorHandler;
