# <center>Serein</center>

Serein 是一个为 [Minecraft: Bedrock Edition Script API](https://learn.microsoft.com/zh-CN/minecraft/creator/scriptapi/) 开发的脚手架项目，帮助开发者高效、优雅地创建和管理项目。

查看此文档的 [English](README.md) | 简体中文 版本

> 但请注意，该产品不是 Minecraft 官方产品、不是来自 Minecraft 或者未经 Minecraft 认可。  
> “Minecraft”是 Mojang Synergies AB 的商标。

- 🚀 高效地创建和管理项目
- 🛠️ 支持 JavaScript / TypeScript
- 📦 自动打包资源包到 `mcpack`。
- 🎛️ 支持跨平台（Windows/Linux/Android）部署与热重载资源包
- 💡 使用 `esbuild` 构建项目代码，支持打包 npm 依赖
- 🪐 为每个项目生成独一无二的 "pack_icon"
- 🔌 支持嵌入到现有项目中（开发中）

[![asciicast](https://asciinema.org/a/600096.svg)](https://asciinema.org/a/600096)

### 快速开始

请确保您有 Nodejs Stable 及以上的版本。

```bash
npm i @pureeval/serein gulp-cli -g

serein # get help
```

#### 小提示
由于 `npm` 包管理工具可能在安装某些依赖时表现不佳（比如用时过长等），如果您的环境中有 `pnpm` 包管理工具，则 Serein 将会优先采用它。

你也可以使用以下方法安装 `pnpm` 工具，它是一个比 `npm` 更优秀的包管理器！

```bash
npm i pnpm -g

pnpm --version
```

#### 创建项目

Serein 提供了语义相同的长参数 `init` 与短参数 `i` 以创建项目，在您的项目文件夹中执行该命令即可开启引导。接下来通过回答引导的问题，工具就可以帮你构建一个量身定做的模板项目。

添加 `-y/--yes` 参数可以跳过引导直接采用默认配置初始化项目。

请注意：如果您是 android 平台的用户，当最后一步安装模块时出现 `symlink` 相关的错误，请忽略它，其不会对 Serein 的使用造成影响。

#### 构建项目

Serein 提供了语义相同的长参数 `build` 与短参数 `b` 构建项目。

在项目根目录执行该命令可以自动创建模板资源包（不打包）并放在 `build` 目录下。

#### 打包项目

Serein 提供了语义相同的长参数 `pack` 与短参数 `p` 以构建和打包项目。

在项目根目录执行该命令可以自动创建模板资源包并且打包为 `.mcpack` 并输出在 `build` 目录下。

#### 部署项目

Serein 提供了语义相同的长参数 `deploy` 与短参数 `d` 以构建和部署项目。

- 对于 Windows 平台，在项目根目录执行该命令可以自动创建资源包并且直接部署至游戏目录。

- 对于 Linux 平台，我们支持对使用 `mcpelauncher` 启动的游戏的自动部署，如果您使用其他启动器或者有其他游戏目录，请看其他平台的配置方案。

- 对于其他平台，您可以在项目初始化后修改 `.serein.json` 中的 `mc_dir` 为您的游戏目录。

#### 热重载

Serein 提供了语义相同的长参数 `watch` 与短参数 `w` 以实时热重载项目到游戏中。

在项目根目录执行该命令后，Serein 将会监视 `behavior_packs` 与 `resource_packs` 两个目录，一旦其中的文件发生改变，就会重新构建项目并部署到游戏。

#### 更改依赖版本

目前的 Script API 迭代速度非常快，而且文档紧跟版本更新，过时版本的开发者资源和游戏可能会因此出现破坏性问题。

Serein 提供了长参数 `switch` 与 `s` 以更改您项目中的 manifest 依赖与 npm 依赖版本。

在根目录执行该命令可以开启版本切换引导，您可以通过引导重新指定依赖版本并安装依赖项。

添加 `-y/--yes` 参数可以直接更新到最新的依赖（我们不推荐在有 `@minecraft/server` 之外的依赖时使用）。

### 贡献

Serein 刚刚诞生，仍有诸多的问题和功能还未实现，两位主要作者[@Lampese](https://github.com/Lampese)、[@CAIMEOX](https://github.com/CAIMEOX)目前都还是高中学生，时间非常有限。

如果您对项目有疑问、改进的建议，欢迎提出 issue 或发邮件到 me@lampese.com。

如果您希望对项目作出贡献，我们欢迎 Pull Request，即使它可能最初是错误的。

### 特别鸣谢

- 感谢 [@Silvigarabis](https://github.com/Silvigarabis), [@MeowShe](https://github.com/MeowShe), [@xboyminemc](https://github.com/xboyminemc), [@HappyTigerV](https://github.com/HappyTigerV) 对该工具测试作出的贡献。
- 感谢 [@MeowShe](https://github.com/MeowShe) 提供的 CDN 服务。
- 感谢 cowsay 工具贡献的一头牛。
