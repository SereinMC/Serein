// === CONFIGURABLE VARIABLES
import config from "./.serein.json" assert { type: "json" };
import manifest from "./behavior_packs/manifest.json" assert { type: "json" };
const pack_name = config.name;
const useMinecraftPreview = config.mc_preview; // Whether to target the "Minecraft Preview" version of Minecraft vs. the main store version of Minecraft
const script_entry = manifest.modules[0].entry;
// === END CONFIGURABLE VARIABLES

import zip from "gulp-zip";
import gulp from "gulp";
import ts from "gulp-typescript";
import { deleteAsync } from "del";
import os from "os";
import gulpEsbuild from "gulp-esbuild";
import { join } from "path";

const get_Mojang_dir = () => {
  if (config.mc_dir !== null) return config.mc_dir;
  const homeDir = os.homedir();
  switch (process.platform) {
    case "win32":
      return homeDir + useMinecraftPreview
        ? "/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang/"
        : "/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/";
    case "linux":
      return (
        homeDir +
        "/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/games/com.mojang/"
      );
    case "android":
      break;
  }
};
const mc_dir = get_Mojang_dir();

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

const clean_build = del_gen(["build"]);

function copy_behavior_packs() {
  return gulp
    .src(["behavior_packs/**/*"])
    .pipe(gulp.dest("build/behavior_packs"));
}

function copy_resource_packs() {
  return gulp
    .src(["resource_packs/**/*"])
    .pipe(gulp.dest("build/resource_packs"));
}

const copy_content = gulp.parallel(copy_behavior_packs, copy_resource_packs);

function compile_scripts() {
  return gulp
    .src("scripts/**/*.ts")
    .pipe(
      ts({
        module: "es2020",
        moduleResolution: "node",
        lib: ["es2020", "dom"],
        strict: true,
        target: "es2020",
      })
    )
    .pipe(gulp.dest("build/scripts"));
}

function esbuild_system() {
  return gulp
    .src("build/" + script_entry)
    .pipe(
      gulpEsbuild({
        outfile: script_entry,
        bundle: true,
        external: [
          "@minecraft/server-ui",
          "@minecraft/server",
          "@minecraft/server-net",
          "@minecraft/server-gametest",
          "@minecraft/server-admin",
        ],
        format: "esm",
      })
    )
    .pipe(gulp.dest("build/behavior_packs/"));
}

function copy_scripts() {
  return gulp.src("scripts/**/*").pipe(gulp.dest("build/"));
}

function pack_zip() {
  return gulp
    .src("./build/**/*")
    .pipe(zip(`${pack_name}.mcpack`))
    .pipe(gulp.dest(config.output || "."));
}

const del_build_scripts = del_gen(["build/scripts"]);
const clean_and_copy = gulp.series(clean_build, copy_content);
const build =
  config.type === "ts"
    ? gulp.series(clean_and_copy, compile_scripts, esbuild_system)
    : gulp.series(clean_and_copy, copy_scripts, esbuild_system);
const bundle = gulp.series(build, del_build_scripts, pack_zip);

function clean_local(fn) {
  if (!pack_name || !pack_name.length || pack_name.length < 2) {
    console.log("No pack folder specified.");
    fn();
    return;
  }
  del_gen([
    join(mc_dir, "development_behavior_packs/", pack_name),
    join(mc_dir, "development_resource_packs/", pack_name),
  ])(fn);
}

function deploy_local_mc_behavior_packs() {
  return gulp
    .src(["build/behavior_packs/**/*"])
    .pipe(gulp.dest(join(mc_dir, "development_behavior_packs/", pack_name)));
}

function deploy_local_mc_resource_packs() {
  return gulp
    .src(["build/resource_packs/**/*"])
    .pipe(gulp.dest(join(mc_dir, "development_resource_packs/", pack_name)));
}

const deploy = gulp.series(
  clean_local,
  gulp.parallel(deploy_local_mc_behavior_packs, deploy_local_mc_resource_packs)
);

function watch() {
  return gulp.watch(
    ["behavior_packs/**/*", "resource_packs/**/*"],
    gulp.series(build, deploy)
  );
}

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
