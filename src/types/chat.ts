export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ConversationHistory {
    messages: ChatMessage[];
} 