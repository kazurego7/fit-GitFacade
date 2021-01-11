import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as service from "../service/common";
import * as config from '../util/config';

/**
 * featureブランチを作成し、作成したfeatureブランチに移動する
 * @param io 
 * @param git 
 */
export const feat = async (io: ICommonIO, git: SimpleGit) => {
    // ブランチ名の取得
    const newBranchNameNotice = await service.createFeatBranchName(git, '"タイトル"');
    const branchTitle = await io.input(`ブランチのタイトルを入力してください。ブランチ名は${newBranchNameNotice}となります。`);
    const newBranchName = await service.createFeatBranchNameValid(git, branchTitle);
    await service.feat(git, newBranchName);
};