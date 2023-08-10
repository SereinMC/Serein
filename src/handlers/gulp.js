import NetWork from './network.js';
import DelayHanlder from './delayInfo.js';
import { writeText } from '../base/io.js';
import { start, done } from '../base/console.js';

class GulpClass extends DelayHanlder {
	constructor() {
		super();
		this.context = '';
	}

	async update() {
		start('Downloading the gulpfile...');

		this.context = await NetWork.getGulpFile();

		done('Download the gulpfile.');
	}

	async write() {
		await this.check();
		writeText('gulpfile.js', this.context);
	}
}

const GulpHandler = new GulpClass();

export default GulpHandler;
