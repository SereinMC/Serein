import NpmHandler from '../handlers/npm.js';
import GulpHandler from '../handlers/gulp.js';
import ConfigRender from '../handlers/config.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';
import { DEFAULT_NPM_DEPENDENCIES } from '../base/constants.js';

async function adaptProject() {
	InfoHandler.bind('adapt');

	await NpmHandler.toESM();

	await NpmHandler.tidyDependencies();

	await NpmHandler.addDependencies(DEFAULT_NPM_DEPENDENCIES);

	await ManifestHandler.check();

	await ConfigRender.init();

	await ConfigRender.write();

	await GulpHandler.write();

	await NpmHandler.write();

	await NpmHandler.clearModules();

	await NpmHandler.install();
}

export default adaptProject;
