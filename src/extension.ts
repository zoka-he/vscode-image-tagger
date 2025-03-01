import * as vscode from 'vscode';
import { AnnotationPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {

    let myCommandId = 'imageTagger.open';

    // 注册右键目录打开插件命令
    let disposable = vscode.commands.registerCommand(myCommandId, (uri: vscode.Uri | null) => {
        AnnotationPanel.createOrShow(context, uri?.fsPath || null);
    });
    

    // 创建状态栏按钮
    let statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarButton.command = myCommandId;  // 按钮点击时执行的命令
    statusBarButton.text = 'Image Tagger';           // 设置按钮的文本或图标

    // 将按钮添加到扩展的上下文订阅中
    context.subscriptions.push(disposable);
    context.subscriptions.push(statusBarButton);

    // 显示按钮
    statusBarButton.show(); 
}

export function deactivate() {}
