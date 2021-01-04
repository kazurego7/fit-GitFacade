import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as service from "../service/common";
import * as config from '../util/config';


// featureブランチを作成する。メインブランチにチェックアウトしている場合は、作成したfeatureブランチに移動する。
export const feat = async (io: ICommonIO, git: SimpleGit) => {
    // ブランチ名の取得
    const userName = await service.getUserName(git);
    const branchTitle = await io.input(`ブランチのタイトルを入力してください。ブランチ名は${userName}_feat_"タイトル"となります。`);
    const newBranchName = await service.createFeatBranchName(git, userName, branchTitle);
    await service.feat(git, newBranchName);
};