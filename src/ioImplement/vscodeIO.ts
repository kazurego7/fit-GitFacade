import { ICommonIO } from "../ioInterface/commonIO";
import * as vscode from 'vscode';
import { assert } from "console";

export class VSCodeIO implements ICommonIO {
    async input(description: string): Promise<string> {
        const text = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: description });
        if (text === undefined) {
            throw new Error("InputBox cancel.");
        } else {
            return text;
        }
    }
    async select<T>(choices: { label: string; description?: string; data: T; }[]): Promise<T> {
        assert(choices.length > 0);
        const picked = await vscode.window.showQuickPick(choices, { ignoreFocusOut: true });
        if (picked === undefined) {
            throw new Error("QuickPick cancel.");
        } else {
            const pickedIndex = choices
                .map((item, i) => { return { item: item, index: i }; })
                .filter((itemIx) => itemIx.item === picked)[0];
            return choices[pickedIndex.index].data;
        }
    }
    async output(text: string): Promise<void> {
        await vscode.window.showInformationMessage(text);
        return;
    }
}