import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as service from '../service/common';

/**
 * 現在の作業を保存して、別のブランチにスイッチする
 * @param io 
 * @param git 
 */
export const swing = async (io: ICommonIO, git: SimpleGit) => {
    // スイッチするブランチを選択(現在のブランチおよび、メインブランチ、リリースブランチ以外)
    const localBranchFilter = (branchName: string): boolean =>
        branchName !== beforBranches.current &&
        branchName !== config.BRANCH_NAME_MAIN &&
        !branchName.startsWith(config.BRANCH_NAME_RELEASE_PREFIX + config.BRANCH_NAME_SEPARATOR);
    const beforBranches = await git.branchLocal();
    const selectableBranches = beforBranches.all
        .filter(localBranchFilter)
        .map((branchName) => { return { label: branchName, data: branchName }; });
    if (selectableBranches.length === 0) {
        // スイッチできるブランチがなければキャンセル
        const message = `スイッチできるブランチが存在しません。`;
        io.output(message);
        return;
    } else {
        const selectedBranchName = await io.select(selectableBranches);
        if (selectedBranchName === undefined) {
            return;
        } else {
            // 現在のワークツリーとインデックスを保存して、既存のブランチへスイッチする。
            // スイッチ先のブランチで、そのブランチで以前に保存したワークツリーとインデックスを復元する。
            service.swing(git, selectedBranchName);
        }
    }
};