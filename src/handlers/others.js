import { mkdir, writeText } from '../base/io.js';
import DelayHanlderWithInfo from './delayInfo.js';

class OthersClass extends DelayHanlderWithInfo {
	constructor() {
		super();
	}

	async mkdir() {
		await this.check();

		const { behPath, resPath, res, scriptsPath } = this.info;

		mkdir([behPath, behPath + scriptsPath, scriptsPath]);

		if (res) mkdir([resPath]);
	}

	async writeAttributes() {
		await this.check();
        
		writeText('.mcattributes', MCATTRIBUTES);
	}
}

const Others = new OthersClass();

export default Others;
