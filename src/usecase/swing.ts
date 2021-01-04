import { SimpleGit } from "simple-git";
import { ICommonIO } from '../ioInterface/commonIO';
import * as config from '../util/config';
import * as service from '../service/common';

export const swing = async (io: ICommonIO, git: SimpleGit) => {
    const beforBranches = await git.branch();
    const selectableBranches = beforBranches.all
        .filter((branchName) => branchName !== beforBranches.current)
        .map((branchName) => { return { label: branchName, data: branchName }; });
    const selectedBranchName = await io.select(selectableBranches);
    service.swing(git, selectedBranchName);
};