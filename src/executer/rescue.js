import IO from '../base/io.js';
import NpmHandler from '../handlers/npm.js';
import { error, start } from '../base/console.js';

async function rescue() {
	start('project rescue...');
	if (!(IO.exists('package.json') && IO.exists('.serein.json')))
		console.log(
			error(
				'Fix failed, make sure you have serein.json with package.json!'
			)
		);
	else {
		await NpmHandler.install();
		done('project rescue.');
	}
}

export default rescue;
