import * as vscode from 'vscode';
import { ChatViewProvider } from './providers/chatViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('DeepSeek Assistant is now active!');

    const provider = new ChatViewProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('deepseek-chat-view', provider)
    );
}

export function deactivate() {}
