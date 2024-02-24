import IO from '../base/io.js';
import Fractal from '../base/fractal.js';
import { start, done } from '../base/console.js';
import DelayClassWithInfo from './delayInfo.js';

class LogoClass extends DelayClassWithInfo {
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

		IO.writeText(behPath + 'pack_icon.png', this.png);
		if (res) IO.writeText(resPath + 'pack_icon.png', this.png);
	}
}

const LogoHandler = new LogoClass();

export default LogoHandler;
