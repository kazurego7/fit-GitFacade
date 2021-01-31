import { SimpleGit, GitError } from "simple-git";

/**
 * bind stash (commit に紐付いた stash) の種類
 */
export enum BindType {
    swing = "swing",
    snapshot = "snapshot",
}

/**
 * 指定された種類のbind stash の rev を全て取得する
 * @param git
 * @param commitId
 */
export const getRevs = async (git: SimpleGit, stashType: BindType, commitId: string) => {
    const stashes = (await git.stash(['list'])).split('\n').map((str) => str.trim());
    const revs = stashes
        .map((item) => {
            const stashComments = item.split(':').map((str) => str.trim());
            return { revision: stashComments[0], message: stashComments[2] };
        })
        .filter((item) => {
            return item.message === `${stashType} ${commitId}`;
        })
        .map((item) => item.revision)
        .sort((rev1, rev2) => {
            // 取得した stash@{revNum} から revNum を取り出して比較する
            const toNum = (rev: string): number => parseInt(rev.slice(7, -1));
            return toNum(rev1) - toNum(rev2);
        });
    return revs;
};

/**
 * bind stash を push する
 * @param git 
 * @param commitId 
 */
export const push = async (git: SimpleGit, stashType: BindType, commitId: string) => {
    await git.stash(['push', '--include-untracked', '--message', `${stashType} ${commitId}`]);
};

/**
 * bind stash の内、最新のものを pop する  
 * @param git 
 * @param commitId 
 */
export const pop = async (git: SimpleGit, stashType: BindType, commitId: string) => {
    const stashRevs = await getRevs(git, stashType, commitId);
    if (stashRevs.length === 0) {
        return;
    } else {
        const stashRev = stashRevs[0];
        await git.stash(['pop', '--index', stashRev]);
    }
};