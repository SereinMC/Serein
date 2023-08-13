class DelayHanlder {
	constructor() {
		this.updated = false;
	}

	async check() {
		if (this.updated === true) return;
		else await this.update();
	}

	async update() {
		this.done();
	}

	done() {
		this.updated = true;
	}
}

export default DelayHanlder;
