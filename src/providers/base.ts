import type { Config } from '../config/index.js';
import type { Message, ChatOptions } from './types.js';

/**
 * Abstract base class for AI providers
 * Defines the interface that all providers (Claude, OpenAI) must implement
 */
export abstract class BaseProvider {
  protected systemPrompt: string;

  constructor(protected config: Config, systemPrompt?: string) {
    this.systemPrompt = systemPrompt || this.getDefaultSystemPrompt();
  }

  /**
   * Send a message to the AI provider and get a response
   */
  abstract chat(messages: Message[], options?: ChatOptions): Promise<string>;

  /**
   * Get the name of this provider
   */
  abstract getProviderName(): string;

  /**
   * Get the default system prompt
   * Can be overridden by subclasses
   */
  protected getDefaultSystemPrompt(): string {
    return `You are an AI assistant helping users interact with their Jira and Confluence instances.

You have access to:
1. **MCP Tools** for Jira and Confluence operations
2. **Skills** containing best practices for:
   - Jira workflow management
   - Confluence documentation
   - Trading domain context

**Your Capabilities:**

Jira:
- Search tickets using JQL
- Get sprint tasks
- Create and update tickets
- Add comments
- Analyze priorities and blockers

Confluence:
- Search pages
- Read page content
- Create and update pages
- Get recent updates
- Suggest documentation structure

**Guidelines:**

1. **Use MCP Tools** to interact with Jira/Confluence
2. **Reference Skills** for best practices and patterns
3. **Provide context** from the trading domain when relevant
4. **Be proactive**: Suggest improvements based on best practices
5. **Format output** clearly with ticket keys, links, and summaries

When users ask about their work:
- Fetch their current sprint tasks
- Highlight priorities and blockers
- Suggest next actions based on ticket status

When users search documentation:
- Find relevant Confluence pages
- Summarize key information
- Link to related pages

Always be helpful, accurate, and follow industry best practices from the Skills.`;
  }

  /**
   * Update the system prompt (useful for adding Skills context)
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Get the current system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
