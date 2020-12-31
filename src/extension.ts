// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sayBye } from './usecase/sayBye';
import { setup } from './usecase/Setup';
import { VSCodeIO } from "./IO/VSCodeIO";
import simpleGit from 'simple-git';
import { sayHello } from './usecase/sayHello';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// choose git repository in workspace.
	const chooseGit = async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders === undefined) {
			return Promise.reject("folder is not found.");
		} else {
			const gitDirs = workspaceFolders
				.map((folder) => {
					return { git: simpleGit(folder.uri.path), dir: folder.name };
				})
				.filter((gitDir) => gitDir.git.checkIsRepo());
			const pickItems: vscode.QuickPickItem[] = gitDirs.map((gitDir, i) => {
				return {
					label: `${gitDir.dir}`,
					description: `${gitDir.git.revparse('--abbrev-ref HEAD')}`
				};
			});
			const picked = await vscode.window.showQuickPick(pickItems);
			const pickedIndex = pickItems
				.map((item, i) => { return { item: item, index: i }; })
				.filter((itemIx) => itemIx.item === picked)[0];
			return gitDirs[pickedIndex.index].git;
		}
	};

	// command event
	const io = new VSCodeIO();
	const handlers = [
		vscode.commands.registerCommand('fit.setup', () => {
			chooseGit().then((git) => setup(io, git));
		}),

		vscode.commands.registerCommand('fit.helloWorld', () => sayHello(io)),
		vscode.commands.registerCommand('fit.goodBye', () => sayBye(io))
	];

	handlers.forEach((handler, _i, _handlers) => {
		context.subscriptions.push(handler);
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
