// === REFRESH TAG = ERROR
// === CONFIGURABLE VARIABLES
import config from './.serein.json' assert { type: 'json' };
const output = config.output;
const pack_name = config.name;
const behPath = config.behPath;
const resPath = config.resPath;
const behManifestPath = config.behManifestPath;
const scriptsPath = config.scriptsPath;
const useMinecraftPreview = config.mc_preview;
const manifest = JSON.parse(
	stripJsonComments(readFileSync(behManifestPath, 'utf-8'))
);
const scriptEntry = (function () {
	for (const current of manifest.modules) {
		if (current.type === 'script') return current.entry;
	}
	return 'script module not found.';
})();
const esbuildConfig = config.esbuild;
const tsconfig = config.tsconfig;
// === END CONFIGURABLE VARIABLES

import os from 'os';
import gulp from 'gulp';
import zip from 'gulp-zip';
import { resolve } from 'path';
import ts from 'gulp-typescript';
import { deleteAsync } from 'del';
import { readFileSync } from 'fs';
import gulpEsbuild from 'gulp-esbuild';
import stripJsonComments from 'strip-json-comments';

const get_mojang_dir = () => {
	if (config.mc_dir !== null) return config.mc_dir;
	const homeDir = os.homedir();
	switch (process.platform) {
		case 'win32':
			return homeDir + useMinecraftPreview
				? '/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang/'
				: '/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/';
		case 'linux':
			return (
				homeDir +
				'/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/games/com.mojang/'
			);
	}
};

const mc_dir = get_mojang_dir();

const del_gen = (files) => (fn) => {
	deleteAsync(files).then(
		() => {
			fn();
		},
		() => {
			fn();
		}
	);
};

const clean_build = del_gen([output]);

function copy_behavior_packs() {
	return gulp
		.src([resolve(behPath, '**/*')])
		.pipe(gulp.dest(resolve(output, behPath)));
}

function copy_resource_packs() {
	return gulp
		.src([resolve(resPath, '**/*')])
		.pipe(gulp.dest(resolve(output, resPath)));
}

function compile_scripts() {
	return gulp
		.src(resolve(scriptsPath, '**/*.ts'))
		.pipe(
			ts(
				Object.assign(
					{
						module: 'es2020',
						moduleResolution: 'node',
						lib: ['es2020', 'dom'],
						strict: true,
						target: 'es2020'
					},
					tsconfig
				)
			)
		)
		.pipe(gulp.dest(resolve(output, 'scripts')));
}

function esbuild_system() {
	return gulp
		.src(resolve(output, scriptEntry))
		.pipe(
			gulpEsbuild(
				Object.assign(
					{
						outfile: scriptEntry,
						bundle: true,
						sourcemap: true,
						external: [
							'@minecraft/server-ui',
							'@minecraft/server',
							'@minecraft/server-net',
							'@minecraft/server-gametest',
							'@minecraft/server-admin',
							'@minecraft/server-editor',
							'@minecraft/vanilla-data'
						],
						format: 'esm'
					},
					esbuildConfig
				)
			)
		)
		.pipe(gulp.dest(resolve(output, behPath)));
}

function copy_scripts() {
	return gulp
		.src(resolve(scriptsPath, '**/*'))
		.pipe(gulp.dest(resolve(output, 'scripts')));
}

function pack_zip() {
	return gulp
		.src(resolve(output, '**/*'))
		.pipe(zip(`${pack_name}.mcpack`))
		.pipe(gulp.dest(config.output || '.'));
}

const del_build_scripts = del_gen([resolve(output, scriptsPath)]);

function clean_local(fn) {
	if (!pack_name || !pack_name.length || pack_name.length < 2) {
		console.log('No pack folder specified.');
		fn();
		return;
	}
	del_gen([
		resolve(mc_dir, 'development_behavior_packs/', pack_name),
		resolve(mc_dir, 'development_resource_packs/', pack_name)
	])(fn);
}

function deploy_local_mc_behavior_packs() {
	return gulp
		.src([resolve(output, behPath, '**/*')])
		.pipe(
			gulp.dest(resolve(mc_dir, 'development_behavior_packs/', pack_name))
		);
}

function deploy_local_mc_resource_packs() {
	return gulp
		.src([resolve(output, resPath, '**/*')])
		.pipe(
			gulp.dest(resolve(mc_dir, 'development_resource_packs/', pack_name))
		);
}

function watch() {
	return gulp.watch(
		[
			resolve(behPath, '**/*'),
			resolve(resPath, '**/*'),
			resolve(scriptsPath, '**/*')
		],
		gulp.series(build, deploy)
	);
}

const copy_content = gulp.parallel(copy_behavior_packs, copy_resource_packs);

const clean_and_copy = gulp.series(clean_build, copy_content);

const build =
	config.language === 'ts'
		? gulp.series(
				clean_and_copy,
				compile_scripts,
				esbuild_system,
				del_build_scripts
		  )
		: gulp.series(
				clean_and_copy,
				copy_scripts,
				esbuild_system,
				del_build_scripts
		  );

const bundle = gulp.series(build, del_build_scripts, pack_zip);

const deploy = gulp.series(
	clean_local,
	gulp.parallel(
		deploy_local_mc_behavior_packs,
		deploy_local_mc_resource_packs
	)
);

const default_action = gulp.series(build, deploy);

export {
	build,
	bundle,
	clean_and_copy as cc,
	deploy,
	default_action as default,
	watch,
	compile_scripts as cs,
};
