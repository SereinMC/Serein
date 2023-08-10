import axios from 'axios';
import DelayHanlder from './delay.js';
import { first } from '../base/utils.js';
import { Mirrors } from '../base/constants.js';
import { magenta, done, start } from '../base/console.js';

class MirrorClass extends DelayHanlder {
	constructor(mirror) {
		super();
		this.mirrors = mirror;
		this.mirror = 'https://registry.npmjs.org/';
	}

	async update() {
		start(`Getting the fastest ${magenta('npm source')}...`);

		const promises = this.mirrors.map((mirror) => {
			const start = Date.now();
			return axios
				.get(mirror, { timeout: 5000 })
				.then(() => {
					const time = Date.now() - start;
					return { mirror, time };
				})
				.catch(() => ({ mirror, time: Infinity }));
		});

		const result = await Promise.race(promises);
		this.mirror = first(result.mirror, this.mirror);
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
