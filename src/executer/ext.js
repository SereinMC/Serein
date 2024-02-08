import InfoHandler from '../handlers/information.js';
import ExtensionHandler from '../handlers/extension.js';

async function install(packageName) {
	InfoHandler.bind('ext');

	await ExtensionHandler.install(packageName);
}

async function uninstall(packageName) {
	InfoHandler.bind('ext');

	await ExtensionHandler.uninstall(packageName);
}

export { install, uninstall };
