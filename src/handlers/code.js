import { writeJSON, writeText } from '../base/io.js';
import DelayHanlderWithInfo from './delayInfo.js';
import { DefaultCode, TSCONFIG } from '../base/constants.js';

class CodeClass extends DelayHanlderWithInfo {
	constructor() {
		super();
		this.tsconfig = {};
	}

	async update() {
		const { language, scriptPath } = this.info;

		if (language === 'ts') {
			this.tsconfig = TSCONFIG;
			this.tsconfig.include.push(scriptPath + '**/*');
		}

		this.updated = true;
	}

	async write() {
		await this.check();
		if (this.info.language === 'ts') {
			writeJSON('tsconfig.json', this.tsconfig);
			writeText(this.info.scriptsPath + 'main.ts', DefaultCode);
		} else {
			writeText(this.info.scriptsPath + 'main.js', DefaultCode);
		}
	}
}

const CodeHandler = new CodeClass();

export default CodeHandler;
