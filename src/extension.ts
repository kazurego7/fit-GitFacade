// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sayBye } from './usecase/sayBye';
import { sayHello } from './usecase/sayHello';
import { VSCodeIO } from "./IO/VSCodeIO";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fit" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const io = new VSCodeIO();
	const handlers = [
		vscode.commands.registerCommand('fit.helloWorld', () => sayHello(io)),
		vscode.commands.registerCommand('fit.goodBye', () => sayBye(io))
	];

	handlers.forEach((handler, i, handlers) => {
		context.subscriptions.push(handler);
	});

}

// this method is called when your extension is deactivated
export function deactivate() { }
