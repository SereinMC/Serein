import NpmHandler from '../handlers/npm.js';
import GulpHandler from '../handlers/gulp.js';
import ConfigRender from '../handlers/config.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';

async function adaptProject() {
	InfoHandler.bind('adapt');

	await NpmHandler.toESM();

	await NpmHandler.tidyDependencies();

	await NpmHandler.resolveDependencies([
		['del', '7.0.0'],
		['gulp', '^4.0.2'],
		['gulp-esbuild', '^0.11.0'],
		['gulp-typescript', '^6.0.0-alpha.1'],
		['gulp-zip', '^5.1.0']
	]);

	await ManifestHandler.check();

	await ConfigRender.init();

	await ConfigRender.write();

	await GulpHandler.write();

	await NpmHandler.write();

	await NpmHandler.clearModules();

	await NpmHandler.install();
}

export default adaptProject;
