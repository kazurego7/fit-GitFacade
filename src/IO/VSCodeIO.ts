import { ICommonIO } from "../IOInterface/ICommonIO";
import * as vscode from 'vscode';

export class VSCodeIO implements ICommonIO {
    async input(): Promise<string> {
        const text = await vscode.window.showInputBox();
        if (text === undefined) {
            return Promise.reject(new Error("Seriously the worst input error."));
        } else {
            return Promise.resolve(text);
        }

    }
    async output(text: string): Promise<void> {
        await vscode.window.showInformationMessage(text);
        return;
    }
}