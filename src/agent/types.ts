/**
 * Agent types and interfaces
 */

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentOptions {
  maxHistory?: number;
  enableMCP?: boolean;
  enableSkills?: boolean;
}
