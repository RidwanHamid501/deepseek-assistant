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
                overflow: hidden;
            }
            .chat-container {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .bottom-container {
                flex-shrink: 0;
                border-top: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-editor-background);
            }
            .input-container {
                padding: 10px;
                background-color: var(--vscode-editor-background);
                position: relative;
            }
            .selected-file {
                position: absolute;
                left: 18px;
                top: 18px;
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                z-index: 2;
            }
            .selected-file .remove {
                cursor: pointer;
                opacity: 0.8;
            }
            .selected-file .remove:hover {
                opacity: 1;
            }
            .file-button {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                padding: 4px 8px;
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                z-index: 2;
            }
            .file-button:hover {
                background: var(--vscode-button-hoverBackground);
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
            .code-block-container {
                position: relative;
                margin: 8px 0;
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                background-color: var(--vscode-textCodeBlock-background);
            }
            .code-block-header {
                padding: 1px 8px;
                border-bottom: 1px solid var(--vscode-input-border);
                display: flex;
                justify-content: flex-end;
                align-items: center;
                height: 16px;
                background-color: var(--vscode-textCodeBlock-background);
            }
            .copy-button {
                background: none;
                border: none;
                color: var(--vscode-button-foreground);
                cursor: pointer;
                padding: 2px;
                font-size: 12px;
                opacity: 0.7;
            }
            .copy-button:hover {
                opacity: 1;
            }
            pre {
                margin: 0;
            }
            pre code {
                display: block;
                padding: 12px;
                margin: 0;
                overflow-x: auto;
                background-color: var(--vscode-textCodeBlock-background);
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
                padding-right: 100px;
                padding-top: 32px;
                border: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border-radius: 4px;
                outline: none;
                box-sizing: border-box;
                min-height: 100px;
            }
            #prompt-input:focus {
                border-color: var(--vscode-focusBorder);
            }
            #file-selector {
                display: none;
                position: absolute;
                right: 20px;
                top: 0;
                transform: translateY(-100%);
                width: 400px;
                max-height: 300px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 4px;
                z-index: 3;
            }
            .file-search {
                position: sticky;
                top: 0;
                padding: 8px;
                background: var(--vscode-input-background);
                border-bottom: 1px solid var(--vscode-input-border);
            }
            .file-search input {
                width: calc(100% - 16px);
                padding: 4px 8px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                color: white;
                border-radius: 2px;
                outline: none;
                box-sizing: border-box;
            }
            .file-search input:focus {
                border-color: var(--vscode-focusBorder);
            }
            .file-list {
                overflow-y: auto;
                max-height: 250px;
            }
            .file-option {
                padding: 6px 8px;
                cursor: pointer;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
            }
            .file-option:hover {
                background: var(--vscode-list-hoverBackground);
            }
            .file-name {
                font-weight: 500;
                white-space: nowrap;
            }
            .file-path {
                opacity: 0.6;
                font-size: 0.9em;
                text-align: right;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="chat-container" id="chat-container"></div>
            <div class="input-container">
                <input type="text" id="prompt-input" placeholder="Type your message..." />
                <div id="selected-file" class="selected-file" style="display: none">
                    <span class="file-text"></span>
                    <span class="remove">×</span>
                </div>
                <div id="file-selector">
                    <div class="file-search">
                        <input type="text" id="file-search-input" placeholder="Search files..." />
                    </div>
                    <div class="file-list"></div>
                </div>
                <button class="file-button" id="add-files-btn">+ Add files</button>
            </div>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            const chatContainer = document.getElementById('chat-container');
            const promptInput = document.getElementById('prompt-input');
            const fileSelector = document.getElementById('file-selector');
            const addFilesBtn = document.getElementById('add-files-btn');
            const fileList = document.querySelector('.file-list');
            const fileSearchInput = document.getElementById('file-search-input');
            const selectedFileElement = document.getElementById('selected-file');
            const selectedFileText = selectedFileElement.querySelector('.file-text');
            let allFiles = [];
            let selectedFile = null;

            // Handle file selector button click
            addFilesBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'refreshFiles' });
                fileSelector.style.display = 'block';
                fileSearchInput.focus();
                fileSearchInput.value = '';
                document.addEventListener('click', handleClickOutside);
            });

            function handleClickOutside(event) {
                if (!fileSelector.contains(event.target) && event.target !== addFilesBtn) {
                    fileSelector.style.display = 'none';
                    document.removeEventListener('click', handleClickOutside);
                }
            }

            fileSearchInput.addEventListener('input', () => {
                const searchTerm = fileSearchInput.value.toLowerCase();
                const filteredFiles = allFiles.filter(file => 
                    file.toLowerCase().includes(searchTerm)
                );
                renderFileList(filteredFiles);
            });

            function updateFileList(files) {
                allFiles = files;
                renderFileList(files);
            }

            function renderFileList(files) {
                fileList.innerHTML = '';
                files.forEach(file => {
                    const div = document.createElement('div');
                    div.className = 'file-option';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'file-name';
                    const fileName = file.split('/').pop();
                    nameSpan.textContent = fileName;
                    
                    const pathSpan = document.createElement('span');
                    pathSpan.className = 'file-path';
                    const filePath = file.substring(0, file.length - fileName.length);
                    pathSpan.textContent = filePath;
                    
                    div.appendChild(nameSpan);
                    div.appendChild(pathSpan);
                    
                    div.addEventListener('click', () => {
                        selectedFile = file;
                        selectedFileText.textContent = fileName;
                        selectedFileElement.style.display = 'flex';
                        promptInput.style.paddingTop = '32px';
                        fileSelector.style.display = 'none';
                        document.removeEventListener('click', handleClickOutside);
                    });
                    
                    fileList.appendChild(div);
                });
            }

            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.type) {
                    case 'addMessage':
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'message ' + (message.role === 'user' ? 'user-message' : 'assistant-message');
                        
                        const senderDiv = document.createElement('div');
                        senderDiv.className = 'sender';
                        senderDiv.textContent = message.role === 'user' ? 'You' : 'DeepSeek';
                        
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'message-content';
                        // For user messages, just use text content
                        if (message.role === 'user') {
                            contentDiv.textContent = message.content;
                        } else {
                            // For assistant messages, parse markdown and preserve think blocks
                            contentDiv.innerHTML = message.content;
                        }
                        
                        messageDiv.appendChild(senderDiv);
                        messageDiv.appendChild(contentDiv);
                        chatContainer.appendChild(messageDiv);
                        
                        // Scroll to bottom
                        messageDiv.scrollIntoView({ behavior: 'smooth' });
                        break;
                    case 'updateFiles':
                        updateFileList(message.files);
                        break;
                }
            });

            selectedFileElement.querySelector('.remove').addEventListener('click', () => {
                selectedFile = null;
                selectedFileElement.style.display = 'none';
                promptInput.style.paddingTop = '8px';
            });

            // Update the message sending to include selected file
            promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const message = promptInput.value.trim();
                    if (message) {
                        vscode.postMessage({
                            type: 'prompt',
                            content: message,
                            selectedFile: selectedFile
                        });
                        promptInput.value = '';
                    }
                }
            });

            // Copy code function
            window.copyCode = (button) => {
                const codeBlock = button.closest('.code-block-container').querySelector('code');
                const code = codeBlock.textContent;
                navigator.clipboard.writeText(code);
                
                // Show feedback
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.opacity = '1';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.opacity = '0.7';
                }, 1500);
            };
        </script>
    </body>
    </html>`;
}

function addCopyButtons(html: string): string {
    return html.replace(
        /<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g,
        '<div class="code-block-container"><div class="code-block-header"><button class="copy-button" onclick="copyCode(this)">📋</button></div><pre><code$1>$2</code></pre></div>'
    );
}