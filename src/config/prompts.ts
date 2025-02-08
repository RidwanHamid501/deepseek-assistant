import { ConversationHistory } from '../types/chat';

export interface ModelConfig {
    model: string;
    systemPrompt: string;
    temperature?: number;
}

export const defaultConfig: ModelConfig = {
    model: "deepseek-r1:1.5b",
    systemPrompt: `You are Coding Assistant. You help users write, understand, and debug code.
You are direct and concise in your responses. You provide practical solutions and explain your reasoning clearly.

When responding:
- Be concise and clear in your explanations
- Use markdown formatting for better readability:
  * Use \`code blocks\` for code snippets
  * Use **bold** for emphasis
  * Use bullet points for lists
  * Use > for quotes
  * Use ### for section headers
  * Use \`\`\` for multi-line code blocks
- If you're thinking about something, wrap it in <think></think> tags
- Be honest when you're not sure about something
- Use a friendly, professional tone
- Keep responses focused and relevant to the query`,
    temperature: 0.7
};

export function buildPrompt(userPrompt: string, history: ConversationHistory, config: ModelConfig = defaultConfig): string {
    let fullPrompt = config.systemPrompt + "\n\n";
    
    // Add conversation history
    for (const message of history.messages) {
        if (message.role === 'user') {
            fullPrompt += `User: ${message.content}\n\n`;
        } else {
            fullPrompt += `You: ${message.content}\n\n`;
        }
    }
    
    // Add current prompt
    fullPrompt += `User: ${userPrompt}\n\nYou: `;
    
    return fullPrompt;
} 