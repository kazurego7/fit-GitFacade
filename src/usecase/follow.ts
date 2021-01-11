import { SimpleGit, GitError } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as service from "../service/common";
import * as config from '../util/config';

const enum ConflictSelect {
    resolve = "Resolve",
}

// メインブランチのpullをし、現在のブランチにmergeする
export const follow = async (io: ICommonIO, git: SimpleGit) => {

    // メインブランチの pull を行う
    const currentBranchName = (await (git.branch())).current;
    await service.swing(git, config.BRANCH_NAME_MAIN);
    await git.pull(config.REMOTE_DEFAULT, config.BRANCH_NAME_MAIN);
    await service.swing(git, currentBranchName);

    // merge が conflict しないか確認する
    try {
        await git.merge(['--no-commit', config.BRANCH_NAME_MAIN]);
        await git.merge(['--abort']);
    } catch (e) {
        if (e instanceof GitError) {
            const errorName = e.message.split(':').map((str) => str.trim())[0];
            const isConflict = errorName === 'CONFLICTS';
            if (!isConflict) {
                // merge conflict 以外のエラーの場合は
                throw e;
            } else {
                // conflict する場合は、解決するか、mergeをキャンセルするかを選択
                const message = `マージコンフリクトが発生しました。マージコンフリクトを解決する場合は"${ConflictSelect.resolve}"を選択し、マージを取りやめる場合は"キャンセル"を選択してください。`;
                const choices = [
                    {
                        label: ConflictSelect.resolve,
                        data: ConflictSelect.resolve
                    }
                ];
                try {
                    const choiced = await io.message(message, choices);
                    return;
                } catch {
                    await git.merge(['--abort']);
                    return;
                }
            }
        }
    }

    // 現在のブランチに merge する
    await git.merge(['--no-ff', config.BRANCH_NAME_MAIN]);
};