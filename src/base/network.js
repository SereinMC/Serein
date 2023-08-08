import { request } from 'https';

function getText(options) {
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
	const str = await getText(url);
	return JSON.parse(str);
}

export { getText, getJSON };
