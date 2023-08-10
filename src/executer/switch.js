import NpmHandler from '../handlers/npm.js';
import ModuleResolver from '../handlers/module.js';
import InfoHandler from '../handlers/information.js';
import ManifestHandler from '../handlers/manifest.js';

async function switchVersion(isDefault) {
	InfoHandler.bind('switch');

	if (isDefault) await InfoHandler.init();

	await ManifestHandler.resolveDependencies(
		await ModuleResolver.getDependencies()
	);

	await NpmHandler.addDependencies(await ModuleResolver.getDependencies());

	await ManifestHandler.write();

	await NpmHandler.clearModules();

	await NpmHandler.install();
}

export default switchVersion;
