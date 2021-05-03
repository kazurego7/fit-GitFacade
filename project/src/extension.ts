// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setup } from './usecase/setup';
import { feat } from './usecase/feat';
import { fix } from './usecase/fix';
import { swing } from './usecase/swing';
import { refeat } from './usecase/refeat';
import { refix } from './usecase/refix';
import { follow } from './usecase/follow';
import { VSCodeIO } from "./ioImplement/vscodeIO";
import simpleGit, { SimpleGit } from 'simple-git';
import { ICommonIO } from './ioInterface/commonIO';
import * as path from 'path';
import { GitExtension } from './api/git';
import * as config from './util/config';
import { avoid } from './usecase/avoid';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	/**
	 * ワークスペースから、Gitのリポジトリを1つ選ばせる
	 */
	const chooseGit = async (io: ICommonIO) => {
		const gitApi = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports?.getAPI(1);
		if (gitApi === undefined) {
			throw new Error("git api is not available.");
		} else {
			const choices = await Promise.all(
				gitApi.repositories.map(async (repo) => {
					const git = simpleGit(repo.rootUri.fsPath);
					const rootPath = await git.revparse(['--show-toplevel']);
					const rootDirName = path.basename(rootPath);
					let branchName = (await (git.branch())).current;
					if (branchName === '') {
						const defaultBranch = (await git.raw(['config', '--global', 'init.defaultBranch'])).trim();
						branchName = defaultBranch === '' ? 'master' : defaultBranch;
					}
					return {
						label: `${rootDirName}`,
						description: `${branchName}`,
						data: git
					};
				})
			);
			if (choices.length < 1) {
				await vscode.window.showInformationMessage(`ワークスペースに git のリポジトリが存在しません。`);
				return;
			} else if (choices.length === 1) {
				return choices[0].data;
			} else {
				return io.select(choices);
			}
		}
	};

	/**
	 * 簡易的なエラー表示をする
	 */
	const showError = async (error: Error) => {
		vscode.window.showErrorMessage(`${error.name} : ${error.message}`);
	};

	/**
	 * GUI の Command を作成する
	 * @param executor usecaseの関数
	 */
	const createGUICommand = (executor: (io: ICommonIO, git: SimpleGit) => Promise<void>) => {
		return async () => {
			const io: ICommonIO = new VSCodeIO();
			const git = await chooseGit(io);
			if (git === undefined) {
				return;
			} else {
				try {
					await executor(io, git);
				} catch (e) {
					showError(e);
				}
			}
		};
	};

	// コマンドの登録
	const handlers = [
		vscode.commands.registerCommand('fit.setup', createGUICommand(setup)),
		vscode.commands.registerCommand('fit.feat', createGUICommand(feat)),
		vscode.commands.registerCommand('fit.fix', createGUICommand(fix)),
		vscode.commands.registerCommand('fit.swing', createGUICommand(swing)),
		vscode.commands.registerCommand('fit.refeat', createGUICommand(refeat)),
		vscode.commands.registerCommand('fit.refix', createGUICommand(refix)),
		vscode.commands.registerCommand('fit.follow', createGUICommand(follow)),
		vscode.commands.registerCommand('fit.avoid', createGUICommand(avoid)),
	];

	handlers.forEach((handler, _i, _handlers) => {
		context.subscriptions.push(handler);
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
