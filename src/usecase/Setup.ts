import { SimpleGit } from 'simple-git';
import { ICommonIO } from '../IOInterface/ICommonIO';
import * as path from 'path';
import { promises as fs, Stats } from 'fs';
import * as config from '../util/Config';

export const setup = async (io: ICommonIO, git: SimpleGit) => {
    // インデックスが空でなければ終了
    const stagingFiles = (await git.diff(['--name-only', '--cached'])).trimRight().split('\n');
    if (stagingFiles.length > 0) {
        throw new Error('index is not empty.');
    }

    // デフォルトのブランチ名を変更(既に変更済みの場合はスキップ)
    try {
        await git.revparse(['--verify', `refs/heads/${config.BRANCH_NAME_DEFAULT}`]);
        try {
            await git.revparse(['--verify', config.BRANCH_NAME_MAIN]);
            throw new Error(`Both ${config.BRANCH_NAME_DEFAULT} and ${config.BRANCH_NAME_MAIN} branches exist.`);
        } catch {
            await git.branch(['--move', config.BRANCH_NAME_DEFAULT, config.BRANCH_NAME_MAIN]);
        }
    } catch { }

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

    // リモートリポジトリへの登録(既に登録済みの場合はスキップ)
    const hasAddRemote = (await git.getRemotes())
        .some((remote) => remote.name === 'origin');
    let remoteURL = '';
    if (!hasAddRemote) {
        remoteURL = await io.input('リモートリポジトリのURLを入力。指定しない場合は空白のまま。');
        if (remoteURL !== '') {
            await git.listRemote([`${remoteURL}`]);
            await git.addRemote('origin', remoteURL);
        }
    }
};