# Image Tagger

## 概述

Image Tagger 是一款用于 VS Code 的扩展，它可以帮助用户使用文本文件对图像进行标注。该扩展提供了直观的界面，方便用户在工作区中浏览和管理图像，并为每个图像添加标签。

## 安装步骤

要安装 Image Tagger 扩展，您可以按照以下步骤操作：

1. **克隆仓库** ：将项目仓库克隆到本地机器。

   ```bash
   git clone https://github.com/zoka-he/vscode-image-tagger.git
   ```

2. **安装依赖** ：进入克隆的项目目录，并安装所需的依赖项。

   ```bash
   cd vscode-image-tagger
   npm install
   ```

3. **构建项目** ：运行构建命令以生成扩展文件。
   ```bash
   npm run build
   ```

4. **安装扩展** ：在项目根目录下找到生成的 `.vsix` 文件（通常在构建过程完成后会生成），然后在 VS Code 中通过以下方式安装：

* 打开 VS Code，按下 `Ctrl+Shift+X`（Windows/Linux）或 `Cmd+Shift+X`（Mac）打开扩展视图。
* 点击扩展视图右上角的三个点，选择“从 VSIX 安装”。
* 选择您刚刚生成的 `.vsix` 文件，然后按照提示完成安装。

## 使用方法

安装完成后，您可以通过以下方式使用 Image Tagger：

* **打开 Image Tagger** ：在资源管理器中右键单击一个文件夹，选择“Open in Image Tagger”。
* **浏览图像** ：在 Image Tagger 面板中，您可以浏览所选文件夹中的所有图像。
* **添加标签** ：为每个图像添加对应的文本标签，标签将保存为与图像同名的 `.txt` 文件。

## 项目脚本

项目中提供了一些有用的脚本，您可以使用以下命令：

* `npm run compile`：编译 TypeScript 代码并构建前端项目。
* `npm run watch`：监听 TypeScript 文件的变化并自动编译。
* `npm run test`：运行测试。
* `npm run package`：打包扩展为 `.vsix` 文件。
* `npm run build`：编译项目并打包扩展。

## 贡献

如果您想为 Image Tagger 项目做出贡献，请遵循以下步骤：

1. **Fork 仓库** ：在 GitHub 上 fork 项目仓库。
2. **创建分支** ：在您的本地仓库中创建一个新的分支。
3. **进行更改** ：在新分支上进行您的更改。
4. **提交拉取请求** ：将您的更改提交到主仓库的拉取请求中。

## 许可证

本项目采用 MIT 许可证，请参阅LICENSE文件。
