import * as vscode from 'vscode';

class ChatViewProvider implements vscode.WebviewViewProvider {
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

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

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
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    model: "deepseek-r1:1.5b", 
                    prompt
                }),
            });

            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            let fullResponse = '';
            let lastResponseEndsWithSpace = true;
            
            for (const line of lines) {
                try {
                    const jsonResponse = JSON.parse(line);
                    if (jsonResponse.response) {
                        let cleanResponse = jsonResponse.response.trim();
                        if (!cleanResponse) continue;
                        
                        // Add line break after </think>
                        cleanResponse = cleanResponse.replace('</think>', '</think>\n');
                        
                        if (!lastResponseEndsWithSpace && 
                            !cleanResponse.match(/^[.,!?;:]/) && 
                            !cleanResponse.match(/^\s/)) {
                            fullResponse += ' ';
                        }
                        
                        fullResponse += cleanResponse;
                        lastResponseEndsWithSpace = cleanResponse.endsWith(' ') || cleanResponse.endsWith('\n');
                    }
                } catch (e) {
                    console.error('Error parsing JSON line:', e);
                }
            }

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

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DeepSeek Chat</title>
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    font-family: var(--vscode-font-family);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    padding: 0;
                    margin: 0;
                }
                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .input-container {
                    padding: 10px;
                    border-top: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-editor-background);
                }
                .message {
                    display: flex;
                    flex-direction: column;
                    max-width: 85%;
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin: 4px 0;
                }
                .user-message {
                    align-self: flex-end;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .assistant-message {
                    align-self: flex-start;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                }
                .sender {
                    font-size: 0.8em;
                    margin-bottom: 4px;
                    opacity: 0.7;
                }
                pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin: 0;
                }
                #prompt-input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border-radius: 4px;
                    outline: none;
                    box-sizing: border-box;
                }
                #prompt-input:focus {
                    border-color: var(--vscode-focusBorder);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="chat-container" id="chat"></div>
                <div class="input-container">
                    <input type="text" id="prompt-input" placeholder="Type your message..." />
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const chatContainer = document.getElementById('chat');
                const promptInput = document.getElementById('prompt-input');

                // Handle messages
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'addMessage':
                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'message ' + (message.sender === 'user' ? 'user-message' : 'assistant-message');
                            
                            const senderDiv = document.createElement('div');
                            senderDiv.className = 'sender';
                            senderDiv.textContent = message.sender === 'user' ? 'You' : 'DeepSeek';
                            
                            const contentPre = document.createElement('pre');
                            contentPre.textContent = message.message;
                            
                            messageDiv.appendChild(senderDiv);
                            messageDiv.appendChild(contentPre);
                            chatContainer.appendChild(messageDiv);
                            
                            // Scroll to bottom
                            messageDiv.scrollIntoView({ behavior: 'smooth' });
                            break;
                    }
                });

                // Handle input
                promptInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && promptInput.value.trim()) {
                        vscode.postMessage({
                            type: 'prompt',
                            value: promptInput.value.trim()
                        });
                        promptInput.value = '';
                    }
                });
            </script>
        </body>
        </html>`;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('DeepSeek Assistant is now active!');

    const provider = new ChatViewProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('deepseek-chat-view', provider)
    );
}

export function deactivate() {}
