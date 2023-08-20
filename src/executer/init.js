import Others from '../handlers/others.js';
import NpmHandler from '../handlers/npm.js';
import GulpHandler from '../handlers/gulp.js';
import LogoHandler from '../handlers/logo.js';
import CodeHandler from '../handlers/code.js';
import ConfigRender from '../handlers/config.js';
import ModuleResolver from '../handlers/module.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';

async function getInformation(isDefault) {
	InfoHandler.bind('init');

	if (isDefault) await InfoHandler.init();

	await ManifestHandler.init();

	await NpmHandler.init();

	await ConfigRender.init();

	const modules = await ModuleResolver.getDependencies();

	await NpmHandler.addDependencies(modules);

	await ManifestHandler.addDependencies(modules);
}

async function creatFiles() {
	await Others.mkdir();

	await ConfigRender.write();

	await ManifestHandler.write();

	await LogoHandler.write();

	await NpmHandler.write();

	await CodeHandler.write();

	await GulpHandler.write();

	await Others.writeAttributes();

	await NpmHandler.install();
}

const initProject = (isDefault) => getInformation(isDefault).then(creatFiles);

export default initProject;
