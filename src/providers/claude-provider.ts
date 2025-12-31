import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.js';
import type { Config } from '../config/index.js';
import type { Message, ChatOptions } from './types.js';

/**
 * Claude AI provider using Anthropic SDK
 * Implements direct integration without claude-agent-sdk
 */
export class ClaudeProvider extends BaseProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: Config, systemPrompt?: string) {
    super(config, systemPrompt);

    if (!config.anthropicApiKey) {
      throw new Error('Anthropic API key is required for Claude provider');
    }

    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    // Use custom model name if provided, otherwise use default
    this.model = config.modelName || 'claude-3-5-sonnet-20241022';

    console.error(`Claude provider initialized with model: ${this.model}`);
  }

  /**
   * Send a message to Claude and get a response
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature,
        system: this.systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content,
        })),
      });

      // Extract text content from response
      const textContent = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      return textContent;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error(`Claude API error: ${error}`);
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'claude';
  }

  /**
   * Get the model name being used
   */
  getModel(): string {
    return this.model;
  }
}
