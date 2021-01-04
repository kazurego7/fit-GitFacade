import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as service from "../service/common";
import * as config from '../util/config';


// featureブランチを作成する。メインブランチにチェックアウトしている場合は、作成したfeatureブランチに移動する。
export const feat = async (io: ICommonIO, git: SimpleGit) => {
    // ブランチ名の取得
    const userNameOneOrArray = (await git.listConfig()).all['user.name'];
    let userName = '';
    if (Array.isArray(userNameOneOrArray)) {
        userName = userNameOneOrArray[0];
    } else {
        userName = userNameOneOrArray;
    }
    const userNameValidated = userName.replace(' ', '-');
    const branchTitle = await io.input(`ブランチのタイトルを入力してください。ブランチ名は${userNameValidated}_feat_"タイトル"となります。`);

    // feat ブランチの作成
    const newBranchName = `${userNameValidated}_feat_${branchTitle}`;
    await git.branch([newBranchName, config.BRANCH_NAME_MAIN]);

    // feat ブランチ作成後、空のコミットを行う(swing-stashなどのため)
    const currentBranchName = (await git.branch()).current;
    const commitMassage = `${config.COMMIT_MSG_AUTO} create feature branch.`;
    if (currentBranchName === config.BRANCH_NAME_MAIN) {
        // メインブランチにチェックアウトしていれば、作成したfeatブランチにスイッチ
        await git.checkout([newBranchName]);
        await git.commit(commitMassage, ['--allow-empty']);
    } else {
        // メインブランチ以外にチェックアウトしていれば、元ブランチのまま
        await service.swing(git, newBranchName);
        await git.commit(commitMassage, ['--allow-empty']);
        await service.swing(git, currentBranchName);
    }
};