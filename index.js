#!/usr/bin/env node
const version = "1.0.0";

import chalk from "chalk";
import { program } from "commander";

const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');

program.name("serein").description("A Minecraft Bedrock creation manage tool.").version(version);