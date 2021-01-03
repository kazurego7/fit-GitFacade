import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
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
    await git.branch([`${userNameValidated}_feat_${branchTitle}`, config.BRANCH_NAME_MAIN]);
};