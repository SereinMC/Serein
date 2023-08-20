import IO from '../base/io.js';
import DelayHanlderWithInfo from './delayInfo.js';
import { MCATTRIBUTES } from '../base/constants.js';

class OthersClass extends DelayHanlderWithInfo {
	constructor() {
		super();
	}

	async mkdir() {
		await this.check();

		const { behPath, resPath, res, scriptsPath } = this.info;

		IO.mkdir([behPath, scriptsPath]);

		if (res) IO.mkdir([resPath]);
	}

	async writeAttributes() {
		await this.check();

		IO.writeText('.mcattributes', MCATTRIBUTES);
	}
}

const Others = new OthersClass();

export default Others;
