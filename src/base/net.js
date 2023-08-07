import { request } from 'https';
import MirrorHandler from '../handlers/mirror.js';
import { magenta, start, done } from './console.js';

function req(options) {
	return new Promise((resolve, reject) => {
		const req = request(options, (res) => {
			let body = '';
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				resolve(body);
			});
		});
		req.on('error', (err) => {
			reject(err);
		});
		req.end();
	});
}

async function getJSON(url) {
	const str = await req(url);
	return JSON.parse(str);
}

async function getNpmPackageVersions(packageName) {
	start(`Getting the dependencies versions for ${magenta(packageName)}...  `);
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
}

async function getLatestServerVersion() {
	const versions = await getNpmPackageVersions('@minecraft/server');
	const api = Object.keys(versions).sort().reverse()[0];
	const npm = versions[api].sort().reverse()[0];
	return { api, npm };
}

export { req, getNpmPackageVersions, getLatestServerVersion };
