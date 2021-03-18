import { SimpleGit, GitError } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as bindStash from './bindStash';

/**
 * 現在チェックアウトしているコミットのコミットIDを取得する
 * @param git 
 */
export const getCommitId = async (git: SimpleGit) => {
    return (await git.show(['--no-patch', '--format=%H'])).trim();
};

/**
 * 現在のワークツリーとインデックスを保存して、既存のブランチへスイッチする  
 * スイッチ先のブランチで、そのブランチで以前に保存したワークツリーとインデックスを復元する
 * @param git
 * @param afterBranchName 現在のブランチと同じならば、なにもしない
 */
export const swing = async (git: SimpleGit, afterBranchName: string) => {
    // swingの前と後のブランチが一緒ならばなにもしない
    const beforeBranchName = (await git.branch()).current;
    if (beforeBranchName === afterBranchName) {
        return;
    }

    // 現在チェックアウトしているコミットに紐づくswing-stashのpush
    const beforeCommitId = await getCommitId(git);
    await bindStash.push(git, bindStash.BindType.swing, beforeCommitId);

    // ブランチを移動して、コミットにswing用の stash があれば、それを apply する(index も含める)
    try {
        await git.checkout(afterBranchName);
        const afterCommitId = await getCommitId(git);
        await bindStash.pop(git, bindStash.BindType.swing, afterCommitId);
    } catch {
        await git.checkout(beforeBranchName);
        await bindStash.pop(git, bindStash.BindType.swing, beforeCommitId);
        throw new Error('swing cancel.');
    }
};
/**
 * ユーザー名を取得する  
 * **(空白は"_"に置き換える)**
 * @param git 
 */
export const getUserName = async (git: SimpleGit) => {
    const userNameOneOrArray = (await git.listConfig()).all['user.name'];
    let userName = '';
    if (Array.isArray(userNameOneOrArray)) {
        userName = userNameOneOrArray[0];
    } else {
        userName = userNameOneOrArray;
    }
    const userNameValidated = userName.replace(' ', '_');
    return userNameValidated;
};


/**
 * index に変更があるか
 * @param git 
 * @return index に変更があれば true
 */
export const isChangeForIndex = async (git: SimpleGit) => {
    const index = await git.diff(['--cached', '--exit-code']);
    return index !== "";
};


/**
 * workingtree に変更があるか
 * @param git 
 * @return workingtree に変更があれば true
 */
export const isChangeForWorkingtree = async (git: SimpleGit) => {
    const modifed = await git.diff(['--exit-code']);
    const untracked = (await git.raw(['ls-files', '--other', '--exclude-standard', '--directory'])).trim();
    return modifed !== "" && untracked !== "";
};

/** 
 * merge conflict 中か  
 * **(conflict marker がなくてもコミットされていなければ、conflict 中)**
 * @param git
 * @return merge conflict 中であれば true
 */
export const isMergeConflict = async (git: SimpleGit) => {
    const notMergedFileNames = await git.diff(['--name-only', '--diff-filter=U']);
    return notMergedFileNames !== "";
};

/** 
 * conflict marker のあるファイルが存在するか
 * @param git
 * @return conflict marker のあるファイルが存在すれば true
 */
export const existsConflictFile = async (git: SimpleGit) => {
    // conflict marker または whitespace error が発生しているファイルから、conflict marker のあるファイルが存在するときのみ false
    const errorLines = (await git.diff(['--check'])).split('\n');
    return errorLines.some((line) => line.search('leftover conflict marker') !== -1);
};

/**
 * merge の結果
 */
export enum MergeResult {
    merged,
    conflict
};

/** 
 * no-fast-forward で merge を行う
 * @param git
 */
export const merge = async (git: SimpleGit) => {
    try {
        await git.merge(['--no-ff', config.BRANCH_NAME_MAIN]);
        return MergeResult.merged;
    } catch (e) {
        if (e instanceof GitError) {
            const errorName = e.message.split(':').map((str) => str.trim())[0];
            const isConflict = errorName === 'CONFLICTS';
            if (!isConflict) {
                // merge conflict 以外のエラーの場合はそのままエラー
                throw e;
            } else {
                // conflict する場合は、conflict を返す
                return MergeResult.conflict;
            }
        } else {
            throw e;
        }
    }
};