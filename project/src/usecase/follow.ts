import { SimpleGit, GitError } from "simple-git";
import * as vscode from "vscode";
import { ICommonIO } from '../ioInterface/commonIO';
import * as service from "../service/common";
import * as config from '../util/config';

/**
 * リモートのメインブランチの fetch をし、現在のブランチにmergeする
 * @param io 
 * @param git 
 */
export const follow = async (io: ICommonIO, git: SimpleGit) => {
    // メインブランチの fetch を行う(リモートに存在しないブランチのリモート追跡ブランチの削除)
    await git.fetch(config.REMOTE_DEFAULT, config.BRANCH_NAME_MAIN, ['--prune']);

    // コミットされていない変更が存在するとき、操作をキャンセルする
    if (await service.isChangeForWorkingtree(git) || await service.isChangeForIndex(git)) {
        const message = `コミットされていないファイルがワーキングツリーにあるため、操作をキャンセルしました。`;
        io.outputWarn(message);
        vscode.commands.executeCommand('workbench.view.scm');
        return;
    }

    // 現在のブランチに merge する
    try {
        await git.merge(['--no-ff', `${config.REMOTE_DEFAULT}/${config.BRANCH_NAME_MAIN}`]);
        // マージが完了したとき、
        const message = `マージが完了しました。`;
        io.output(message);
        return;
    } catch (e) {
        const error = (e as GitError).message.split(':').map((str) => str.trim());
        const errorName = error[0];
        const isConflict = errorName === 'CONFLICTS';
        if (isConflict) {
            // conflict する場合は、merge conflict していることを表示
            const message = `マージコンフリクトが発生しました。マージを中止する場合は、'Fit: avoid' を実行してください。`;
            io.outputWarn(message);
            // ソース管理ビューの表示
            vscode.commands.executeCommand('workbench.view.scm');
            return;
        } else {
            // それ以外のエラーの場合はスルー
            throw e;
        }
    }
};