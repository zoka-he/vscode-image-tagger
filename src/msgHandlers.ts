import * as vscode from 'vscode';
import PathService from './services/pathService';
import { TaggerPanelMgr } from './panel';
import LogService from './services/logService';
import { FileService } from './services/fileService';
import path from 'path';

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

async function getImageNames(panel: vscode.WebviewPanel, message: any) {
    const path = message?.path;
    if (!path) {
        return;
    }

    const images = await FileService.getImageNames(path);
    panel.webview.postMessage({ command: "updateImgNames", imageNames: images });
}

/**
 * 获取指定目录下所有图片的信息，并将其分多条信息发送到 Webview 面板。
 * 
 * @param panel - 用于与 Webview 进行通信的面板。
 * @param message - 包含请求信息的消息对象，预期包含 `path` 属性指定图片目录。
 */
async function getImageInfos(panel: vscode.WebviewPanel, message: any) {

    // 检测路径存在
    const dirPath = message?.path;
    if (!dirPath) {
        return;
    }   

    // 遍历目录下的图片文件
    const imageNames = await FileService.getImageNames(dirPath);
    let loadCnt = 0;
    for(const name of imageNames) {

        // 读取图片文件并转换为 Base64 编码
        let imagePath = path.join(dirPath, name);
        let imgInfo = await FileService.getImageInfos(imagePath);

        // 读取图片的标签文件内容
        let tagPath = FileService.changeExtName(imagePath, 'txt');
        let imgTag = await FileService.readText(tagPath);

        LogService.log('sending image info of :', imagePath);
        panel.webview.postMessage({ 
            command: "updateImgInfo", 
            info: {
                ...imgInfo,
                tag: imgTag,
                imgPath: imagePath,
                tagPath: tagPath,
            },
            loadCnt: ++loadCnt,
            total: imageNames.length,
        }); 
    }
}

const handleMap: { [key: string]: (panel: vscode.WebviewPanel, message: any, panelMgr: TaggerPanelMgr) => any } = {
    openFileDialog: onOpenFileDialog,   // 前端打开文件夹，则返回打开的路径
    getFilePath: updateFilePath,    // 前端请求路径，则返回路径
    getImageNames: getImageNames,
    getImageInfos: getImageInfos,
}

export default handleMap;