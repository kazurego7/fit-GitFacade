import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as knotBranch from '../service/knotBranch';

/**
 * 現在のワークツリーとインデックスのまま、新しいfeatブランチへ移動する
 * @param io 
 * @param git 
 */
export const replant = async (io: ICommonIO, git: SimpleGit) => {
    // 新しいブランチの名前を決定する
    const newBranchNameNotice = await knotBranch.getBranchName(git, config.BRANCH_NAME_FEATURE_SYMBOL, `\'タイトル\'`);
    const branchTitle = await io.input(`作業内容を移し替える、新しいfeatureブランチのタイトルを入力してください。ブランチ名は${newBranchNameNotice}となります。`);
    if (branchTitle === undefined) {
        return;
    } else {
        // 新しいブランチに、作業内容を移し替える
        await git.stash(['push', '--include-untracked', '--message', 'replant']);
        try {
            const invalidType = await knotBranch.validBranchName(git, config.BRANCH_NAME_FEATURE_SYMBOL, branchTitle);
            const newBranchName = await knotBranch.getBranchName(git, config.BRANCH_NAME_FEATURE_SYMBOL, branchTitle);
            switch (invalidType) {
                case knotBranch.Validated.blankSymbol:
                    await io.output(`ブランチ名 "${newBranchName}": ブランチシンボルが空白です。`);
                    break;
                case knotBranch.Validated.blankTitle:
                    await io.output(`ブランチ名 "${newBranchName}": ブランチタイトルが空白です。`);
                    break;
                case knotBranch.Validated.duplicatedBranchName:
                    await io.output(`ブランチ名 "${newBranchName}": ブランチ名が、既に存在するブランチと重複しています。`);
                    break;
                case knotBranch.Validated.invalidFormat:
                    await io.output(`ブランチ名 "${newBranchName}": 不正なブランチ名です。`);
                    break;
                default:
                    await knotBranch.create(git, newBranchName);
                    await io.output(`ブランチ名 "${newBranchName}": ブランチが作成されました。`);
                    break;
            }
        } catch {
        } finally {
            await git.stash(['pop', '--index']);
        }
    }
};