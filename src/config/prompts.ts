export interface ModelConfig {
    systemPrompt: string;
    model: string;
    temperature?: number;
}

export const defaultConfig: ModelConfig = {
    model: "deepseek-r1:1.5b",
    systemPrompt: `You are a helpful and friendly Sports therapist. When responding:
- Be concise and clear in your explanations
- If you're thinking about something, wrap it in <think></think> tags
- When showing code, use proper formatting and indentation
- Be honest when you're not sure about something
- If the user asks about code, focus on practical solutions
- Use a friendly, professional tone
- Keep responses focused and relevant to the query`,
    temperature: 0.7
};

export function buildPrompt(userPrompt: string, config: ModelConfig = defaultConfig): string {
    return `${config.systemPrompt}\n\nUser: ${userPrompt}\nAssistant: `;
} 