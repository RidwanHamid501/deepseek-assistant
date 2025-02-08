import * as vscode from 'vscode';
import { getWebviewContent } from '../webview/chatWebview';
import { handleResponse, sendMessage } from '../handlers/messageHandler';
import { ChatMessage, ConversationHistory } from '../types/chat';
import { defaultConfig } from '../config/prompts';
import * as path from 'path';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _conversationHistory: ConversationHistory = { messages: [] };

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
            switch (data.type) {
                case 'prompt':
                    await this.handlePrompt(data.content, data.selectedFile);
                    break;
                case 'refreshFiles':
                    await this.refreshFileList();
                    break;
            }
        });

        // Initial file list
        this.refreshFileList();
    }

    private async refreshFileList() {
        if (!this._view) return;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const files: string[] = [];
        for (const folder of workspaceFolders) {
            const pattern = new vscode.RelativePattern(folder, '**/*');
            const fileUris = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
            
            for (const uri of fileUris) {
                const relativePath = path.relative(folder.uri.fsPath, uri.fsPath);
                files.push(relativePath);
            }
        }

        this._view.webview.postMessage({
            type: 'updateFiles',
            files: files
        });
    }

    private async handlePrompt(prompt: string, selectedFile?: string) {
        if (!this._view) return;

        let fileContent = '';
        if (selectedFile) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const fileUri = vscode.Uri.file(path.join(workspaceFolders[0].uri.fsPath, selectedFile));
                try {
                    const document = await vscode.workspace.openTextDocument(fileUri);
                    fileContent = document.getText();
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            }
        }

        // Add user message to chat and history
        const userMessage: ChatMessage = { 
            role: 'user', 
            content: selectedFile ? 
                `File: ${selectedFile}\n\n${fileContent}\n\nQuestion: ${prompt}` : 
                prompt 
        };
        this._conversationHistory.messages.push(userMessage);

        this._view.webview.postMessage({
            type: 'addMessage',
            content: prompt,
            role: 'user'
        });

        try {
            const response = await sendMessage(prompt, this._conversationHistory, defaultConfig);
            const fullResponse = await handleResponse(response);

            if (fullResponse) {
                // Add assistant message to history (without think blocks)
                const cleanResponse = fullResponse.replace(/<div class="think-block">.*?<\/div>/gs, '').trim();
                const assistantMessage: ChatMessage = { role: 'assistant', content: cleanResponse };
                this._conversationHistory.messages.push(assistantMessage);

                this._view.webview.postMessage({
                    type: 'addMessage',
                    content: fullResponse,
                    role: 'assistant'
                });
            }
        } catch (error) {
            console.error('Error fetching response from DeepSeek:', error);
            vscode.window.showErrorMessage("Failed to connect to DeepSeek. Is Ollama running?");
        }
    }
} 