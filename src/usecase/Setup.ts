import { ICommonIO } from "../IOInterface/ICommonIO";
import { SimpleGit } from 'simple-git';

export const setup = async (commonIO: ICommonIO, git: SimpleGit) => {
    const bs = await git.branchLocal();
    for await (const b of bs.all) {
        commonIO.output(b);
    }
};