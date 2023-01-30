# <center>Serein</center>

**Translation work is in progress and the documentation in this language is not yet complete.**

Serein is a scaffolding project developed for the [Minecraft: Bedrock Edition Script API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/) to help developers create and manage projects efficiently and elegantly.

View this document in [简体中文](README_zh-CN.md) | English

> Serein is unofficial and not from Minecraft or approved by Minecraft.  
> "Minecraft" is a trademark of Mojang Synergies AB

- 🚀 Create and manage projects efficiently
- 🛠️ Support JavaScript / TypeScript
- 📦 Automatically packing `mcpack`
- 🎛️ Automatically cross-platform (Windows/Linux/Android) deployment
- 💡 Build with `esbuild` and support for npm modules
- 🔌 Support for embedding into existing projects (under development)

[![asciicast](https://asciinema.org/a/555409.svg)](https://asciinema.org/a/555409)

### Getting Started

Make sure you have Node.js Stable version or newer.

```bash
npm i @pureeval/serein gulp gulp-cli -g

serein # get help
```

### Create A Template Project

Use `serein -i` or `serein --init` in an empty directory to create a template project interactively.

Use `-y` or `-yes` flag to create the project without asking any questions.

> On the Android platform, `npm link` may not work properly, so ignore the errors it throws.

### Build the project

Use `serein -b` or `serein --build` to build the current project.

Executing build in the project directory will automatically build the template Minecraft Resource Package structure in the `build` directory (but not package it to `.mcpack`).