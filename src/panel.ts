import * as vscode from 'vscode';
import * as path from 'path';
import { FileService } from './services/fileService';
import msgHandlers from './msgHandlers';
import PathService from './services/pathService';
import LogService from './services/logService';

export class TaggerPanelMgr {
    public static currentMgr: TaggerPanelMgr | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    public imageDir: string | null;

    private constructor(context: vscode.ExtensionContext, imageDir: string | null) {

        let { extensionUri, extensionPath } = context;

        if (!imageDir) {
            imageDir = PathService.getWorkDir() || '';
        }

        this.extensionUri = extensionUri;
        this.imageDir = imageDir;



        // 创建一个新的 Webview 面板
        const panel = vscode.window.createWebviewPanel(
            'ImageTagger',
            'Image Tagger',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'out', 'webview'))] // 允许访问所有文件
            }
        );

        // 获取本地 Vue.js 文件的 URI
        const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'out', 'webview', 'main.iife.js')));
        const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'out', 'webview','main.css')));
        
        panel.webview.html = `
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


        // 监听 Webview 发送的消息，并处理它们
        panel.webview.onDidReceiveMessage(
            async (message) => {
                LogService.log(message);
                let handler = msgHandlers[message.command];
                if (handler) {
                    handler(panel, message, this);
                }
            },
            undefined,
            context.subscriptions
        );

        panel.onDidDispose(() => {
            TaggerPanelMgr.currentMgr = undefined;
        });

        this.panel = panel;

        // this.update();
    }

    public static createOrShow(context: vscode.ExtensionContext, imageDir: string | null) {
        // 如果已经有一个面板，则复用它
        if (TaggerPanelMgr.currentMgr) {
            // 调出面板
            let panel = TaggerPanelMgr.currentMgr.panel;
            panel.reveal(vscode.ViewColumn.One);
            // 请求更新工作路径
            panel.webview.postMessage({ command: "updateFilePath", path: imageDir || '' });

            // TODO 更新管理器的工作路径（后续需得到面板的同意才能更新）
            TaggerPanelMgr.currentMgr.imageDir = imageDir;

            return;
        }

        // 切换到新的panel
        TaggerPanelMgr.currentMgr = new TaggerPanelMgr(context, imageDir);
    }

    // private async update() {
    //     const images = await FileService.getImageNames(this.imageDir);
    //     const webviewUri = vscode.Uri.joinPath(this.extensionUri, 'out', 'webview', 'index.html');
    //     const content = (await vscode.workspace.fs.readFile(webviewUri)).toString();

    //     this.panel.webview.html = content.replace(
    //         '{{imageList}}',
    //         JSON.stringify(images)
    //     );

    //     this.panel.webview.onDidReceiveMessage(async (message) => {
    //         if (message.command === 'loadText') {
    //             const text = await FileService.readText(message.filePath);
    //             this.panel.webview.postMessage({ command: 'displayText', text });
    //         } else if (message.command === 'saveText') {
    //             await FileService.writeText(message.filePath, message.text);
    //         }
    //     });
    // }
}
