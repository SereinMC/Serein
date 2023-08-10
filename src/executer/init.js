import NpmHandler from '../handlers/npm.js';
import GulpHandler from '../handlers/gulp.js';
import LogoHandler from '../handlers/logo.js';
import { mkdir, writeText } from '../base/io.js';
import ConfigRender from '../handlers/config.js';
import ModuleResolver from '../handlers/module.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';
import CodeHandler from '../handlers/code.js';
import { MCATTRIBUTES } from '../base/constants.js';

async function getInformation(isDefault) {
	InfoHandler.bind('init');

	if (isDefault) await InfoHandler.init();

	await ManifestHandler.init();

	await NpmHandler.init();

	await ConfigRender.init();

	await NpmHandler.addDependencies(await ModuleResolver.getDependencies());

	await ManifestHandler.resolveDependencies(
		await ModuleResolver.getDependencies()
	);
}

async function creatFiles() {
	console.log('Creating project... ');

	mkdir(['behavior_packs', 'behavior_packs/scripts', 'scripts']);
	if ((await InfoHandler.getInfo()).res) mkdir(['resource_packs']);

	ConfigRender.write();

	await ManifestHandler.write();

	await LogoHandler.write();

	await NpmHandler.writePackage();

	await CodeHandler.write();

	await GulpHandler.write();

	writeText('.mcattributes', MCATTRIBUTES);

	await NpmHandler.install();
}

const initProject = (isDefault) => getInformation(isDefault).then(creatFiles);

export default initProject;
