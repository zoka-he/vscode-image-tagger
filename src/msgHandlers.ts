import * as vscode from 'vscode';
import PathService from './pathService';
import { TaggerPanelMgr } from './panel';

async function onOpenFileDialog(panel: vscode.WebviewPanel) {
    const uri = await vscode.window.showOpenDialog({
        canSelectFiles: true, // 允许选择文件
        canSelectFolders: true, // 允许选择文件夹
        canSelectMany: false, // 只选一个
        defaultUri: vscode.Uri.file(PathService.getWorkDir() || '') // 默认路径是工作目录
    });

    if (uri && uri.length > 0) {
        // 发送选中的路径回 Webview
        panel.webview.postMessage({ command: "updateFilePath", path: uri[0].fsPath });
    }
}

function updateFilePath(panel: vscode.WebviewPanel, message: any, panelMgr: TaggerPanelMgr) {
    panel.webview.postMessage({ command: "updateFilePath", path: panelMgr.imageDir || '' });
}

const handleMap: { [key: string]: (panel: vscode.WebviewPanel, message: any, panelMgr: TaggerPanelMgr) => any } = {
    openFileDialog: onOpenFileDialog,   // 前端打开文件夹，则返回打开的路径
    getFilePath: updateFilePath,    // 前端请求路径，则返回路径
}

export default handleMap;