import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as vscode from 'vscode';

/**
 * 発生した競合をリセットする
 * @param io 
 * @param git 
 */
export const avoid = async (io: ICommonIO, git: SimpleGit) => {
    await git.reset(['--merge']);
    io.output('競合がリセットされました。');
    vscode.commands.executeCommand('workbench.view.scm');
};