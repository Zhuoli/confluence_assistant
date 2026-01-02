/**
 * Agent Client for Electron App
 *
 * This client uses the TypeScript Agent SDK which provides
 * MCP server and Skills for Jira/Confluence access.
 */

const path = require('path');
const ConversationManager = require('./conversation-manager');

// Note: We don't import the TypeScript agent directly to avoid ESM/CommonJS conflicts.
// Instead, we spawn it as a separate Node.js process (see callNodeAgent method).

class AgentClient {
    constructor(config, conversationManager) {
        // Validate API key based on provider
        const provider = config.MODEL_PROVIDER || 'oci-openai';
        if (provider === 'claude' && !config.ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API key is required for Claude provider');
        }
        if (provider === 'openai' && !config.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required for OpenAI provider');
        }
        if (provider === 'oci-openai' && (!config.OCI_COMPARTMENT_ID || !config.OCI_ENDPOINT)) {
            throw new Error('OCI Compartment ID and Endpoint are required for OCI OpenAI provider');
        }

        this.config = config;
        this.conversationManager = conversationManager;
        this.agent = null;
        this.initialized = false;

        console.log('AgentClient initialized');
        console.log('  - Provider:', provider);
    }

    /**
     * Initialize the TypeScript agent
     *
     * Note: The agent runs as a separate Node.js process via callNodeAgent(),
     * so no direct initialization is needed.
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        // Agent is spawned as a separate process, no direct initialization needed
        console.log('Agent will be initialized on first message via spawned process');
        this.initialized = true;
    }

    /**
     * Send a message to the TypeScript Agent SDK
     *
     * @param {string} message - User's message
     * @param {Function} onProgress - Optional callback for streaming progress logs
     * @returns {Promise<string>} - Agent's response
     */
    async sendMessage(message, onProgress) {
        try {
            // Get conversation history BEFORE adding the new message
            // The agent will add the user message internally
            const conversation = this.conversationManager.getActiveConversation();
            const historyMessages = conversation ? conversation.messages : [];

            // Call agent with history
            const response = await this.callNodeAgent(message, historyMessages, onProgress);

            // Now add both user message and assistant response to conversation
            await this.conversationManager.addMessage('user', message);
            await this.conversationManager.addMessage('assistant', response);

            return response;
        } catch (error) {
            console.error('Error sending message to agent:', error);
            throw error;
        }
    }

    /**
     * Get the current conversation messages
     */
    getCurrentConversation() {
        const conversation = this.conversationManager.getActiveConversation();
        return conversation ? conversation.messages : [];
    }

    /**
     * Get all conversations
     */
    getAllConversations() {
        return this.conversationManager.getAllConversations();
    }

    /**
     * Create a new conversation
     */
    async createNewConversation() {
        return await this.conversationManager.createConversation();
    }

    /**
     * Load a specific conversation
     */
    async loadConversation(conversationId) {
        await this.conversationManager.setActiveConversation(conversationId);
        return this.conversationManager.getActiveConversation();
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId) {
        await this.conversationManager.deleteConversation(conversationId);
    }

    /**
     * Call Node.js TypeScript agent via CLI
     *
     * @param {string} message - User's message
     * @param {Array} historyMessages - Previous conversation messages
     * @param {Function} onProgress - Optional callback for streaming progress logs
     * @returns {Promise<string>} - Agent's response
     */
    async callNodeAgent(message, historyMessages, onProgress) {
        const { spawn, execSync } = require('child_process');
        const path = require('path');
        const { app } = require('electron');
        const fs = require('fs');

        return new Promise((resolve, reject) => {
            // Determine correct paths for packaged vs dev mode
            let projectRoot;
            if (app.isPackaged) {
                // Packaged mode (no ASAR)
                projectRoot = app.getAppPath();
            } else {
                // Dev mode
                projectRoot = path.join(__dirname, '..', '..');
            }
            const cliPath = path.join(projectRoot, 'backend-dist', 'cli', 'index.js');

            // Load code repositories from config
            const codeReposPath = path.join(app.getPath('userData'), 'code-repos.json');
            let codeRepoPaths = '';

            try {
                if (fs.existsSync(codeReposPath)) {
                    const data = fs.readFileSync(codeReposPath, 'utf8');
                    const repos = JSON.parse(data);
                    // Join paths with ':' separator for environment variable
                    codeRepoPaths = repos.map(repo => repo.path).join(':');
                    console.log('Loaded code repositories:', codeRepoPaths);
                }
            } catch (error) {
                console.error('Error loading code repositories:', error);
            }

            // Find Node.js executable (same logic as main.js)
            let nodePath = 'node';

            // Try common macOS locations
            const commonPaths = [
                '/usr/local/bin/node',
                '/opt/homebrew/bin/node',
                '/usr/bin/node'
            ];

            for (const p of commonPaths) {
                if (fs.existsSync(p)) {
                    nodePath = p;
                    break;
                }
            }

            // Try 'which' as fallback
            if (nodePath === 'node') {
                try {
                    nodePath = execSync('which node', { encoding: 'utf8' }).trim();
                } catch (e) {
                    // Use 'node' and hope for the best
                }
            }

            // Convert conversation history to agent SDK format
            // The agent expects { role, content, timestamp: Date }
            // Our messages have { role, content, timestamp: number }
            const agentHistory = historyMessages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.timestamp).toISOString()
            }));

            // Command: node dist/cli/index.js chat --message "user message" --history '[...]'
            const args = [
                cliPath,
                'chat',
                '--message',
                message
            ];

            // Add history if not empty
            if (agentHistory.length > 0) {
                args.push('--history');
                args.push(JSON.stringify(agentHistory));
            }

            console.log('Calling TypeScript agent:', nodePath, args.slice(0, 5).join(' '), '...');
            console.log(`  - History: ${agentHistory.length} messages`);

            const childProcess = spawn(nodePath, args, {
                cwd: projectRoot,
                env: {
                    ...process.env,
                    // Pass through configuration from Electron's .env
                    MODEL_PROVIDER: this.config.MODEL_PROVIDER || 'oci-openai',
                    MODEL_NAME: this.config.MODEL_NAME || '',
                    ANTHROPIC_API_KEY: this.config.ANTHROPIC_API_KEY || '',
                    OPENAI_API_KEY: this.config.OPENAI_API_KEY || '',
                    OCI_COMPARTMENT_ID: this.config.OCI_COMPARTMENT_ID || '',
                    OCI_ENDPOINT: this.config.OCI_ENDPOINT || '',
                    OCI_CONFIG_PATH: this.config.OCI_CONFIG_PATH || '',
                    OCI_PROFILE: this.config.OCI_PROFILE || '',
                    JIRA_URL: this.config.JIRA_URL,
                    JIRA_USERNAME: this.config.JIRA_USERNAME,
                    JIRA_API_TOKEN: this.config.JIRA_API_TOKEN,
                    CONFLUENCE_URL: this.config.CONFLUENCE_URL,
                    CONFLUENCE_USERNAME: this.config.CONFLUENCE_USERNAME,
                    CONFLUENCE_API_TOKEN: this.config.CONFLUENCE_API_TOKEN,
                    CONFLUENCE_SPACE_KEY: this.config.CONFLUENCE_SPACE_KEY,
                    USER_EMAIL: this.config.USER_EMAIL,
                    USER_DISPLAY_NAME: this.config.USER_DISPLAY_NAME,
                    // OCI MCP settings
                    OCI_MCP_ENABLED: this.config.OCI_MCP_ENABLED || 'false',
                    OCI_MCP_REGION: this.config.OCI_MCP_REGION || '',
                    OCI_MCP_COMPARTMENT_ID: this.config.OCI_MCP_COMPARTMENT_ID || '',
                    OCI_MCP_TENANCY_ID: this.config.OCI_MCP_TENANCY_ID || '',
                    OCI_MCP_CONFIG_PATH: this.config.OCI_MCP_CONFIG_PATH || '',
                    OCI_MCP_PROFILE: this.config.OCI_MCP_PROFILE || '',
                    // Code repository paths
                    CODE_REPO_PATHS: codeRepoPaths
                }
            });

            let stdout = '';
            let stderr = '';

            childProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            childProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;

                // Stream logs to the UI in real-time
                if (onProgress) {
                    // Parse for structured log messages
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            // Check if it's a JSON structured log
                            if (line.includes('[AGENT_LOG]')) {
                                try {
                                    const jsonMatch = line.match(/\[AGENT_LOG\] (.+)/);
                                    if (jsonMatch) {
                                        const logData = JSON.parse(jsonMatch[1]);
                                        onProgress({
                                            type: 'structured_log',
                                            data: logData
                                        });
                                    }
                                } catch (e) {
                                    // Not JSON, fallthrough to raw log
                                }
                            }

                            // Also send raw log line for display
                            onProgress({
                                type: 'raw_log',
                                message: line
                            });
                        }
                    }
                }
            });

            childProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('TypeScript agent error:', stderr);
                    reject(new Error(`Agent exited with code ${code}: ${stderr}`));
                } else {
                    // Extract just the assistant response (remove "User:" and "Assistant:" labels)
                    let cleanedOutput = stdout.trim();

                    // Remove CLI formatting if present
                    const assistantMatch = cleanedOutput.match(/Assistant:\s*(.+)/s);
                    if (assistantMatch) {
                        cleanedOutput = assistantMatch[1].trim();
                    }

                    resolve(cleanedOutput);
                }
            });

            childProcess.on('error', (error) => {
                console.error('Failed to start TypeScript agent:', error);
                reject(error);
            });
        });
    }

    /**
     * Quick action: Get my sprint tasks
     *
     * @returns {Promise<string>} - Sprint tasks
     */
    async getMySprintTasks() {
        return this.sendMessage('Show me my current sprint tasks');
    }

    /**
     * Quick action: Search Confluence
     *
     * @param {string} query - Search query
     * @returns {Promise<string>} - Search results
     */
    async searchConfluence(query) {
        return this.sendMessage(`Search Confluence for: ${query}`);
    }

    /**
     * Quick action: Get high priority tasks
     *
     * @returns {Promise<string>} - High priority tasks
     */
    async getHighPriorityTasks() {
        return this.sendMessage('Show me my high priority tasks');
    }

    /**
     * Quick action: Get recent Confluence updates
     *
     * @returns {Promise<string>} - Recent pages
     */
    async getRecentConfluencePages() {
        return this.sendMessage('Show me recent Confluence pages');
    }

    /**
     * Quick action: Analyze workload
     *
     * @returns {Promise<string>} - Workload analysis
     */
    async analyzeWorkload() {
        return this.sendMessage('Analyze my current workload and suggest priorities');
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Get conversation history
     *
     * @returns {Array} - Conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }
}

module.exports = AgentClient;
