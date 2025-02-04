import * as vscode from 'vscode';
import { ModelConfig, defaultConfig, buildPrompt } from '../config/prompts';

export async function handleDeepSeekResponse(response: Response): Promise<string> {
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
    
    return fullResponse;
}

export async function sendMessageToDeepSeek(prompt: string, config: ModelConfig = defaultConfig): Promise<Response> {
    const fullPrompt = buildPrompt(prompt, config);
    
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