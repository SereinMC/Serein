#!/usr/bin/env node
// Forked from nodejs/node
// Usage: tools/update-authors.mjs [--dry]
// Passing --dry will redirect output to stdout rather than write to 'AUTHORS'.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import readline from 'node:readline';

class CaseIndifferentMap {
	_map = new Map();

	get(key) {
		return this._map.get(key.toLowerCase());
	}
	has(key) {
		return this._map.has(key.toLowerCase());
	}
	set(key, value) {
		return this._map.set(key.toLowerCase(), value);
	}
}

const log = spawn(
	'git',
	// Inspect author name/email and body.
	['log', '--reverse', '--format=Author: %aN <%aE>\n%b'],
	{
		stdio: ['inherit', 'pipe', 'inherit']
	}
);
const rl = readline.createInterface({ input: log.stdout });

let output;
if (process.argv.includes('--dry')) output = process.stdout;
else output = fs.createWriteStream('AUTHORS');

output.write('# Authors ordered by first contribution.\n\n');

const mailmap = new CaseIndifferentMap();
{
	const lines = fs
		.readFileSync(new URL('../.mailmap', import.meta.url), {
			encoding: 'utf8'
		})
		.split('\n');
	for (let line of lines) {
		line = line.trim();
		if (line.startsWith('#') || line === '') continue;

		const match = line.match(
			/^(?:([^<]+)\s+)?(?:(<[^>]+>)\s+)?(?:([^<]+)\s+)?(<[^>]+>)$/
		);
		if (match) {
			const [, replaceName, replaceEmail, originalName, originalEmail] =
				match;
			const key = originalName
				? `${originalName}\0${originalEmail.toLocaleLowerCase()}`
				: originalEmail.toLowerCase();
			mailmap.set(key, {
				author: replaceName || originalName,
				email: replaceEmail || originalEmail
			});
		} else {
			console.warn('Unknown .mailmap format:', line);
		}
	}
}

const previousAuthors = new CaseIndifferentMap();
{
	const lines = fs
		.readFileSync(new URL('../AUTHORS', import.meta.url), {
			encoding: 'utf8'
		})
		.split('\n');
	for (let line of lines) {
		line = line.trim();
		if (line.startsWith('#') || line === '') continue;

		const match = line.match(/^([^<]+)\s+(<[^>]+>)$/);
		if (match) {
			const name = match[1];
			const email = match[2];
			if (previousAuthors.has(name)) {
				const emails = previousAuthors.get(name);
				emails.push(email);
			} else {
				previousAuthors.set(name, [email]);
			}
		} else {
			console.warn('Unknown AUTHORS format:', line);
		}
	}
}

const seen = new Set();

// Support regular git author metadata, as well as `Author:` and
// `Co-authored-by:` in the message body. Both have been used in the past
// to indicate multiple authors per commit, with the latter standardized
// by GitHub now.
const authorRe =
	/(^Author:|^Co-authored-by:)\s+(?<author>[^<]+)\s+(?<email><[^>]+>)/i;
for await (const line of rl) {
	const match = line.match(authorRe);
	if (!match) continue;

	let { author, email } = match.groups;
	const emailLower = email.toLowerCase();

	const replacement =
		mailmap.get(author + '\0' + emailLower) || mailmap.get(emailLower);
	if (replacement) {
		({ author, email } = { author, email, ...replacement });
	}

	if (seen.has(email)) {
		continue;
	}

	seen.add(email);
	output.write(`${author} ${email}\n`);
	const duplicate = previousAuthors.get(author);
	if (duplicate && !duplicate.includes(email)) {
		console.warn(
			'Author name already in AUTHORS file. Possible duplicate:'
		);
		console.warn(`  ${author} ${email}`);
	}
}

output.end('\n# Generated by tools/update-authors.mjs\n');
