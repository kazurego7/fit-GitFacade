import { SimpleGit } from "simple-git";
import * as config from '../util/config';
import * as common from './common';
import * as bindStash from './bindStash';

/**
 * ユーザー名、ブランチシンボル、ブランチタイトルから、ブランチ名を作成する  
 * ブランチ名は "[ユーザー名]/[ブランチシンボル]/[ブランチタイトル]" で構成される  
 * セパレータはデフォルトで"/"
 * @param git 
 * @param branchSymbol
 * @param branchTitle 
 */
export const getBranchName = async (git: SimpleGit, branchSymbol: string, branchTitle: string) => {
    const userName = await common.getUserName(git);
    const separator = config.BRANCH_NAME_SEPARATOR;
    if (userName.trim() === "") {
        throw Error("user.name config is not set.");
    } else {
        return `${userName}${separator}${branchSymbol}${separator}${branchTitle}`;
    }
};

export enum Validated {
    blankSymbol,
    blankTitle,
    invalidFormat,
    duplicatedBranchName,
    ok
};

/**
 * ユーザー名、ブランチシンボル、ブランチタイトルから、ブランチ名を作成し、バリデーションチェックを行う  
 * @param git 
 * @param branchSymbol 
 * @param branchTitle 
 */
export const validBranchName = async (git: SimpleGit, branchSymbol: string, branchTitle: string) => {
    const symbolIsBlank = branchSymbol.trim() === "";
    const titleIsBlank = branchTitle.trim() === "";

    const branchName = await getBranchName(git, branchSymbol, branchTitle);

    const branchNameList = (await git.branch()).all;
    const branchNameIsDuplicated = branchNameList.some((name) => name === branchName);

    let formatIsInvalid = false;
    try {
        await git.raw(['check-ref-format', '--branch', branchName]);
    } catch {
        formatIsInvalid = true;
    }

    if (symbolIsBlank) {
        return Validated.blankSymbol;
    } else if (titleIsBlank) {
        return Validated.blankTitle;
    } else if (branchNameIsDuplicated) {
        return Validated.duplicatedBranchName;
    } else if (formatIsInvalid) {
        return Validated.invalidFormat;
    } else {
        return Validated.ok;
    }
};


/**
 * 分岐もとに空の commit のあるブランチを作成する 
 * @param git 
 * @param fromBranchName 分岐元のブランチ名
 * @param newBranchName 新しく作成するブランチ名(既に存在するブランチ名と重複する場合はエラー)
 */
export const create = async (git: SimpleGit, fromBranchName: string, newBranchName: string) => {
    const commitId = await common.getCommitId(git);
    await bindStash.push(git, bindStash.BindType.swing, commitId);
    await git.checkout([fromBranchName, '-b', newBranchName]);
    try {
        const commitMassage = `${config.COMMIT_MSG_AUTO}: knot commit.`;
        await git.commit(commitMassage, ['--allow-empty']);
    } catch {
        await git.branch(['--delete', newBranchName]);
        throw new Error('create knot branch failed.');
    }
};
