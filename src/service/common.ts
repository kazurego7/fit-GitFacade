import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';

// commitにひもづくstashの内、最新のstashを取得する
export const getStashRevByCommitId = async (git: SimpleGit, commitId: string) => {
    const stashes = (await git.stash(['list'])).split('\n').map((str) => str.trim());
    if (stashes.length === 0 || stashes[0] === '') {
        return;
    } else {
        const swingStashs = stashes
            .map((item) => {
                const stashComments = item.split(': ').map((str) => str.trim());
                return { revision: stashComments[0], message: stashComments[2] };
            })
            .filter((item) => {
                return item.message === `swing ${commitId}`;
            }).sort((a, b) => {
                if (a.revision < b.revision) {
                    return -1;
                } else if (a.revision > b.revision) {
                    return 1;
                } else {
                    return 0;
                }
            });
        if (swingStashs.length > 0) {
            return swingStashs[0].revision;
        } else {
            return;
        }
    }
};

// 現在のワークツリーとインデックスを保存して、既存のブランチへスイッチする。
// スイッチ先のブランチで、そのブランチで以前に保存したワークツリーとインデックスを復元する。
export const swing = async (git: SimpleGit, afterBranchName: string) => {
    // swingの前と後のブランチが一緒ならばなにもしない
    const beforeBranchName = (await git.branch()).current;
    if (beforeBranchName === afterBranchName) {
        return;
    }

    // 現在チェックアウトしているコミットに紐づくswing-stashのpush
    const beforeCommitId = (await git.show(['--no-patch', '--format=%H'])).trim();
    await git.stash(['push', '--include-untracked', '--message', `swing ${beforeCommitId}`]);

    // ブランチを移動して、コミットにswing用の stash があれば、それを apply する(index も含める)
    try {
        await git.checkout(afterBranchName);
        const afterCommitId = (await git.show(['--no-patch', '--format=%H'])).trim();
        const afterSwingStashRev = await getStashRevByCommitId(git, afterCommitId);
        if (afterSwingStashRev !== undefined) {
            await git.stash(['apply', '--index', afterSwingStashRev]);
            await git.stash(['drop', afterSwingStashRev]);
        }
    } catch {
        const beforeSwingStashRev = await getStashRevByCommitId(git, beforeCommitId);
        if (beforeSwingStashRev !== undefined) {
            await git.stash(['apply', '--index', beforeSwingStashRev]);
            await git.stash(['drop', beforeSwingStashRev]);
        }
        await git.checkout(beforeBranchName);
        throw new Error('swing cancel.');
    }
};

// ユーザー名を取得する(空白はハイフン[-]に置き換える)
export const getUserName = async (git: SimpleGit) => {
    const userNameOneOrArray = (await git.listConfig()).all['user.name'];
    let userName = '';
    if (Array.isArray(userNameOneOrArray)) {
        userName = userNameOneOrArray[0];
    } else {
        userName = userNameOneOrArray;
    }
    const userNameValidated = userName.replace(' ', '-');
    return userNameValidated;
};

// ブランチタイトルとユーザー名からfeatブランチ名を作成する(既存のブランチと重複する場合はエラー)
export const createFeatBranchName = async (git: SimpleGit, userName: string, branchTitle: string) => {
    const branchName = `${userName}_feat_${branchTitle}`;
    const branchNameList = (await git.branch()).all;
    const isDuplicated = branchNameList.some((name) => name === branchName);
    if (isDuplicated) {
        throw new Error("branch name is duplicated.");
    } else {
        return branchName;
    }
};

// feat ブランチ作成してswing後、空のコミットを行う
export const feat = async (git: SimpleGit, newBranchName: string) => {
    await swing(git, newBranchName);
    await git.branch([newBranchName]);
    try {
        await git.checkout([newBranchName]);
        const commitMassage = `${config.COMMIT_MSG_AUTO} create feature branch.`;
        await git.commit(commitMassage, ['--allow-empty']);
    } catch {
        await git.branch(['--delete', newBranchName]);
        throw new Error('feat failed.');
    }
};