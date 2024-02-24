// === CLI INFORMATIONS
const CLI_VERSION = '1.4.5';
// === END CLI INFORMATIONS

// === NPM PACKAGES
const SERVER = '@minecraft/server';
const SERVER_UI = '@minecraft/server-ui';
const SERVER_ADMIN = '@minecraft/server-admin';
const SERVER_GAMETEST = '@minecraft/server-gametest';
const SERVER_NET = '@minecraft/server-net';
const SERVER_EDITOR = '@minecraft/server-editor';
const VANILLA_DATA = '@minecraft/vanilla-data';
const MATH = '@minecraft/math';
const DATA = [VANILLA_DATA];
const ALL = [
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR,
	VANILLA_DATA,
	MATH
];
// === END NPM PACKAGES

// === NPM MIRRORS
const Mirrors = [
	'https://registry.npmmirror.com/',
	'https://registry.npmjs.org/'
];
// === END NPM MIRRORS

// === DEFAULT CODE
const DefaultCode =
	'/*\n _____________________ \n< do things u want... >\n--------------------- \n      \\   ^__^\n       \\  (oo)_______\n          (__)\\       )\\/\\\n              ||----w |\n              ||     ||\n*/';
// === END DEFAULT CODE

// === GULPFILE URL
const GULPFILE = 'https://serein.meowshe.com/gulpfile.js';
// === END GULPFILE URL

// === DEFUALT TSCONFIG
const TSCONFIG = {
	compilerOptions: {
		moduleResolution: 'node',
		lib: ['es2020', 'dom'],
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
	include: [],
	compileOnSave: false
};
// === END DEFAULT tsconfig

// === DEFAULT MCATTRIBUTES
const MCATTRIBUTES =
	'diagnostic.disable.minecraft.manifest.module.missing=true';
// === END DEFAULT MCATTRIBUTES

// === DEFAULT NPM DEPENDENCIES
const DEFAULT_NPM_DEPENDENCIES = {
	del: { npm: '7.0.0' },
	gulp: { npm: '^4.0.2' },
	'gulp-esbuild': { npm: '^0.11.0' },
	'gulp-typescript': { npm: '^6.0.0-alpha.1' },
	'gulp-zip': { npm: '^5.1.0' },
	'strip-json-comments': { npm: '^5.0.1' }
};
// === END DEFAULT NPM DEPENDENCIES

export {
	CLI_VERSION,
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR,
	VANILLA_DATA,
	MATH,
	DATA,
	ALL,
	Mirrors,
	DefaultCode,
	GULPFILE,
	TSCONFIG,
	MCATTRIBUTES,
	DEFAULT_NPM_DEPENDENCIES
};
