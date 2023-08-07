import { basename } from 'path';
import { v4 as uuid } from 'uuid';
import NpmHandler from '../handlers/npm.js';
import { gen_icon } from '../addons/fractal.js';
import ConfigRender from '../handlers/config.js';
import {
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR,
	DefaultCode
} from '../base/constants.js';
import { askProjectInfo, askBase, askYes, getDeps } from '../base/inquirer.js';
import { mkdir, writeJSON, writeText } from '../base/io.js';
import { magenta, warning, start, done } from '../base/console.js';
import { req, getLatestServerVersion } from '../base/net.js';

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
			name: basename(process.cwd()),
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
	start('Downloading the gulpfile...');
	const gulpfile = await req('https://serein.meowshe.com/gulpfile.js');
	done('Download the gulpfile.');

	start('Generating project icon...');
	const icon = gen_icon(informations.name);
	done('Generate project icon. ');

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

	ConfigRender.writeConfig({
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

		writeText('scripts/main.ts', DefaultCode);
	} else {
		writeText('scripts/main.js', DefaultCode);
	}

	writeJSON('package.json', npmPackage);

	writeText(
		'.mcattributes',
		'diagnostic.disable.minecraft.manifest.module.missing=true'
	);

	writeText('gulpfile.js', informations.gulpfile);

	await NpmHandler.install();
}

const initProject = (isDefault) =>
	getInformation(isDefault)
		.then(downloadFiles)
		.then(dealDependencies)
		.then(creatFiles);

export default initProject;
