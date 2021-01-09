import { SimpleGit } from 'simple-git';
import { ICommonIO } from '../ioInterface/commonIO';
import * as path from 'path';
import { promises as fs, Stats } from 'fs';
import * as config from '../util/config';

// fitでのgit管理のため準備をする
export const setup = async (io: ICommonIO, git: SimpleGit) => {
    // リモートリポジトリへの登録(既に登録済みの場合はスキップ)
    const hasAddRemote = (await git.getRemotes())
        .some((remote) => remote.name === config.REMOTE_DEFAULT);
    let remoteURL = '';
    if (!hasAddRemote) {
        remoteURL = await io.input('リモートリポジトリのURLを入力。指定しない場合は空白のまま。');
        if (remoteURL !== '') {
            await git.listRemote([`${remoteURL}`]);
            await git.addRemote(config.REMOTE_DEFAULT, remoteURL);
        }
    }

    // first commit がなければ、空のコミットを行う
    const isNothingCommit = (await git.branch()).all.length === 0;
    if (isNothingCommit) {
        await git.commit(`${config.COMMIT_MSG_AUTO} first commit.`, ['--allow-empty']);
    }

    // インデックスが空でなければ終了
    const stagingFileSplited = (await git.diff(['--name-only', '--cached'])).trimRight().split('\n');
    let stagingFiles = [];
    if (stagingFileSplited[0] !== '') {
        stagingFiles = stagingFileSplited;
    }
    if (stagingFiles.length > 0) {
        throw new Error('index is not empty.');
    }

    // デフォルトのブランチ名を変更(既に変更済みの場合はスキップ)
    const branchList = await git.branch();
    const existsBranch = (branchName: string) => branchList.all.some((name) => branchName === name);
    if (existsBranch(config.BRANCH_NAME_DEFAULT) && !existsBranch(config.BRANCH_NAME_MAIN)) {
        await git.branch(['--move', config.BRANCH_NAME_DEFAULT, config.BRANCH_NAME_MAIN]);
    }

    // テンプレートの.gitignoreをルートディレクトリ直下に追加しコミットする(.gitignoreが既に存在すればスキップ)
    const rootDirPath = await git.revparse(['--show-toplevel']);
    const rootIgnorePath = path.join(rootDirPath, '.gitignore');
    try {
        await fs.stat(rootIgnorePath);
    } catch {
        await git.checkout(config.BRANCH_NAME_MAIN);
        const templateIgnorePath = path.join(config.TEMPLATE_DIR_PATH, '.gitignore');
        const text = await fs.readFile(templateIgnorePath);
        await fs.writeFile(rootIgnorePath, text);
        await git.add(rootIgnorePath);
        await git.commit(`${config.COMMIT_MSG_AUTO} add gitignore.`);
    }

    // gitlab flow production の作成(既に作成済みの場合はスキップ)
    try {
        await git.revparse(['--verify', `refs/heads/${config.BRANCH_NAME_PRODUCTION}`]);
    } catch {
        let firstCommitId = (await git.raw(['rev-list', '--max-parents=0', config.BRANCH_NAME_MAIN])).trim();
        if (firstCommitId === '') {
            const firstCommit = await git.commit(`${config.COMMIT_MSG_AUTO} first commit.`, ['--allow-empty']);
            await git.branch([config.BRANCH_NAME_PRODUCTION, firstCommit.commit]);
        } else {
            await git.branch([config.BRANCH_NAME_PRODUCTION, firstCommitId]);
        }
        await git.checkout(config.BRANCH_NAME_MAIN);
    }
};