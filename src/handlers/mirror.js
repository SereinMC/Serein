import axios from 'axios';
import DelayHandler from './delay.js';
import { Mirrors } from '../base/constants.js';
import { magenta, done, start } from '../base/console.js';

class MirrorClass extends DelayHandler {
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
		this.mirror = result.mirror || this.mirror;
        
		done(`Get the fastest ${magenta('npm source')}.`);
		this.done();
	}

	async getFastestMirror() {
		await this.check();
		return this.mirror;
	}
}

const MirrorHandler = new MirrorClass(Mirrors);

export default MirrorHandler;
