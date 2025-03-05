import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';

type FileInfo = {
    name: string;
    webviewUri: string;
}

export class FileService {
    static async getImageNames(directory: string | null): Promise<string[]> {
        if (!directory) {
            return []; 
        }

        const files = await fs.readdir(directory);
        return files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
    }

    /**
     * 获取指定目录下所有图片文件的信息
     * @param panel - 用于生成 Webview URI 的 VSCode Webview 面板
     * @param directory - 要搜索图片文件的目录路径，如果为 null 则返回空数组
     * @returns 一个 Promise，解析为包含图片文件信息的数组，每个信息包含文件名和 Webview URI
     */
    static async getImagesInfo(panel: vscode.WebviewPanel, directory: string | null): Promise<FileInfo[]> {
        let fileNames = await FileService.getImageNames(directory);
        let fileInfos = fileNames.map(fileName => {
            let filePath = path.join(directory || '', fileName);
            return {
                name: fileName,
                webviewUri: panel.webview.asWebviewUri(vscode.Uri.file(filePath)).toString(),
            };
        });
        return fileInfos;
    }

    /**
     * 将指定路径的图片文件读取为 Base64 编码的字符串
     * @param fpath - 要读取的图片文件路径，如果为 null 则返回空字符串
     * @returns 一个 Promise，解析为包含图片文件内容的 Base64 编码字符串
     */
    static async loadImageAsSrc(fpath: string | null): Promise<string> {
        if (!fpath) {
            return '';
        }
        const fileData = (await fs.readFile(fpath)).toString('base64'); // 读取文件并转换为 Base64
        const extName = path.extname(fpath).substring(1);   // 获取扩展名，并去掉 .
        const srcString = `data:image/${extName};base64,${fileData}`; // 生成 Base64 格式的图片数据

        return srcString;
    }

    static changeExtName(fpath: string, extName: string): string {
        let dir = path.dirname(fpath);
        let name = path.basename(fpath, path.extname(fpath));
        return path.join(dir, name + '.' + extName);
    }

    static async readText(filePath: string): Promise<string> {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch {
            return '';
        }
    }

    static async writeText(filePath: string, text: string): Promise<void> {
        await fs.writeFile(filePath, text, 'utf-8');
    }
}
