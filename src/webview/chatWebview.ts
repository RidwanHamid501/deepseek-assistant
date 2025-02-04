import * as vscode from 'vscode';

export function getWebviewContent(): string {
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