import * as vscode from 'vscode';
import { getWebviewContent } from '../webview/chatWebview';
import { handleDeepSeekResponse, sendMessageToDeepSeek } from '../handlers/messageHandler';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = getWebviewContent();

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            if (data.type === 'prompt') {
                await this.handlePrompt(data.value);
            }
        });
    }

    private async handlePrompt(prompt: string) {
        if (!this._view) return;

        // Add user message to chat
        this._view.webview.postMessage({
            type: 'addMessage',
            message: prompt,
            sender: 'user'
        });

        try {
            const response = await sendMessageToDeepSeek(prompt);
            const fullResponse = await handleDeepSeekResponse(response);

            if (fullResponse) {
                this._view.webview.postMessage({
                    type: 'addMessage',
                    message: fullResponse,
                    sender: 'assistant'
                });
            }
        } catch (error) {
            console.error('Error fetching response from DeepSeek:', error);
            vscode.window.showErrorMessage("Failed to connect to DeepSeek. Is Ollama running?");
        }
    }
} 