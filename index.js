#!/usr/bin/env node
const version = "1.0.8";

const readlineSync = require("readline-sync");
const program = require("commander");
const path = require("path");
const { v4: uuid } = require("uuid");
const request = require("request");
const chalk = require("chalk");
const fs = require("fs");
const cp = require("node:child_process");

const error = chalk.bold.magenta;
const warning = chalk.hex("#FFA500");
const accept = chalk.bold.green;
const done = accept("[done]");
program
  .name("serein")
  .description("A Minecraft Bedrock creation manage tool.")
  .version(version, "-v, --version");

program
  .command("init")
  .alias("i")
  .description("init a project")
  .action(async () => {
    try {
      console.log(
        warning("This utility will walk you through creating a project.")
      );
      console.log("Press ^C at any time to quit.");
      const name =
        readlineSync.question(
          `project name: (${path.basename(process.cwd())}) `
        ) || path.basename(process.cwd());
      const version = readlineSync.question("version: (1.0.0) ") || "1.0.0";
      const versionArray = version.split(".").map((x) => parseInt(x));
      const description = readlineSync.question("description: ") || "";
      const server_ui =
        readlineSync.question(
          `Require ${error("@minecraft/server-ui")}? yes/no (${accept("no")}) `
        ) === "yes"
          ? true
          : false;
      const server_admin =
        readlineSync.question(
          `Require ${error("@minecraft/server-admin")}? yes/no (${accept(
            "no"
          )}) `
        ) === "yes"
          ? true
          : false;
      const server_gametest =
        readlineSync.question(
          `Require ${error("@minecraft/server-gamtest")}? yes/no (${accept(
            "no"
          )}) `
        ) === "yes"
          ? true
          : false;
      const server_net =
        readlineSync.question(
          `Require ${error("@minecraft/server-net")}? yes/no (${accept("no")}) `
        ) === "yes"
          ? true
          : false;
      const res =
        readlineSync.question(
          `Create ${error("resource_packs")}? yes/no (${warning("yes")})`
        ) === "no"
          ? false
          : true;
      const allow_eval =
        readlineSync.question(
          `Allow ${error("eval")} and ${error(
            "new Function"
          )}? yes/no (${accept("no")}) `
        ) === "yes"
          ? true
          : false;
      const language =
        readlineSync.question(
          `Language: js/ts (${accept(
            "ts"
          )})`
        ) === "js" || "ts";

      process.stdout.write("Downloading the lastest dependence version...  ");
      const versionsStr = await req(
        "https://raw.githubusercontent.com/LoveCouple/serein/main/version.json"
      );
      console.log(done);
      const versions = JSON.parse(versionsStr);

      process.stdout.write("Downloading the gulpfile...  ");
      const gulpfile = await req(
        "https://raw.githubusercontent.com/LoveCouple/serein/main/gulpfile.js"
      );
      console.log(done);

      const resuuid = uuid();
      process.stdout.write("Generating project icon... ");
      const icon = await req(
        "https://github.com/LoveCouple/serein/raw/main/pack_icon.png"
      );
      console.log(done);

      console.log("Creating project directory and files... ");
      await mkdir(["behavior_packs", "behavior_packs/script", "scripts"]);
      if (res) await mkdir(["resource_packs"]);
      fs.writeFileSync("behavior_packs/pack_icon.png", icon);
      writeJSON(".serein.json", {
        type: language,
        res: res,
        name: name,
        mc_preview: false,
        bds: false,
        bds_path: "~/bds/",
        output: "build",
        mc_dir: null,
      });

      const toDependencies = (name) => {
        return {
          module_name: name,
          version: versions[name],
        };
      };
      const dependencies = [toDependencies("@minecraft/server")];

      if (res)
        dependencies.push({
          uuid: resuuid,
          version: versionArray,
        });
      if (server_admin)
        dependencies.push(toDependencies("@minecraft/server-admin"));
      if (server_gametest)
        dependencies.push(toDependencies("@minecraft/server-gametest"));
      if (server_net)
        dependencies.push(toDependencies("@minecraft/server-net"));
      if (server_ui) dependencies.push(toDependencies("@minecraft/server-ui"));

      writeJSON("behavior_packs/manifest.json", {
        format_version: 2,
        header: {
          name: name,
          description: description,
          uuid: uuid(),
          version: versionArray,
          min_engine_version: [1, 19, 20],
        },
        modules: [
          {
            description: "Script resources",
            language: "javascript",
            type: "script",
            uuid: uuid(),
            version: [2, 0, 0],
            entry: "scripts/main.js",
          },
        ],
        dependencies: dependencies,
        capabilities: allow_eval ? ["script_eval"] : [],
      });

      if (res) {
        fs.writeFileSync("resource_packs/pack_icon.png", icon);
        writeJSON("resource_packs/manifest.json", {
          format_version: 2,
          header: {
            description: description,
            name: name,
            uuid: resuuid,
            version: versionArray,
            min_engine_version: [1, 19, 20],
          },
          modules: [
            {
              description: description,
              type: "resources",
              uuid: uuid(),
              version: versionArray,
            },
          ],
        });
      }
      writeJSON("package.json", {
        name: name,
        version: version,
        type: "module",
        description: description,
        dependencies: {
          "@minecraft/server": "^1.0.0",
          "@minecraft/server-admin": "^1.0.0-beta.11940b24",
          "@minecraft/server-gametest": "^1.0.0-beta.11940b24",
          "@minecraft/server-net": "^1.0.0-beta.11940b24",
          "@minecraft/server-ui": "^1.0.0-beta.11940b24",
          del: "7.0.0",
          gulp: "^4.0.2",
          "gulp-cli": "^2.3.0",
          "gulp-esbuild": "^0.11.0",
          "gulp-typescript": "^6.0.0-alpha.1",
          "gulp-zip": "^5.1.0",
        },
      });

      if (language === "ts") {
        writeJSON("tsconfig.json", {
          compilerOptions: {
            target: "es2020",
            moduleResolution: "node",
            module: "es2020",
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
            outDir: "build/",
            rootDir: ".",
            baseUrl: "behavior_packs/",
            listFiles: false,
            noEmitHelpers: true,
          },
          include: ["scripts/**/*"],
          exclude: [],
          compileOnSave: false,
        });
        writeText(
          "scripts/main.ts",
          "/*\n _____________________ \n< do things u want... >\n--------------------- \n      \\   ^__^\n       \\  (oo)_______\n          (__)\\       )\\/\\\n              ||----w |\n              ||     ||\n*/"
        );
      } else {
        writeText(
          "scripts/main.js",
          "/*\n _____________________ \n< do things u want... >\n--------------------- \n      \\   ^__^\n       \\  (oo)_______\n          (__)\\       )\\/\\\n              ||----w |\n              ||     ||\n*/"
        );
      }

      writeText(
        ".mcattributes",
        "diagnostic.disable.minecraft.manifest.module.missing=true"
      );
      writeText("gulpfile.js", gulpfile);
      exec("npm install");
    } catch (e) {
      console.log(e);
    }
  });

program
  .command("build")
  .alias("b")
  .description("build scripts to product")
  .action(() => exec("gulp build"));

program
  .command("deploy")
  .alias("d")
  .description("deploy project to game")
  .action(() => exec("gulp"));

program
  .command("pack")
  .alias("p")
  .description("build .mcpack form project")
  .action(() => exec("gulp bundle"));

program
  .command("update")
  .alias("u")
  .description("update project to follow lastest Minecraft")
  .action(async () => {
    try {
      console.log("Synchronizing to the latest version...");
      const versions = await req(
        "https://raw.githubusercontent.com/LoveCouple/serein/main/version.json"
      );
      const versionJSON = JSON.parse(versions);
      let manifest = JSON.parse(
        fs.readFileSync("behavior_packs/manifest.json")
      );
      for (const idx in manifest["dependencies"]) {
        const x = manifest["dependencies"][idx]["module_name"];
        if (x in versionJSON) {
          if (versionJSON[x] != manifest["dependencies"][idx]["version"]) {
            manifest["dependencies"][idx]["version"] = versionJSON[x];
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  });

program.parse(process.argv);

function req(options) {
  return new Promise((resolve, reject) => {
    request(
      {
        url: options,
        method: "GET",
        encoding: null,
      },
      (err, res, body) => {
        if (err) reject(err);
        else resolve(body);
      }
    );
  });
}

function mkdir(dirs) {
  return new Promise((resolve, reject) => {
    try {
      for (let x of dirs) {
        fs.mkdirSync(x);
        console.log(x, done);
      }
    } catch (e) {
      reject(e);
    }
    resolve();
  });
}

function writeText(filename, text) {
  fs.writeFileSync(filename, text);
  console.log(filename, done);
}

function writeJSON(filename, obj) {
  fs.writeFileSync(filename, JSON.stringify(obj, null, "\t"));
  console.log(filename, done);
}

function exec(command) {
  cp.execSync(command, { stdio: [0, 1, 2] });
}
