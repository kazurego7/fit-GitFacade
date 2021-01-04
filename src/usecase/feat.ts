import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import { swing } from "../service/common";
import * as config from '../util/config';

export const feat = async (io: ICommonIO, git: SimpleGit) => {
    // feat ブランチの作成
    const userNameOneOrArray = (await git.listConfig()).all['user.name'];
    let userName = '';
    if (Array.isArray(userNameOneOrArray)) {
        userName = userNameOneOrArray[0];
    } else {
        userName = userNameOneOrArray;
    }
    const userNameValidated = userName.replace(' ', '-');
    const branchTitle = await io.input(`ブランチのタイトルを入力してください。ブランチ名は${userNameValidated}_feat_"タイトル"となります。`);

    const newBranchName = `${userNameValidated}_feat_${branchTitle}`;
    await git.branch([newBranchName, config.BRANCH_NAME_MAIN]);
    const currentBranchName = (await git.branch()).current;
    const commitMassage = `${config.COMMIT_MSG_AUTO} create feature branch.`;
    if (currentBranchName === config.BRANCH_NAME_MAIN) {
        await git.checkout([newBranchName]);
        await git.commit(commitMassage, ['--allow-empty']);
    } else {
        await swing(git, newBranchName);
        await git.commit(commitMassage, ['--allow-empty']);
        await swing(git, currentBranchName);
    }
};