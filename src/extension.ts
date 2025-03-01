import * as vscode from 'vscode';
import { AnnotationPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('imageAnnotator.open', (uri: vscode.Uri) => {
        AnnotationPanel.createOrShow(context.extensionUri, uri.fsPath);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
