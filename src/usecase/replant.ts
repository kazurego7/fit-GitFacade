import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as service from '../service/common';

export const replant = async (io: ICommonIO, git: SimpleGit) => {
    // 新しいブランチの名前を決定する
    const userName = await service.getUserName(git);
    const branchTitle = await io.input(`移動先のブランチのタイトルを入力してください。ブランチ名は${userName}_feat_"タイトル"となります。`);

    // 新しいブランチに、作業内容を移し替える
    await git.stash(['push', '--include-untracked', '--message', 'replant']);
    try {
        const newBranchName = await service.createFeatBranchName(git, userName, branchTitle);
        await service.feat(git, newBranchName);
        await git.checkout(newBranchName);
        await git.stash(['pop', '--index']);
    } catch {
        await git.stash(['pop', '--index']);
    }
};