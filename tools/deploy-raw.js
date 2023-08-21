#!/usr/bin/env node
// Usage: tools/deploy-ci.js
import { request } from 'https';

const options = {
	hostname: 'api.cloudflare.com',
	port: 443,
	path: process.env.DEPLOY_API,
	method: 'POST'
};

const req = request(options, (res) => {
	console.log('statusCode:', res.statusCode);

	if (res.statusCode !== 200) {
		throw new Error(
			`The RAW can not be deployed with status code: ${res.statusCode}`
		);
	}

	res.on('data', (d) => {
		process.stdout.write(d);
	});
});

req.on('error', (e) => {
	throw e;
});

req.end();
