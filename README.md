# <center>Serein</center>

Serein 是一个为 [Minecraft: Bedrock Edition Script API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/) 开发的脚手架项目，帮助开发者创建和管理项目。

> 但请注意，该产品不是 Minecraft 官方产品、不是来自 Minecraft 或者未经 Minecraft 认可。  
> “Minecraft”是 Mojang Synergies AB 的商标。

- [x] 快速创建和初始化项目
- [x] 支持 JavaScript/TypeScript
- [x] 自动将依赖包滚更新至最新版本
- [x] 自动打包资源包到 .mcpack
- [x] 多平台(Windows/Linux/Android) 自动部署
- [x] 使用 esbuild 处理代码，支持使用 npm 依赖
- [ ] 支持嵌入到已有项目
- [ ] 自动引入 eslint 实现代码规范管理
- [ ] 生成随机 pack_icon

[![asciicast](https://asciinema.org/a/PmpUdP5ZfM8s7swWSRVE8edqv.svg)](https://asciinema.org/a/PmpUdP5ZfM8s7swWSRVE8edqv)

### 快速开始

请确保您有 Nodejs Stable 及以上的版本。

```bash
npm i @pureeval/serein gulp gulp-cli -g

serein # get help
```

#### 创建项目

Serein 提供了语义相同的长参数 `init` 与短参数 `i` 以创建项目，在你的项目文件夹中执行该命令即可开启引导。接下来通过回答引导的问题，工具就可以帮你搭建一个量身定做的模板项目。

请注意：如果您的平台是 android，当最后一步安装模块时出现 `link` 相关的错误是可以忽略的。

#### 搭建项目

Serein 提供了语义相同的长参数 `build` 与短参数 `i` 搭建项目。

在项目根目录执行该命令可以自动创建模板资源包（不打包）并放在 `build` 目录下。

#### 打包项目

Serein 提供了语义相同的长参数 `pack` 与短参数 `p` 以搭建和打包项目。

在项目根目录执行该命令可以自动创建模板资源包并且打包为 `.mcpack` 并输出在 `build` 目录下。

#### 部署项目

Serein 提供了语义相同的长参数 `deploy` 与短参数 `d` 以搭建和部署项目。

- 对于 Windows 平台，在项目根目录执行该命令可以自动创建资源包并且直接部署至游戏目录。

- 对于 Linux 平台，我们支持对使用 `mcpelauncher` 启动的游戏的自动部署，如果您使用其他启动器或者有其他游戏目录，请看其他平台的配置方案。

- 对于其他平台，您可以早项目初始化后修改 `.serein.json` 中的 `mc_dir` 为您的游戏目录。

#### 更改依赖版本

目前的 Script API 迭代速度非常快，而且文档紧跟版本更新，过时版本的开发者资源和游戏可能会因此出现破坏性问题。

Serein 提供了长参数 `switch` 与 `s` 以更改您项目中的 manifest 依赖与 npm 依赖版本。

在根目录执行该命令可以开启版本切换引导，您可以通过引导重新指定依赖版本并安装依赖项。

### 贡献

Serein 刚刚诞生，仍有诸多的问题和功能还未实现，两位主要作者目前都还是高中学生，时间非常有限。

如果您对项目有疑问、改进的建议，欢迎提出 issue 或发邮件到 me@lampese.com。

如果您希望对项目作出贡献，我们欢迎 Pull Request，即使它可能最初是错误的。

### 特别鸣谢

- 感谢 Silvigarabis, 不舍, 云梦 对该工具测试作出的贡献。
- 感谢 BuShe 提供的 CDN 服务。
- 感谢 cowsay 工具贡献的一头牛。
