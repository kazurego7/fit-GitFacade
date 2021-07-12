import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as knotBranch from "../service/knotBranch";
import * as config from '../util/config';

/**
 * hotfixブランチを作成し、作成したhotfixブランチに移動する
 * @param io 
 * @param git 
 */
export const fix = async (io: ICommonIO, git: SimpleGit) => {
    while (true) {
        // 分岐元のブランチを指定
        // リモートのメインブランチおよびリリースブランチのみ選択可能
        const remoteBranchFilter = (branchName: string): boolean =>
            branchName === `remotes/${config.REMOTE_DEFAULT}/${config.BRANCH_NAME_MAIN}` ||
            branchName.startsWith(`remotes/${config.REMOTE_DEFAULT}/${config.BRANCH_NAME_RELEASE_PREFIX}${config.BRANCH_NAME_SEPARATOR}`);
        const beforBranches = await git.branch();
        const selectableBranches = beforBranches.all
            .filter(remoteBranchFilter)
            .map((branchName) => { return { label: branchName, data: branchName }; });
        const selectedBranchName = await io.select(selectableBranches);
        if (selectedBranchName === undefined) {
            // ブランチ名を選択しなければ終了
            return;
        } else {
            // ブランチ名の取得
            const newBranchNameNotice = await knotBranch.getBranchName(git, config.BRANCH_NAME_HOTFIX_SYMBOL, `\'タイトル\'`);
            const branchTitle = await io.input(`新しいhotfixブランチのタイトルを入力してください。ブランチ名は "${newBranchNameNotice}" となります。`);
            if (branchTitle === undefined) {
                return;
            } else {
                const invalidType = await knotBranch.validBranchName(git, config.BRANCH_NAME_HOTFIX_SYMBOL, branchTitle);
                const newBranchName = await knotBranch.getBranchName(git, config.BRANCH_NAME_HOTFIX_SYMBOL, branchTitle);
                switch (invalidType) {
                    case knotBranch.Validated.blankSymbol:
                        io.output(`ブランチ名 "${newBranchName}": ブランチシンボルが空白です。`);
                        break;
                    case knotBranch.Validated.blankTitle:
                        io.output(`ブランチ名 "${newBranchName}": ブランチタイトルが空白です。`);
                        break;
                    case knotBranch.Validated.duplicatedBranchName:
                        io.output(`ブランチ名 "${newBranchName}": ブランチ名が、既に存在するブランチと重複しています。`);
                        break;
                    case knotBranch.Validated.invalidFormat:
                        io.output(`ブランチ名 "${newBranchName}": 不正なブランチ名です。`);
                        break;
                    default:
                        await knotBranch.create(git, selectedBranchName, newBranchName);
                        io.output(`ブランチ名 "${newBranchName}": ブランチが作成されました。`);
                        return;
                }
            }
        }
    }
};