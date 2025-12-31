import OpenAI from 'openai';
import { BaseProvider } from './base.js';
import type { Config } from '../config/index.js';
import type { Message, ChatOptions } from './types.js';

/**
 * OpenAI provider using OpenAI SDK
 * Implements direct integration without openai-agents package
 */
export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: Config, systemPrompt?: string) {
    super(config, systemPrompt);

    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required for OpenAI provider');
    }

    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
    });

    // Use custom model name if provided, otherwise use default
    this.model = config.modelName || 'gpt-4';

    console.error(`OpenAI provider initialized with model: ${this.model}`);
  }

  /**
   * Send a message to OpenAI and get a response
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    try {
      // Add system message at the beginning if not present
      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.systemPrompt,
        },
        ...messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: chatMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature,
      });

      const content = response.choices[0]?.message?.content || '';

      return content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'openai';
  }

  /**
   * Get the model name being used
   */
  getModel(): string {
    return this.model;
  }
}
