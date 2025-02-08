import * as vscode from 'vscode';
import { ModelConfig, defaultConfig, buildPrompt } from '../config/prompts';
import { ConversationHistory } from '../types/chat';
import { marked } from 'marked';
// Configure marked with all necessary options
marked.setOptions({
    breaks: true,
    gfm: true
});
// Remove custom renderer and just use marked's default renderer
// This will still handle code blocks properly while avoiding type issues

function addCopyButtons(html: string): string {
    return html.replace(
        /<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g,
        '<div class="code-block-container"><div class="code-block-header"><button class="copy-button" onclick="copyCode(this)">📋</button></div><pre><code$1>$2</code></pre></div>'
    );
}

export async function handleResponse(response: Response): Promise<string> {
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    let fullResponse = '';
    let inThinkBlock = false;
    let currentThinkContent = '';
    let markdownBuffer = '';
    
    for (const line of lines) {
        try {
            const jsonResponse = JSON.parse(line);
            if (jsonResponse.response) {
                let content = jsonResponse.response;
                // Handle think tags
                if (content.includes('<think>')) {
                    // Parse any accumulated markdown before the think block
                    if (markdownBuffer.trim()) {
                        const parsedMarkdown = marked.parse(markdownBuffer.trim());
                        fullResponse += addCopyButtons(parsedMarkdown.toString());
                        markdownBuffer = '';
                    }
                    inThinkBlock = true;
                    content = content.replace('<think>', '');
                }
                if (inThinkBlock) {
                    if (content.includes('</think>')) {
                        inThinkBlock = false;
                        currentThinkContent += content.replace('</think>', '');
                        fullResponse += `<div class="think-block">${currentThinkContent}</div>\n`;
                        currentThinkContent = '';
                    } else {
                        currentThinkContent += content;
                    }
                } else {
                    // Accumulate content for markdown parsing
                    markdownBuffer += content;
                }
            }
        } catch (e) {
            console.error('Error parsing JSON line:', e);
        }
    }

    // Parse any remaining markdown content
    if (markdownBuffer.trim()) {
        const parsedMarkdown = marked.parse(markdownBuffer.trim());
        fullResponse += addCopyButtons(parsedMarkdown.toString());
    }
    
    return fullResponse;
}

export async function sendMessage(prompt: string, history: ConversationHistory, config: ModelConfig = defaultConfig): Promise<Response> {
    const fullPrompt = buildPrompt(prompt, history, config);
    return fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            model: config.model,
            prompt: fullPrompt,
            temperature: config.temperature
        }),
    });
} 