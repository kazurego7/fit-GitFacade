import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as service from '../service/common';

/**
 * 現在のワークツリーとインデックスのまま、新しいfeatブランチへ移動する
 * @param io 
 * @param git 
 */
export const replant = async (io: ICommonIO, git: SimpleGit) => {
    // 新しいブランチの名前を決定する
    const newBranchNameNotice = await service.createFeatBranchName(git, '"タイトル"');
    const branchTitle = await io.input(`移動先のブランチのタイトルを入力してください。ブランチ名は${newBranchNameNotice}となります。`);
    if (branchTitle === undefined) {
        return;
    } else {
        // 新しいブランチに、作業内容を移し替える
        await git.stash(['push', '--include-untracked', '--message', 'replant']);
        try {
            const newBranchName = await service.createFeatBranchNameValid(git, branchTitle);
            await service.feat(git, newBranchName);
        } catch {
        } finally {
            await git.stash(['pop', '--index']);
        }
    }
};