class DelayHanlder {
	constructor(defaultValue = false) {
		this.updated = defaultValue;
	}

	check() {
		if (this.updated === true) return;
		else this.update();
	}

	update() {
		throw new Error('You have to implement the method check!');
	}
}

class DelayHanlderPromise extends DelayHanlderHanlder {
	constructor(defaultValue) {
		super(defaultValue);
	}

	async check() {
		if (this.updated === true) return;
		else await this.update();
	}

	async update() {
		throw new Error('You have to implement the method check!');
	}
}

export { DelayHanlder, DelayHanlderPromise };
