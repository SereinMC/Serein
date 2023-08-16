import InfoHandler from './information.js';

class DelayHanlderWithInfo {
	constructor() {
		this.updated = false;
		this.info = {};
	}

	async syncInfo() {
		this.info = await InfoHandler.getInfo();
	}

	async check() {
		if (this.updated === true) return;
		else {
			await this.syncInfo();
			await this.update();
		}
	}

	async update() {
		this.done();
	}

	done() {
		this.updated = true;
	}
}

export default DelayHanlderWithInfo;
