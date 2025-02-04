import * as vscode from 'vscode';
import { marked } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
    breaks: true,
    gfm: true
});

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
            .message-content {
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 0;
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
            .think-block {
                background-color: var(--vscode-textBlockQuote-background);
                border-left: 3px solid var(--vscode-textBlockQuote-border);
                padding: 8px;
                margin: 8px 0;
                font-style: italic;
                opacity: 0.8;
            }
            code {
                font-family: var(--vscode-editor-font-family);
                background-color: var(--vscode-textCodeBlock-background);
                padding: 2px 4px;
                border-radius: 3px;
            }
            pre code {
                display: block;
                padding: 8px;
                margin: 8px 0;
                overflow-x: auto;
            }
            blockquote {
                border-left: 3px solid var(--vscode-textBlockQuote-border);
                margin: 0 0 0 8px;
                padding-left: 8px;
                color: var(--vscode-textBlockQuote-foreground);
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
                        
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'message-content';
                        // For user messages, just use text content
                        if (message.sender === 'user') {
                            contentDiv.textContent = message.message;
                        } else {
                            // For assistant messages, parse markdown and preserve think blocks
                            contentDiv.innerHTML = message.message;
                        }
                        
                        messageDiv.appendChild(senderDiv);
                        messageDiv.appendChild(contentDiv);
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