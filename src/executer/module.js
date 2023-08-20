import NpmHandler from '../handlers/npm.js';
import ModuleResolver from '../handlers/module.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';

async function moduleManage() {
	InfoHandler.bind('module');

	const modules = await ModuleResolver.getDependencies();

	await NpmHandler.resolveDependencies(modules);

	await ManifestHandler.resolveDependencies(modules);

	await NpmHandler.write();

	await ManifestHandler.write();

	await NpmHandler.clearModules();

	await NpmHandler.install();
}

export default moduleManage;
