import * as vscode from 'vscode';

export default class PathService {
    static getWorkDir(): string | undefined {
        const folders = vscode.workspace.workspaceFolders;
        return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
    }
}