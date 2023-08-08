import { readFileSync } from 'fs';
import { writeJSON } from '../base/io.js';
import NpmHandler from '../handlers/npm.js';
import NetWork from '../handlers/network.js';
import { SERVER } from '../base/constants.js';
import { getDeps } from '../base/inquirer.js';

async function getVersionInformations(isDefault) {
	const manifest = JSON.parse(
		readFileSync('./behavior_packs/manifest.json', 'utf-8')
	);
	const packages = JSON.parse(readFileSync('package.json', 'utf-8'));

	return {
		isDefault: isDefault,
		manifest: manifest,
		packages: packages
	};
}

async function chooseVersions(informations) {
	const deps = [],
		nowDeps = [];
	for (const current of informations.manifest.dependencies) {
		const packageName = current.module_name || '';
		if (packageName.search(/@minecraft/) !== -1) {
			if (informations.isDefault && packageName === SERVER) {
				const version = await NetWork.getLatestVersion(SERVER);
				current.version = version.api;
				informations.packages.dependencies[current] = version.npm;
			}
			nowDeps.push(current);
		} else deps.push(current);
	}
	if (!informations.isDefault) {
		const packageVersions = await getDeps(
			nowDeps.map((v) => v.module_name),
			'Select dependencies which need to swicth:'
		);
		const packages = Object.keys(packageVersions);
		for (const i in nowDeps) {
			const packageName = nowDeps[i].module_name || '';
			if (!packages.includes(packageName)) continue;
			if (packageName.search(/@minecraft/) !== -1) {
				nowDeps[i].version = packageVersions[packageName].api;
				informations.packages.dependencies[packageName] =
					packageVersions[packageName].npm;
			}
		}
	}
	informations.manifest.dependencies = deps.concat(nowDeps);
	return informations;
}

async function switchVersions(informations) {
	writeJSON('./behavior_packs/manifest.json', informations.manifest);

	writeJSON('package.json', informations.packages);

	NpmHandler.clearModules();

	await NpmHandler.install();
}

const switchVersion = (isDefault) =>
	getVersionInformations(isDefault).then(chooseVersions).then(switchVersions);

export default switchVersion;
