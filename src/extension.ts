// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setup } from './usecase/setup';
import { feat } from './usecase/feat';
import { swing } from './usecase/swing';
import { replant } from './usecase/replant';
import { VSCodeIO } from "./ioImplement/vscodeIO";
import simpleGit from 'simple-git';
import { ICommonIO } from './ioInterface/commonIO';
import * as path from 'path';
import { GitExtension } from './api/git';
import * as config from './util/config';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	const io: ICommonIO = new VSCodeIO();


	// TODO: ワークスペースにGit管理されたディレクトリが1つもないとき、コマンドパレットに表示しないようにする
	// ワークスペースから、Gitのリポジトリを1つ選ばせる
	const chooseGit = async () => {
		const gitApi = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports?.getAPI(1);
		if (gitApi === undefined) {
			throw new Error("git api is not available.");
		} else {
			const choices = await Promise.all(
				gitApi.repositories.map(async (repo) => {
					const git = simpleGit(repo.rootUri.path);
					const rootPath = await git.revparse(['--show-toplevel']);
					const rootDirName = path.basename(rootPath);
					let branchName = (await (git.branch())).current;
					if (branchName === '') {
						branchName = config.BRANCH_NAME_DEFAULT;
					}
					return {
						label: `${rootDirName}`,
						description: `${branchName}`,
						data: git
					};
				})
			);
			if (choices.length < 1) {
				throw new Error("git is not found");
			} else {
				return io.select(choices);
			}
		}
	};

	// command event
	const handlers = [
		vscode.commands.registerCommand('fit.setup', () => {
			chooseGit().then((git) => setup(io, git));
		}),
		vscode.commands.registerCommand('fit.feat', () => {
			chooseGit().then((git) => feat(io, git));
		}),
		vscode.commands.registerCommand('fit.swing', () => {
			chooseGit().then((git) => swing(io, git));
		}),
		vscode.commands.registerCommand('fit.replant', () => {
			chooseGit().then((git) => replant(io, git));
		})
	];

	handlers.forEach((handler, _i, _handlers) => {
		context.subscriptions.push(handler);
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
