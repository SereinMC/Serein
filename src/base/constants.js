// === CLI INFORMATIONS
const CLI_VERSION = '1.4.3-patch';
// === END CLI INFORMATIONS

// === NPM PACKAGES
const SERVER = '@minecraft/server';
const SERVER_UI = '@minecraft/server-ui';
const SERVER_ADMIN = '@minecraft/server-admin';
const SERVER_GAMETEST = '@minecraft/server-gametest';
const SERVER_NET = '@minecraft/server-net';
const SERVER_EDITOR = '@minecraft/server-editor';
const VANILLA_DATA = '@minecraft/vanilla-data';
const DATA = [VANILLA_DATA];
const ALL = [
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR,
	VANILLA_DATA
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

export {
	CLI_VERSION,
	SERVER,
	SERVER_UI,
	SERVER_ADMIN,
	SERVER_GAMETEST,
	SERVER_NET,
	SERVER_EDITOR,
	VANILLA_DATA,
	DATA,
	ALL,
	Mirrors,
	DefaultCode,
	GULPFILE,
	TSCONFIG,
	MCATTRIBUTES
};
