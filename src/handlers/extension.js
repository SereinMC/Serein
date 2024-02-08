import IO from '../base/io.js';
import { resolve } from 'path';
import NpmHandler from './npm.js';
import InfoHandler from './information.js';
import { done, error, start } from '../base/console.js';

class ExtensionClass {
	constructor() {
		this.context = {};
		this.extList = [];
	}

	init() {
		if (IO.exists('.serein.json')) {
			this.context = IO.readJSON('.serein.json');
			if (!this.context['extension']) this.context['extension'] = [];
			else this.extList = this.context['extension'];
		}
	}

	async install(packageName) {
		start('Install extensions...');

		await NpmHandler.add(packageName);
		this.context.extension.push(packageName);
		IO.writeJSON('.serein.json', this.context);

		done('Intstall extension.');
	}

	async uninstall(packageName) {
		start('Uninstall extensions...');

		await NpmHandler.del(packageName);
		this.context.extension = this.context.extension.filter(
			(v) => v !== packageName
		);
		IO.writeJSON('.serein.json', this.context);

		done('Uninstall extensions.');
	}

	async load(program) {
		if (this.extList.length) {
			start('Load extensions...');
			try {
				for (const packageName of this.extList) {
					(
						await import(
							resolve(
								process.cwd(),
								'node_modules',
								packageName,
								'index.js'
							)
						)
					).cli(program, InfoHandler, IO);
				}
			} catch (e) {
				console.log(error('Failed to load extension!'), e);
			}
			done('Load extensions.');
		}
	}
}

const ExtensionHandler = new ExtensionClass();

export default ExtensionHandler;
