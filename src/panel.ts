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

        this.update();
    }

    public static createOrShow(extensionUri: vscode.Uri, imageDir: string | null) {
        if (AnnotationPanel.currentPanel) {
            AnnotationPanel.currentPanel.panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'imageTagger',
            'Image Tagger',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview')],
            }
        );

        AnnotationPanel.currentPanel = new AnnotationPanel(panel, extensionUri, imageDir);
    }

    private async update() {
        const images = await FileService.getImages(this.imageDir);
        const webviewUri = vscode.Uri.joinPath(this.extensionUri, 'webview', 'index.html');
        const content = (await vscode.workspace.fs.readFile(webviewUri)).toString();

        this.panel.webview.html = content.replace(
            '{{imageList}}',
            JSON.stringify(images)
        );

        this.panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'loadText') {
                const text = await FileService.readText(message.filePath);
                this.panel.webview.postMessage({ command: 'displayText', text });
            } else if (message.command === 'saveText') {
                await FileService.writeText(message.filePath, message.text);
            }
        });
    }
}
