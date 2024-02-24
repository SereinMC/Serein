import IO from '../base/io.js';
import NetWork from '../base/network.js';
import DelayClass from './delayInfo.js';
import { start, done } from '../base/console.js';

class GulpClass extends DelayClass {
	constructor() {
		super();
		this.context = '';
	}

	async update() {
		start('Downloading the gulpfile...');

		this.context = await NetWork.getGulpFile();

		done('Download the gulpfile.');

		this.done();
	}

	async write() {
		await this.check();
		IO.writeText('gulpfile.js', this.context);
	}
}

const GulpHandler = new GulpClass();

export default GulpHandler;
