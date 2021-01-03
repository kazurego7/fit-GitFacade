import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';

export const swing = async (io: ICommonIO, git: SimpleGit) => {

    // commitにひもづくstashの内、最新のstashを取得する
    const getStashRevByCommitId = async (commitId: string) => {
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

    // 現在の working tree と index を、コミットIDでひもづけたswing用の stash として pushする(untracked file も含めて)
    const beforBranches = await git.branch();
    const selectableBranches = beforBranches.all
        .filter((branchName) => branchName !== beforBranches.current)
        .map((branchName) => { return { label: branchName, data: branchName }; });
    const selectedBranchName = await io.select(selectableBranches);

    const beforeCommitId = (await git.show(['--no-patch', '--format=%H'])).trim();
    await git.stash(['push', '--include-untracked', '--message', `swing ${beforeCommitId}`]);

    // ブランチを移動して、コミットにswing用の stash があれば、それを apply する(index も含める)
    try {
        await git.checkout(selectedBranchName);
        const afterCommitId = (await git.show(['--no-patch', '--format=%H'])).trim();
        const afterSwingStashRev = await getStashRevByCommitId(afterCommitId);
        if (afterSwingStashRev !== undefined) {
            await git.stash(['apply', '--index', afterSwingStashRev]);
            await git.stash(['drop', afterSwingStashRev]);
        }
    } catch {
        const beforeSwingStashRev = await getStashRevByCommitId(beforeCommitId);
        if (beforeSwingStashRev !== undefined) {
            await git.stash(['apply', '--index', beforeSwingStashRev]);
            await git.stash(['drop', beforeSwingStashRev]);
        }
        await git.checkout(beforBranches.current);
        throw new Error('swing cancel.');
    }
};