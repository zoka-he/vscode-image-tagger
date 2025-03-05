import * as vscode from 'vscode';

export default class LogService {

    private static instance: LogService;
    private outputChannel: vscode.OutputChannel;

    private constructor(chn: vscode.OutputChannel) { 
        this.outputChannel = chn;
    }

    public static getInstance(): LogService {
        return LogService.instance;
    }

    public static create(chn: vscode.OutputChannel): LogService {
        LogService.instance = new LogService(chn);
        return LogService.instance;
    }

    public static log(message: any, ...moreArgs: any[]): void {
        if (LogService.instance === undefined) {
           return; 
        }


        let strs = Array.from(arguments).map(arg => {
            try {
                return JSON.stringify(arg); 
            } catch (e) {
                return typeof arg;
            }
        });
        message = strs.join(' ');

        LogService.instance.outputChannel.appendLine(message);
    }

}