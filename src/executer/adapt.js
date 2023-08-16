import GulpHandler from '../handlers/gulp.js';
import ConfigRender from '../handlers/config.js';
import InfoHandler from '../handlers/information.js';

async function adaptProject() {
	InfoHandler.bind('adapt');

	await ConfigRender.init();

	await ConfigRender.write();

	await GulpHandler.write();
}

export default adaptProject;
