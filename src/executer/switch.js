import NpmHandler from '../handlers/npm.js';
import ModuleResolver from '../handlers/module.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';

async function switchVersion(isDefault) {
	InfoHandler.bind('switch');

	if (isDefault) await InfoHandler.init();

	const modules = await ModuleResolver.getDependencies();

	await ManifestHandler.resolveDependencies(modules);

	await NpmHandler.addDependencies(modules);

	await ManifestHandler.write();

	await NpmHandler.clearModules();

	await NpmHandler.install();
}

export default switchVersion;
