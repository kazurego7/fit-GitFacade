import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as service from '../service/common';

// 現在の作業を保存して、別のブランチにスイッチする。
export const swing = async (io: ICommonIO, git: SimpleGit) => {
    // スイッチするブランチを選択(現在のブランチ以外)
    const beforBranches = await git.branch();
    const selectableBranches = beforBranches.all
        .filter((branchName) => branchName !== beforBranches.current)
        .map((branchName) => { return { label: branchName, data: branchName }; });
    const selectedBranchName = await io.select(selectableBranches);

    // 現在のワークツリーとインデックスを保存して、既存のブランチへスイッチする。
    // スイッチ先のブランチで、そのブランチで以前に保存したワークツリーとインデックスを復元する。
    service.swing(git, selectedBranchName);
};