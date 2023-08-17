import IO from '../base/io.js';
import DelayHanlderWithInfo from './delayInfo.js';
import { DefaultCode, TSCONFIG } from '../base/constants.js';

class CodeClass extends DelayHanlderWithInfo {
	constructor() {
		super();
		this.tsconfig = {};
	}

	async update() {
		const { language, scriptsPath } = this.info;

		if (language === 'ts') {
			this.tsconfig = TSCONFIG;
			this.tsconfig.include.push(scriptsPath + '**/*');
		}

		this.done();
	}

	async write() {
		await this.check();
		const { language, scriptsPath, entry } = this.info;

		if (language === 'ts') {
			IO.writeJSON('tsconfig.json', this.tsconfig);
			IO.writeText(scriptsPath + entry + '.ts', DefaultCode);
		} else {
			IO.writeText(scriptsPath + entry + '.js', DefaultCode);
		}
	}
}

const CodeHandler = new CodeClass();

export default CodeHandler;
