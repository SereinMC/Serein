import axios from 'axios';
import MirrorHandler from './mirror.js';
import { DATA, GULPFILE } from '../base/constants.js';
import { magenta, start, done } from '../base/console.js';

const NetWork = {
	getNpmPackageVersions: async (packageName, isData) => {
		start(
			`Getting the dependencies versions for ${magenta(packageName)}...  `
		);
		const data = (
			await axios.get(
				(await MirrorHandler.getFastestMirror()) + packageName
			)
		).data;
		done(`Getting the dependencies versions for ${magenta(packageName)}.`);
		if (isData) return Object.keys(data.versions);
		else
			return Object.keys(data.versions)
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
	},

	getLatestVersion: async (packageName) => {
		const versions = await NetWork.getNpmPackageVersions(packageName);
		const api = Object.keys(versions).sort().reverse()[0];
		const npm = versions[api].sort().reverse()[0];
		return { api, npm, isData: DATA.includes(packageName) };
	},

	getGulpFile: async () => {
		return (await axios.get(GULPFILE)).data;
	}
};

export default NetWork;
