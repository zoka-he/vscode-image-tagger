import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import sharp from 'sharp';

type ImageInfo = {
    name: string;
    ext: string;
    src: string;
    width: number;
    height: number;
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

    static async getImageInfos(fpath: string | null): Promise<ImageInfo> {
        let template: ImageInfo = {
            name: '',
            ext: '',
            src: '',
            width: 0,
            height: 0,
        }

        if (!fpath) {
            return template;
        }

        const fileData = (await fs.readFile(fpath)).toString('base64'); // 读取文件并转换为 Base64
        const extName = path.extname(fpath).substring(1);   // 获取扩展名，并去掉 .
        const srcString = `data:image/${extName};base64,${fileData}`; // 生成 Base64 格式的图片数据

        // 获取图片尺寸
        const { width, height } = await sharp(fpath).metadata();

        template.name = path.basename(fpath);
        template.ext = extName;
        template.src = srcString;
        template.width = width || 0;
        template.height = height || 0;

        return template;
    }


    static changeExtName(fpath: string, extName: string): string {
        let dir = path.dirname(fpath);
        let name = path.basename(fpath, path.extname(fpath));
        return path.join(dir, name + '.' + extName);
    }

    /**
     * 备份指定路径的文件
     * @param filePath - 要备份的文件路径
     * @returns 备份文件的路径
     */
    static async backupFile(filePath: string): Promise<string> {
        // 读取原文件到内存
        const originalFile = await fs.readFile(filePath);

        // 查找可用的备份后缀
        let backupCount = 0;
        let backupPath: string;
        do {
            backupPath = `${filePath}.bak.${backupCount.toString().padStart(3, '0')}`;
            try {
                await fs.access(backupPath);
                backupCount++;
            } catch {
                break;
            }
        } while (true);

        // 备份原文件
        await fs.writeFile(backupPath, originalFile);
        return backupPath;
    }

    static async backupImageAndFixSizeAndExt(imagePath: string, targetExt: string, targetWidth: number, targetHeight: number): Promise<ImageInfo> {
        
        // 备份原图片，之所以写死在这里是怕忘记调用
        await this.backupFile(imagePath);

        // 读取原图片到内存
        const originalImage = await fs.readFile(imagePath);

        // 调整图片大小并保存为新格式
        const resizedImage = await sharp(originalImage)
            .resize(targetWidth, targetHeight, {
                fit: sharp.fit.contain,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
           .toFormat(targetExt as unknown as sharp.AvailableFormatInfo)
           .toBuffer();

        const newImagePath = this.changeExtName(imagePath, targetExt);
        await fs.writeFile(newImagePath, resizedImage);

        // 返回新图片的信息
        return this.getImageInfos(newImagePath);
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
