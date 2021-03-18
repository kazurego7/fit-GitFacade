import { SimpleGit } from 'simple-git';
import { ICommonIO } from '../ioInterface/commonIO';
import * as path from 'path';
import { promises as fs, Stats } from 'fs';
import * as config from '../util/config';

/**
 * fitでのgit管理のため準備をする  
 * - リモートリポジトリへの登録(既に登録済みの場合はスキップ)
 * - first commit がなければ、空のコミットを行う
 * - テンプレートの.gitignoreを指定のディレクトリに追加しコミットする(.gitignoreが既に存在すればスキップ)
 * @param io 
 * @param git 
 */
export const setup = async (io: ICommonIO, git: SimpleGit) => {
    // リモートリポジトリへの登録(既に登録済みの場合はスキップ)
    const hasAddRemote = (await git.getRemotes())
        .some((remote) => remote.name === config.REMOTE_DEFAULT);
    if (!hasAddRemote) {
        const remoteURL = await io.input('リモートリポジトリのURLを入力。指定しない場合は空白のまま。');
        if (remoteURL !== undefined && remoteURL !== '') {
            await git.listRemote([`${remoteURL}`]);
            await git.addRemote(config.REMOTE_DEFAULT, remoteURL);
        }
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

    // first commit がなければ、空のコミットを行う
    const isNothingCommit = (await git.branch()).all.length === 0;
    if (isNothingCommit) {
        await git.commit(`${config.COMMIT_MSG_AUTO} first commit.`, ['--allow-empty']);
    }

    // テンプレートの.gitignoreを指定のディレクトリに追加しコミットする(.gitignoreが既に存在すればスキップ)
    const rootDirPath = await git.revparse(['--show-toplevel']);
    const rootIgnorePath = path.join(rootDirPath, config.GITIGNORE_DIR_PATH, '.gitignore');
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
};