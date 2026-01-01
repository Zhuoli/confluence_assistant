/**
 * Structured logging utility for agent operations
 * Emits prefixed log messages that can be parsed and displayed in UI
 */

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  PROGRESS = 'PROGRESS',
}

export enum LogCategory {
  INIT = 'INIT',
  SKILLS = 'SKILLS',
  MCP = 'MCP',
  TOOLS = 'TOOLS',
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
}

export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

/**
 * Structured logger that emits parseable log messages to stderr
 */
export class Logger {
  /**
   * Emit a structured log message
   */
  private static emit(level: LogLevel, category: LogCategory, message: string, data?: any): void {
    const logMessage: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    // Emit as JSON on stderr for structured parsing
    const jsonLog = JSON.stringify(logMessage);
    console.error(`[AGENT_LOG] ${jsonLog}`);

    // Also emit human-readable format for terminal/file logs
    const prefix = `[${category}]`;
    const emoji = this.getLevelEmoji(level);
    console.error(`${emoji} ${prefix} ${message}`);
  }

  private static getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.SUCCESS:
        return '✓';
      case LogLevel.ERROR:
        return '✗';
      case LogLevel.WARNING:
        return '⚠';
      case LogLevel.PROGRESS:
        return '⏳';
      default:
        return '•';
    }
  }

  // Convenience methods
  static info(category: LogCategory, message: string, data?: any): void {
    this.emit(LogLevel.INFO, category, message, data);
  }

  static success(category: LogCategory, message: string, data?: any): void {
    this.emit(LogLevel.SUCCESS, category, message, data);
  }

  static warning(category: LogCategory, message: string, data?: any): void {
    this.emit(LogLevel.WARNING, category, message, data);
  }

  static error(category: LogCategory, message: string, data?: any): void {
    this.emit(LogLevel.ERROR, category, message, data);
  }

  static progress(category: LogCategory, message: string, data?: any): void {
    this.emit(LogLevel.PROGRESS, category, message, data);
  }

  // Specific logging methods for common operations
  static initStart(): void {
    this.info(LogCategory.INIT, 'Initializing agent...');
  }

  static initComplete(): void {
    this.success(LogCategory.INIT, 'Agent initialized successfully');
  }

  static skillsLoading(): void {
    this.progress(LogCategory.SKILLS, 'Loading skills...');
  }

  static skillsLoaded(count: number, names: string[]): void {
    this.success(LogCategory.SKILLS, `Loaded ${count} skills`, { skills: names });
  }

  static mcpStarting(): void {
    this.progress(LogCategory.MCP, 'Starting MCP servers...');
  }

  static mcpServerStarting(name: string): void {
    this.progress(LogCategory.MCP, `Starting ${name} MCP server...`);
  }

  static mcpServerConnected(name: string, toolCount: number): void {
    this.success(LogCategory.MCP, `Connected to ${name} (${toolCount} tools)`);
  }

  static mcpServersReady(serverCount: number, totalTools: number): void {
    this.success(LogCategory.MCP, `${serverCount} MCP servers ready (${totalTools} tools total)`);
  }

  static mcpServerFailed(name: string, error: string): void {
    this.error(LogCategory.MCP, `Failed to start ${name} MCP server`, { error });
  }

  static toolsRegistered(count: number): void {
    this.success(LogCategory.TOOLS, `Registered ${count} tools with AI provider`);
  }

  static toolCalling(toolName: string, args?: any): void {
    this.progress(LogCategory.TOOLS, `Calling ${toolName}`, args);
  }

  static toolCallSuccess(toolName: string, duration?: number): void {
    this.success(LogCategory.TOOLS, `${toolName} completed`, duration ? { duration: `${duration}ms` } : undefined);
  }

  static toolCallFailed(toolName: string, error: string): void {
    this.error(LogCategory.TOOLS, `${toolName} failed`, { error });
  }

  static chatMessageReceived(preview: string): void {
    this.info(LogCategory.CHAT, `Processing: "${preview}"`);
  }

  static chatResponseGenerating(): void {
    this.progress(LogCategory.CHAT, 'Generating response...');
  }

  static chatResponseComplete(length: number): void {
    this.success(LogCategory.CHAT, `Response generated (${length} characters)`);
  }
}
