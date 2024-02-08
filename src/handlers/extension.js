import { done, error, start } from '../base/console.js';
import IO from '../base/io.js';
import NpmHandler from './npm.js';
import InfoHandler from './information.js';

class ExtensionClass {
	constructor() {
		this.context = {};
		this.extList = [];
	}

	init() {
		if (IO.exists('.serein.json')) {
			this.context = IO.readJSON('.serein.json');
			if (!this.context['extensions']) this.context['extension'] = [];
			else this.extList = this.context['extension'];
		}
	}

	async install(packageNames) {
		start('Install extensions...');

		await NpmHandler.add(packageNames.join(' '));
		this.context.extension.push(...packageNames);
		IO.writeJSON('.serein.json', this.context);

		done('Intstall extension.');
	}

	async uninstall(packageNames) {
		start('Uninstall extensions...');

		await NpmHandler.del(packageNames.join(' '));
		this.context.extension = this.context.extension.filter(
			(v) => !packageNames.includes(v)
		);
		IO.writeJSON('.serein.json', this.context);

		done('Uninstall extensions.');
	}

	async load(program) {
		if (this.extList.length) {
			start('Load extensions...');
			try {
				for (const packageName in this.extList)
					(await import(packageName)).cli((program, InfoHandler));
			} catch (e) {
				console.log(error('Failed to load extension!'), e);
			}
			done('Load extensions.');
		}
	}
}

const ExtensionHandler = new ExtensionClass();

export default ExtensionHandler;
