import { SimpleGit, GitError } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as service from "../service/common";
import * as config from '../util/config';

// メインブランチのpullをし、現在のブランチにmergeする
export const follow = async (io: ICommonIO, git: SimpleGit) => {

    // メインブランチの pull を行う
    const currentBranchName = (await (git.branch())).current;
    await service.swing(git, config.BRANCH_NAME_MAIN);
    await git.pull(config.REMOTE_DEFAULT, config.BRANCH_NAME_MAIN);
    await service.swing(git, currentBranchName);

    // 現在のブランチに merge する
    const result = await service.merge(git);
    switch (result) {
        case service.MergeResult.conflict:
            // conflict する場合は、解決するか、mergeをキャンセルするかを選択
            const message = `マージコンフリクトが発生しました。マージコンフリクトを解決する場合は"Resolve"を選択し、マージを取りやめる場合は"キャンセル"を選択してください。`;
            const choices = [
                {
                    label: "Resolve",
                    data: "Resolve"
                }
            ];
            try {
                const choiced = await io.message(message, choices);
                return;
            } catch {
                await git.merge(['--abort']);
                return;
            }
        case service.MergeResult.merged:
            return;
    }
};