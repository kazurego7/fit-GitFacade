import { ICommonIO, SelectItem, MessageItem } from "../ioInterface/commonIO";
import * as vscode from 'vscode';
import { assert } from "console";

export class VSCodeIO implements ICommonIO {
    async input(description: string): Promise<string | undefined> {
        return await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: description });
    }
    async select<T>(choices: SelectItem<T>[]): Promise<T | undefined> {
        assert(choices.length > 0);
        const picked = await vscode.window.showQuickPick(choices, { ignoreFocusOut: true });
        if (picked === undefined) {
            return undefined;
        } else {
            const pickedIndex = choices
                .map((item, i) => { return { item: item, index: i }; })
                .filter((itemIx) => itemIx.item === picked)[0];
            return choices[pickedIndex.index].data;
        }
    }
    async message<T>(message: string, choices: MessageItem<T>[]): Promise<T> {
        assert(choices.length > 0);
        const isDuplicatedLabels = choices.some((choice) => choices.filter((choice2) => choice2.label === choice.label).length > 1);
        assert(!isDuplicatedLabels);

        const items = choices.map((choice) => choice.label);
        const picked = await vscode.window.showInformationMessage(message, { modal: true }, ...items);
        if (picked === undefined) {
            throw new Error("InfoMessage cancel.");
        } else {
            const pickedIndex = choices
                .map((item, i) => { return { item: item, index: i }; })
                .filter((itemIx) => itemIx.item.label === picked)[0];
            return choices[pickedIndex.index].data;
        }
    }
    async output(text: string): Promise<void> {
        await vscode.window.showInformationMessage(text);
        return;
    }
    async outputWarn(text: string): Promise<void> {
        await vscode.window.showWarningMessage(text);
        return;
    }
    async outputError(text: string): Promise<void> {
        await vscode.window.showErrorMessage(text);
        return;
    }
}