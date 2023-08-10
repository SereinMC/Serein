class DelayHanlder {
	constructor() {
		this.updated = false;
	}

	async check() {
		if (this.updated === true) return;
		else await this.update();
	}

	async update() {
		throw new Error('You have to implement the method check!');
	}
}

export default DelayHanlder;
