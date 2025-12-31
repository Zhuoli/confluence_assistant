import { spawn, ChildProcess } from 'child_process';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Config } from '../config/index.js';
import { SkillsLoader } from '../skills/loader.js';
import { createProvider, type BaseProvider } from '../providers/index.js';
import type { Message } from '../providers/types.js';
import type { ConversationMessage, AgentOptions } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Atlassian Agent SDK
 * Main orchestrator that integrates MCP server, Skills, and AI providers
 */
export class AtlassianAgentSDK {
  private skillsLoader: SkillsLoader;
  private provider: BaseProvider;
  private mcpProcess?: ChildProcess;
  private conversationHistory: ConversationMessage[] = [];
  private maxHistory: number;
  private initialized: boolean = false;

  constructor(private config: Config, private options: AgentOptions = {}) {
    this.maxHistory = options.maxHistory || 20;

    // Determine skills directory (relative to project root)
    const projectRoot = resolve(__dirname, '..', '..');
    const skillsDir = join(projectRoot, '.claude', 'skills');

    this.skillsLoader = new SkillsLoader(skillsDir);

    // Provider will be initialized in initialize() after skills are loaded
    this.provider = null as any; // Temporary - will be set in initialize()
  }

  /**
   * Initialize the agent (load skills, start MCP, create provider)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.error('Initializing Atlassian Agent SDK...');

    try {
      // Load Skills
      if (this.options.enableSkills !== false) {
        console.error('Loading Skills...');
        await this.skillsLoader.load();
        console.error(`✓ Loaded ${this.skillsLoader.getCount()} skills`);
      }

      // Start MCP server (optional)
      if (this.options.enableMCP !== false) {
        await this.startMCPServer();
      }

      // Build system prompt with Skills context
      const systemPrompt = this.buildSystemPrompt();

      // Initialize AI provider
      console.error(`Initializing ${this.config.modelProvider} provider...`);
      this.provider = createProvider(this.config, systemPrompt);

      this.initialized = true;
      console.error('✓ Agent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      throw error;
    }
  }

  /**
   * Start the MCP server as a subprocess
   */
  private async startMCPServer(): Promise<void> {
    console.error('Starting MCP server...');

    try {
      const projectRoot = resolve(__dirname, '..', '..');
      const mcpServerPath = join(projectRoot, 'dist', 'mcp', 'server.js');

      // Spawn MCP server process
      this.mcpProcess = spawn('node', [mcpServerPath], {
        stdio: ['pipe', 'pipe', 'inherit'],
        env: process.env,
      });

      // Handle process errors
      this.mcpProcess.on('error', (error) => {
        console.error('MCP server process error:', error);
      });

      this.mcpProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.error(`MCP server exited with code ${code}`);
        }
      });

      console.error('✓ MCP server started');
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Build system prompt with Skills context
   */
  private buildSystemPrompt(): string {
    const basePrompt = `You are an AI assistant helping users interact with their Jira and Confluence instances.

You have access to MCP tools for Jira and Confluence operations.

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

**Guidelines:**
1. Be helpful and provide clear, actionable responses
2. Format output with ticket keys and links
3. Highlight priorities and blockers
4. Suggest next actions based on context

Note: MCP tools are available but tool calling is not yet fully implemented in this basic version.
For now, focus on understanding user intent and providing guidance.`;

    // Add Skills context if available
    if (this.skillsLoader.isLoaded() && this.skillsLoader.getCount() > 0) {
      const skillsContext = this.skillsLoader.getSkillsContext();
      return basePrompt + '\n\n' + skillsContext;
    }

    return basePrompt;
  }

  /**
   * Send a message and get a response
   */
  async chat(message: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Prepare messages for provider (last N messages)
    const recentHistory = this.conversationHistory.slice(-this.maxHistory);
    const messages: Message[] = recentHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // Get response from provider
      const response = await this.provider.chat(messages);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.mcpProcess) {
      console.error('Shutting down MCP server...');
      this.mcpProcess.kill();
      this.mcpProcess = undefined;
    }
  }

  /**
   * Get provider info
   */
  getProviderInfo(): { name: string; model?: string } {
    return {
      name: this.provider.getProviderName(),
      model:
        'getModel' in this.provider
          ? (this.provider as any).getModel()
          : undefined,
    };
  }

  /**
   * Get loaded skills info
   */
  getSkillsInfo(): { count: number; names: string[] } {
    return {
      count: this.skillsLoader.getCount(),
      names: this.skillsLoader.getSkillNames(),
    };
  }

  /**
   * Convenience method: Get my sprint tasks
   */
  async getMySprintTasks(): Promise<string> {
    return this.chat('Show me my current sprint tasks');
  }

  /**
   * Convenience method: Search Confluence
   */
  async searchConfluence(query: string): Promise<string> {
    return this.chat(`Search Confluence for: ${query}`);
  }

  /**
   * Convenience method: Get high priority tasks
   */
  async getHighPriorityTasks(): Promise<string> {
    return this.chat('Show me my high priority tasks');
  }
}
