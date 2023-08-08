import MirrorHandler from './mirror.js';
import { GULPFILE } from '../base/constants.js';
import { getText, getJSON } from '../base/network.js';
import { magenta, start, done } from '../base/console.js';

const NetWork = {
	getNpmPackageVersions: async (packageName) => {
		start(
			`Getting the dependencies versions for ${magenta(packageName)}...  `
		);
		const data = await getJSON(
			(await MirrorHandler.getFastestMirror()) + packageName
		);
		done(`Getting the dependencies versions for ${magenta(packageName)}.`);
		const versions = Object.keys(data.versions)
			.map((v) => [...v.split('-'), v])
			.filter((v) => v[0] !== '0.0.1' && !v[1].includes('internal'))
			.map((v) => {
				if (v.length < 3) return [v[0], v[0]];
				const gameVersion = v[1];
				const version = v[v.length - 1];
				if (gameVersion.startsWith('rc')) {
					return [v[0] + '-rc', version];
				} else if (gameVersion.startsWith('beta')) {
					return [v[0] + '-beta', version];
				} else if (gameVersion.startsWith('preview')) {
					return [v[0] + '-rc', version];
				}
			})
			.reduce((acc, [key, value]) => {
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(value);
				return acc;
			}, {});
		return versions;
	},
	getLatestVersion: async (packageName) => {
		const versions = await NetWork.getNpmPackageVersions(packageName);
		const api = Object.keys(versions).sort().reverse()[0];
		const npm = versions[api].sort().reverse()[0];
		return { api, npm };
	},
	getGulpFile: async () => {
		return await getText(GULPFILE);
	}
};

export default NetWork;
