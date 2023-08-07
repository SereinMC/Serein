class Hanlder {
	constructor() {
		this.updated = false;
	}

	check() {
		if (this.updated === true) return;
		else this.update();
	}

	update() {
		throw new Error('You have to implement the method check!');
	}
}

class HanlderPromise extends Hanlder{
	constructor() {
		super();
	}

	async check() {
		if (this.updated === true) return;
		else await this.update();
	}

	async update() {
		throw new Error('You have to implement the method check!');
	}
}

export { Hanlder,HanlderPromise };
