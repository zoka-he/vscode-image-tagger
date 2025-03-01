import * as fs from 'fs/promises';
import * as path from 'path';

export class FileService {
    static async getImages(directory: string): Promise<string[]> {
        const files = await fs.readdir(directory);
        return files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
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
