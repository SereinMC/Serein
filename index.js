#!/usr/bin/env node
const context = {
	cli_version: '1.3.2',
	pnpm: false,
	defaultCode:
		'/*\n _____________________ \n< do things u want... >\n--------------------- \n      \\   ^__^\n       \\  (oo)_______\n          (__)\\       )\\/\\\n              ||----w |\n              ||     ||\n*/'
};

const program = require('commander');
const path = require('path');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const del = require('delete');
const PNG = require('pngjs').PNG;
const icon_gen = require('fractal-icon-cjs');
const {
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR
} = require('./src/constants.js');
const {
	magenta,
	warning,
	done,
	req,
	mkdir,
	writeJSON,
	writeText,
	exec,
	askProjectInfo,
	askBase,
	askYes,
	getLatestServerVersion,
	getDeps,
	checkPnpm,
	npmInstall
} = require('./src/utils.js');

program
	.name('serein')
	.description('A Minecraft: Bedrock Edition creation manage tool.')
	.version(context.cli_version);

program
	.command('init')
	.alias('i')
	.description('init a project')
	.option('-y --yes', 'use default config without asking any questions')
	.action((option) =>
		checkIfPnpmExist(option.yes)
			.then(getInformation)
			.then(downloadFiles)
			.then(dealDependencies)
			.then(creatFiles)
	);

program
	.command('switch')
	.alias('s')
	.description('switch requirements version')
	.option('-y --yes', 'switch to latest version directly')
	.action((option) =>
		checkIfPnpmExist(option.yes)
			.then(getVersionInformations)
			.then(chooseVersions)
			.then(switchVersions)
	);

program
	.command('build')
	.alias('b')
	.description('build scripts for production environment')
	.action(() => exec('gulp build'));

program
	.command('deploy')
	.alias('d')
	.description('deploy project to game')
	.action(() => exec('gulp'));

program
	.command('pack')
	.alias('p')
	.description('build the .mcpack for the current project')
	.action(() => exec('gulp bundle'));

program
	.command('watch')
	.alias('w')
	.description('listen for file changes and deploy project automatically')
	.action(() => exec('gulp watch'));

program.parse(process.argv);

async function checkIfPnpmExist(isDefault) {
	context.pnpm = checkPnpm();
	return isDefault;
}

async function getInformation(isDefault) {
	if (!isDefault) {
		console.log('This utility will walk you through creating a project.');
		console.log('Press ^C at any time to quit.');

		const { name, version, description } = await askProjectInfo();

		const versionArray = version.split('.').map((x) => parseInt(x));

		console.log(
			'Now I will inquire you the dependencies of your project, including the version. Please follow the guide to choose a specific version to download.'
		);
		console.log(
			warning(
				'You should make sure the dependencies are well organized if you want to use dependencies (latest version) besides @mc/server.'
			)
		);
		const packageVersions = await getDeps(
			[
				SERVER,
				SERVER_UI,
				SERVER_GAMETEST,
				SERVER_NET,
				SERVER_ADMIN,
				SERVER_EDITOR
			],
			'Select dependencies:'
		);
		const res = await askYes(`Create ${magenta('resource_packs')}?`, true);
		const allow_eval = await askYes(
			`Allow ${magenta('eval')} and ${magenta('new Function')}?`
		);
		const language = await askBase('Language:', ['ts', 'js']);

		return {
			name: name,
			version: version,
			versionArray: versionArray,
			description: description,
			res: res,
			allow_eval: allow_eval,
			language: language,
			packageVersions
		};
	} else {
		return {
			name: path.basename(process.cwd()),
			version: '1.0.0',
			versionArray: [1, 0, 0],
			description: '',
			res: true,
			allow_eval: false,
			language: 'ts',
			packageVersions: {
				[SERVER]: await getLatestServerVersion()
			}
		};
	}
}

async function downloadFiles(informations) {
	process.stdout.write('Downloading the gulpfile...  ');
	const gulpfile = await req('https://serein.meowshe.com/gulpfile.js');
	console.log(done);

	process.stdout.write('Generating project icon... ');
	const icon = PNG.sync.write(icon_gen.gen_icon(informations.name));
	console.log(done);

	return {
		...informations,
		gulpfile: gulpfile,
		icon: icon
	};
}

async function dealDependencies(informations) {
	informations.npmVersions = [];
	informations.versions = [];
	for (const name in informations.packageVersions) {
		const current = informations.packageVersions[name];
		informations.npmVersions[name] = current.npm;
		informations.versions[name] = current.api;
	}

	const resuuid = uuid(),
		dependencies = [],
		npmVersionsFiltered = {};

	if (informations.res)
		dependencies.push({
			uuid: resuuid,
			version: informations.versionArray
		});

	for (const name in informations.packageVersions) {
		dependencies.push({
			module_name: name,
			version: informations.versions[name]
		});
		npmVersionsFiltered[name] = informations.npmVersions[name];
	}

	return {
		...informations,
		npmVersionsFiltered: npmVersionsFiltered,
		dependencies: dependencies,
		resuuid: resuuid
	};
}

async function creatFiles(informations) {
	console.log('Creating project... ');
	await mkdir(['behavior_packs', 'behavior_packs/scripts', 'scripts']);
	if (informations.res) await mkdir(['resource_packs']);

	writeText('behavior_packs/pack_icon.png', informations.icon);

	writeJSON('.serein.json', {
		type: informations.language,
		res: informations.res,
		name: informations.name,
		mc_preview: false,
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
			'gulp-esbuild': '^0.11.0',
			'gulp-typescript': '^6.0.0-alpha.1',
			'gulp-zip': '^5.1.0'
		}
	};

	if (informations.language === 'ts') {
		writeJSON('tsconfig.json', {
			compilerOptions: {
				target: 'es2020',
				module: 'es2020',
				noLib: false,
				emitDecoratorMetadata: true,
				experimentalDecorators: true,
				pretty: true,
				allowUnreachableCode: true,
				allowUnusedLabels: true,
				noImplicitAny: true,
				rootDir: '.',
				listFiles: false,
				noEmitHelpers: true
			},
			include: ['scripts/**/*'],
			compileOnSave: false
		});

		writeText('scripts/main.ts', context.defaultCode);
	} else {
		writeText('scripts/main.js', context.defaultCode);
	}

	writeJSON('package.json', npmPackage);

	writeText(
		'.mcattributes',
		'diagnostic.disable.minecraft.manifest.module.missing=true'
	);

	writeText('gulpfile.js', informations.gulpfile);

	npmInstall(context.pnpm);
}

async function getVersionInformations(isDefault) {
	const manifest = JSON.parse(
		fs.readFileSync('./behavior_packs/manifest.json', 'utf-8')
	);
	const packages = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

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
				const version = await getLatestServerVersion();
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

function switchVersions(informations) {
	writeJSON('./behavior_packs/manifest.json', informations.manifest);

	writeJSON('package.json', informations.packages);

	del.sync('node_modules');
	if (context.pnpm && fs.existsSync('pnpm-lock.yaml'))
		del.sync('pnpm-lock.yaml');
	del.sync('package-lock.json');

	npmInstall(context.pnpm);
}
