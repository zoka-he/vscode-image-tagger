import * as vscode from 'vscode';
import * as path from 'path';
import { FileService } from './fileService';

export class AnnotationPanel {
    public static currentPanel: AnnotationPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private imageDir: string | null;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, imageDir: string | null) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.imageDir = imageDir;

        this.panel.onDidDispose(() => {
            AnnotationPanel.currentPanel = undefined;
        });

        // this.update();
    }

    public static createOrShow({ extensionUri, extensionPath }: vscode.ExtensionContext, imageDir: string | null) {
        if (AnnotationPanel.currentPanel) {
            AnnotationPanel.currentPanel.panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'ImageTagger',
            'Image Tagger',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'out', 'webview'))],
            }
        );

        // 获取本地 Vue.js 文件的 URI
        // const scriptUri = vscode.Uri.file(path.join(extensionPath, 'out', 'webview', 'index.js')).with({ scheme: 'vscode-resource' });
        const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'out', 'webview', 'main.iife.js')));
        // const scriptUri = './index.js'
        
        panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Image Tagger</title>
            </head>
            <body>
                <div class="container">
                    <div id="app" class="vueapp"></div>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;

        AnnotationPanel.currentPanel = new AnnotationPanel(panel, extensionUri, imageDir);
    }

    // private async update() {
    //     const images = await FileService.getImages(this.imageDir);
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
