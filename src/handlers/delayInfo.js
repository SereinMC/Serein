import InfoHandler from './information.js';

class DelayHanlderWithInfo {
	constructor() {
		this.updated = false;
		this.info = '';
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
		throw new Error('You have to implement the method check!');
	}
}

export default DelayHanlderWithInfo;
