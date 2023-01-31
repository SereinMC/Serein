#!/usr/bin/env node
const cli_version = '1.1.6';

const readlineSync = require('readline-sync');
const program = require('commander');
const path = require('path');
const { v4: uuid } = require('uuid');
const request = require('request');
const chalk = require('chalk');
const fs = require('fs');
const cp = require('node:child_process');
const del = require('delete');
const PNG = require('pngjs').PNG;
const icon_gen = require('fractal-icon-cjs');

const error = chalk.bold.red;
const gary = chalk.bold.whiteBright;
const magenta = chalk.bold.magenta;
const warning = chalk.hex('#FFA500');
const accept = chalk.bold.green;
const done = accept('[done]');

program
	.name('serein')
	.description('A Minecraft Bedrock creation manage tool.')
	.version(cli_version, '-v, --version');

program
	.command('init')
	.alias('i')
	.description('init a project')
	.option('-y --yes', 'use default config')
	.action((option) =>
		getInformation(option.yes)
			.then(downloadFiles)
			.then(dealDependencies)
			.then(creatFiles)
	);

program
	.command('switch')
	.alias('s')
	.description('switch requirements version')
	.option('-y --yes', 'switch to latest version')
	.action((option) =>
		getVersionInformations(option.yes)
			.then(chooseVersions)
			.then(switchVersions)
	);

program
	.command('build')
	.alias('b')
	.description('build scripts to product')
	.action(() => exec('gulp build'));

program
	.command('deploy')
	.alias('d')
	.description('deploy project to game')
	.action(() => exec('gulp'));

program
	.command('pack')
	.alias('p')
	.description('build .mcpack form project')
	.action(() => exec('gulp bundle'));

program
	.command('watch')
	.alias('w')
	.description('listen for changes and deploy automatically')
	.action(() => exec('gulp watch'));

program.parse(process.argv);

function req(options) {
	return new Promise((resolve, reject) => {
		request(
			{
				url: options,
				method: 'GET',
				encoding: null
			},
			(err, res, body) => {
				if (err) reject(err);
				else resolve(body);
			}
		);
	});
}

function mkdir(dirs) {
	return new Promise((resolve) => {
		for (let x of dirs) {
			if (!fs.existsSync(x)) {
				fs.mkdirSync(x);
				console.log(x, done);
			}
		}
		resolve();
	});
}

function writeText(filename, text) {
	fs.writeFileSync(filename, text);
	console.log(filename, done);
}

function writeJSON(filename, obj) {
	fs.writeFileSync(filename, JSON.stringify(obj, null, '\t'));
	console.log(filename, done);
}

function exec(command) {
	cp.execSync(command, { stdio: [0, 1, 2] });
}

function ask(str) {
	const answer = readlineSync.question(str + ' ').toLowerCase();
	return answer === 'y' || answer === 'yes' ? 'yes' : 'no';
}

function askVersion(packageName) {
	const answer = readlineSync
		.question(
			`Choose requirement mode for ${magenta(
				packageName
			)} : ${gary('L')}atest/${gary('V')}ersion(${error(
				'accomplished'
			)})/${gary('M')}anual (${warning('latest')}): `
		)
		.toLowerCase();
	if (answer === 'version' || answer === 'v') {
		const version = readlineSync.question('Game version : ');
		return {
			mode: 'version',
			raw: version
		};
	} else if (answer === 'manual' || answer === 'm') {
		const manifestVersion = readlineSync.question(
			`${magenta(packageName)} version in manifest: `
		);
		const npmVersion = readlineSync.question(
			`${magenta(packageName)} version in npm: `
		);
		return {
			mode: 'manual',
			manifestVersion: manifestVersion,
			npmVersion: npmVersion
		};
	} else return { mode: 'latest' };
}

function askRequire(packagename) {
	const need =
		ask(
			`Require ${magenta(packagename)}? ${gary('Y')}es/${gary(
				'N'
			)}o (${warning('no')}) `
		) === 'yes'
			? true
			: false;
	let version = { mode: 'latest' };
	if (need) version = askVersion(packagename);
	return [need, version];
}

function getInformation(isDefault) {
	return new Promise((resolve) => {
		if (!isDefault) {
			console.log(
				'This utility will walk you through creating a project.'
			);
			console.log('Press ^C at any time to quit.');
			const name =
				readlineSync.question(
					`project name: (${warning(
						path.basename(process.cwd())
					)}) `
				) || path.basename(process.cwd());
			const version =
				readlineSync.question(
					`version: ${warning('(1.0.0)')} `
				) || '1.0.0';
			const versionArray = version
				.split('.')
				.map((x) => parseInt(x));
			const description =
				readlineSync.question('description: ') || '';

			console.log(
				`Now I will aquire you the dependencies of your project, including the version. Please follow the guide to choose a specific game version or we will download the ${magenta(
					'latest'
				)} version.`
			);
			console.log(
				warning(
					'You should ensure the dependencies well arranged. If you wish to use dependencies (latest version) besides @mc/server.'
				)
			);
			const server_version = askVersion('@minecraft/server');
			const [server_ui, server_ui_version] = askRequire(
				'@minecraft/server-ui'
			);
			const [server_admin, server_admin_version] = askRequire(
				'@minecraft/server-admin'
			);
			const [server_gametest, server_gametest_version] =
				askRequire('@minecraft/server-gametest');
			const [server_net, server_net_version] = askRequire(
				'@minecraft/server-net'
			);
			const res =
				ask(
					`Create ${magenta('resource_packs')}? ${gary(
						'Y'
					)}es/${gary('N')}o (${warning('yes')})`
				) === 'no'
					? true
					: false;
			const allow_eval =
				ask(
					`Allow ${magenta('eval')} and ${magenta(
						'new Function'
					)}? ${gary('Y')}es/${gary('N')}o (${warning(
						'no'
					)}) `
				) === 'yes'
					? true
					: false;
			const languageTemp = readlineSync
				.question(
					`Language: ${gary('J')}s/${gary('T')}s (${warning(
						'ts'
					)})`
				)
				.toLowerCase();
			const language =
				languageTemp === 'js' || languageTemp === 'j'
					? 'js'
					: 'ts';

			resolve({
				name: name,
				version: version,
				versionArray: versionArray,
				description: description,
				res: res,
				allow_eval: allow_eval,
				language: language,
				packageVersions: {
					'@minecraft/server': {
						need: true,
						version: server_version
					},
					'@minecraft/server_ui': {
						need: server_ui,
						version: server_ui_version
					},
					'@minecraft/server-gametest': {
						need: server_gametest,
						version: server_gametest_version
					},
					'@minecraft/server-net': {
						need: server_net,
						version: server_net_version
					},
					'@minecraft/server-admin': {
						need: server_admin,
						version: server_admin_version
					}
				}
			});
		} else {
			resolve({
				name: path.basename(process.cwd()),
				version: '1.0.0',
				versionArray: [1, 0, 0],
				description: '',
				res: true,
				allow_eval: false,
				language: 'ts',
				packageVersions: {
					'@minecraft/server': {
						need: true,
						version: { mode: 'latest' }
					},
					'@minecraft/server_ui': {
						need: false
					},
					'@minecraft/server-gametest': {
						need: false
					},
					'@minecraft/server-net': {
						need: false
					},
					'@minecraft/server-admin': {
						need: false
					}
				}
			});
		}
	});
}

async function downloadVersions() {
	process.stdout.write(
		'Downloading the lastest dependence version...  '
	);
	const versionsStr = await req(
		'https://serein.shannon.science/version.json'
	);
	const npmVersionStr = await req(
		'https://serein.shannon.science/npm_version.json'
	);
	console.log(done);
	return [versionsStr, npmVersionStr];
}

async function downloadFiles(informations) {
	const [versionsStr, npmVersionStr] = await downloadVersions();
	const npmVersions = JSON.parse(npmVersionStr);
	const versions = JSON.parse(versionsStr);

	process.stdout.write('Downloading the gulpfile...  ');
	const gulpfile = await req(
		'https://serein.shannon.science/gulpfile.js'
	);
	console.log(done);

	process.stdout.write('Generating project icon... ');
	const icon = PNG.sync.write(icon_gen.gen_icon(informations.name));
	console.log(done);

	return {
		...informations,
		versions: versions,
		npmVersions: npmVersions,
		gulpfile: gulpfile,
		icon: icon
	};
}

function dealDependencies(informations) {
	for (const x in informations.packageVersions) {
		const current = informations.packageVersions[x];
		if (current.need === false) continue;
		else if (current.version.mode === 'version') {
			console.log(
				error(
					'This function currently has an unfixed problem, and is being switched to the latest...'
				)
			);
		} else if (current.version.mode === 'manual') {
			informations.npmVersions[x] = current.version.npmVersion;
			informations.versions[x] =
				current.version.manifestVersion;
		}
	}

	const toDependencies = (name) => {
		return {
			module_name: name,
			version: informations.versions[name]
		};
	};

	const resuuid = uuid(),
		dependencies = [],
		npmVersionsFiltered = {};

	if (informations.res)
		dependencies.push({
			uuid: resuuid,
			version: informations.versionArray
		});

	for (const x in informations.packageVersions) {
		const current = informations.packageVersions[x];
		if (current.need) {
			dependencies.push(toDependencies(x));
			npmVersionsFiltered[x] = informations.npmVersions[x];
		}
	}

	return {
		...informations,
		npmVersionsFiltered: npmVersionsFiltered,
		dependencies: dependencies,
		resuuid: resuuid
	};
}

async function creatFiles(informations) {
	console.log('Creating project directory and files... ');
	await mkdir([
		'behavior_packs',
		'behavior_packs/script',
		'scripts'
	]);
	if (informations.res) await mkdir(['resource_packs']);

	writeText('behavior_packs/pack_icon.png', informations.icon);

	writeJSON('.serein.json', {
		type: informations.language,
		res: informations.res,
		name: informations.name,
		mc_preview: false,
		bds: false,
		bds_path: '~/bds/',
		output: 'build',
		mc_dir: null
	});

	writeJSON('behavior_packs/manifest.json', {
		format_version: 2,
		header: {
			name: informations.name,
			description: informations.description,
			uuid: uuid(),
			version: informations.versionArray,
			min_engine_version: [1, 19, 20]
		},
		modules: [
			{
				description: 'Script resources',
				language: 'javascript',
				type: 'script',
				uuid: uuid(),
				version: [2, 0, 0],
				entry: 'scripts/main.js'
			}
		],
		dependencies: informations.dependencies,
		capabilities: informations.allow_eval ? ['script_eval'] : []
	});

	if (informations.res) {
		writeText('resource_packs/pack_icon.png', informations.icon);

		writeJSON('resource_packs/manifest.json', {
			format_version: 2,
			header: {
				description: informations.description,
				name: informations.name,
				uuid: informations.resuuid,
				version: informations.versionArray,
				min_engine_version: [1, 19, 20]
			},
			modules: [
				{
					description: informations.description,
					type: 'resources',
					uuid: uuid(),
					version: informations.versionArray
				}
			]
		});
	}

	const npmPackage = {
		name: informations.name,
		version: informations.version,
		type: 'module',
		description: informations.description,
		dependencies: {
			...informations.npmVersionsFiltered,
			del: '7.0.0',
			gulp: '^4.0.2',
			'gulp-cli': '^2.3.0',
			'gulp-esbuild': '^0.11.0',
			'gulp-typescript': '^6.0.0-alpha.1',
			'gulp-zip': '^5.1.0'
		}
	};

	writeJSON('package.json', npmPackage);

	if (informations.language === 'ts') {
		writeJSON('tsconfig.json', {
			compilerOptions: {
				target: 'es2020',
				moduleResolution: 'node',
				module: 'es2020',
				declaration: false,
				noLib: false,
				emitDecoratorMetadata: true,
				experimentalDecorators: true,
				sourceMap: false,
				pretty: true,
				allowUnreachableCode: true,
				allowUnusedLabels: true,
				noImplicitAny: true,
				noImplicitReturns: false,
				noImplicitUseStrict: false,
				outDir: 'build/',
				rootDir: '.',
				baseUrl: 'behavior_packs/',
				listFiles: false,
				noEmitHelpers: true
			},
			include: ['scripts/**/*'],
			exclude: [],
			compileOnSave: false
		});

		writeText(
			'scripts/main.ts',
			'/*\n _____________________ \n< do things u want... >\n--------------------- \n      \\   ^__^\n       \\  (oo)_______\n          (__)\\       )\\/\\\n              ||----w |\n              ||     ||\n*/'
		);
	} else {
		writeText(
			'scripts/main.js',
			'/*\n _____________________ \n< do things u want... >\n--------------------- \n      \\   ^__^\n       \\  (oo)_______\n          (__)\\       )\\/\\\n              ||----w |\n              ||     ||\n*/'
		);
	}

	writeText(
		'.mcattributes',
		'diagnostic.disable.minecraft.manifest.module.missing=true'
	);

	writeText('gulpfile.js', informations.gulpfile);

	exec('npm install');
}

async function getVersionInformations(isDefault) {
	const manifest = JSON.parse(
		fs.readFileSync('./behavior_packs/manifest.json', 'utf-8')
	);
	const packages = JSON.parse(
		fs.readFileSync('package.json', 'utf-8')
	);
	const [versions, npmVersions] = await downloadVersions();

	return {
		isDefault: isDefault,
		manifest: manifest,
		packages: packages,
		versions: versions,
		npmVersions: npmVersions
	};
}

function chooseVersions(informations) {
	for (const x in informations.manifest['dependencies']) {
		const current =
			informations.manifest['dependencies'][x]['module_name'] ||
			'';
		if (current.search(/@minecraft/) !== -1) {
			const switchYes =
				ask(
					`Do you want to switch versions dependent on ${magenta(
						current
					)}? ${gary('Y')}es/${gary('N')}o (${warning(
						'no'
					)})`
				) === 'yes'
					? true
					: false;
			if (switchYes) {
				let version = { mode: 'latest' };
				if (!informations.isDefault)
					version = askVersion(current);
				if (version.mode === 'latest') {
					informations.manifest['dependencies'][x][
						'version'
					] = informations.versions[current];
					informations.packages['dependencies'][current] =
						informations.npmVersions[current];
				} else if (version.mode === 'version') {
					console.log(
						error(
							'This function currently has an unfixed problem, and is being switched to the manual...'
						)
					);
				} else {
					informations.manifest['dependencies'][x][
						'version'
					] = version.manifestVersion;
					informations.packages['dependencies'][current] =
						version.npmVersion;
				}
				console.log(
					`Requirement ${magenta(
						current
					)} switched to ${accept(
						informations.manifest['dependencies'][x][
							'version'
						]
					)}`
				);
			}
		}
	}

	return informations;
}

function switchVersions(informations) {
	writeJSON(
		'./behavior_packs/manifest.json',
		informations.manifest
	);

	writeJSON('package.json', informations.packages);

	del.sync('node_modules');
	del.sync('package-lock.json');

	exec('npm i');
}
