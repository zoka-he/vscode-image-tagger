import * as vscode from 'vscode';
import * as path from 'path';
import msgHandlers from './msgHandlers';
import PathService from './services/pathService';
import LogService from './services/logService';

export class TaggerPanel {
    private initDir: string | null = null;
    private currentDir: string | null = null;
    private panel: vscode.WebviewPanel | undefined;

    private constructor(context: vscode.ExtensionContext, imageDir: string | null) {

        let { extensionPath } = context;

        if (!imageDir) {
            imageDir = PathService.getWorkDir() || '';
        }

        this.initDir = imageDir;
        this.currentDir = imageDir;
        const dirName = path.basename(imageDir);



        // 创建一个新的 Webview 面板
        const panel = vscode.window.createWebviewPanel(
            'ImageTagger', // 面板类型
            'Image Tagger - ' + dirName, // 面板标题
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'out', 'webview'))], // 允许访问资源文件
                retainContextWhenHidden: true, // 隐藏时保持内容
            }
        );

        // 获取本地 Vue.js 文件的 URI
        const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'out', 'webview', 'main.iife.js')));
        const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'out', 'webview','main.css')));
        
        const generatedHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} vscode-webview-resource: data:; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
                <title>Image Tagger</title>
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div id="app" class="vueapp"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;

        panel.webview.html = generatedHtml;

        let watchdogTimeout: NodeJS.Timeout | undefined;

        // 重置看门狗
        function resetWatchdog() {
            if (watchdogTimeout) {
                clearTimeout(watchdogTimeout);
            }
            watchdogTimeout = setTimeout(() => {
                console.log('panel die');

                // BUG 由于搜索时，会被不明原因销毁，只能重新创建面板
                panel.dispose();
                new TaggerPanel(context, imageDir);
            }, 1000);
        }

        // 监听 Webview 发送的消息，并处理它们
        panel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command === 'heartbeat') {
                    // console.log('Webview 仍然活跃');
                    resetWatchdog();
                } else {
                    LogService.log(message);
                    let handler = msgHandlers[message.command];
                    if (handler) {
                        handler(panel, message, this);
                    }
                }
            },
            undefined,
            context.subscriptions
        );

        panel.onDidDispose(() => {
            LogService.log('Panel disposed');
            clearTimeout(watchdogTimeout);
        });

        this.panel = panel;

        // 初始化看门狗
        resetWatchdog();
    }

    public static create(context: vscode.ExtensionContext, imageDir: string | null) {
        new TaggerPanel(context, imageDir);
    }

    /**
     * 获取初始化目录
     * @returns 初始化目录
     */
    public getInitDir() {
        return this.initDir || '';
    }

    /**
     * 修改面板的标题
     * @param title 新的标题
     */
    public setPanelTitle(title: string) {
        if (this.panel) {
            this.panel.title = title;
        }
    }

    /**
     * 修改当前目录
     * @returns 当前目录
     */
    public setCurrentDir(dir: string) {
        this.currentDir = dir;
        this.setPanelTitle('Image Tagger - '+ path.basename(dir));
    }

}
