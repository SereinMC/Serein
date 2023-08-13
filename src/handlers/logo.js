import Fractal from '../base/fractal.js';
import { writeText } from '../base/io.js';
import { start, done } from '../base/console.js';
import DelayHanlderWithInfo from './delayInfo.js';

class LogoClass extends DelayHanlderWithInfo {
	constructor() {
		super();
		this.png = '';
	}

	async update() {
		start('Generating project icon...');

		const { name } = await this.info;
		this.png = Fractal.generate(name);

		done('Generate project icon. ');

		this.done();
	}

	async write() {
		await this.check();

		const { behPath, resPath, res } = this.info;

		writeText(behPath + 'pack_icon.png', this.png);
		if (res) writeText(resPath + 'pack_icon.png', this.png);
	}
}

const LogoHandler = new LogoClass();

export default LogoHandler;
