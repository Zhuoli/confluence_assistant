/**
 * Chat Manager
 * Main orchestrator for chat functionality - handles sending/receiving messages
 */

import { IPCService, ChatResponse, ChatError, ProgressData, ConfigStatus } from '../../services/IPCService';
import { MessageRenderer } from './MessageRenderer';
import { ProgressPanel } from './ProgressPanel';

export class ChatManager {
    private isProcessing: boolean = false;
    private messageInput: HTMLTextAreaElement;
    private sendButton: HTMLButtonElement;
    private chatContainer: HTMLElement;
    private statusIndicator: HTMLElement;
    private statusText: HTMLElement;

    constructor(
        messageInput: HTMLTextAreaElement,
        sendButton: HTMLButtonElement,
        chatContainer: HTMLElement,
        statusIndicator: HTMLElement,
        statusText: HTMLElement
    ) {
        this.messageInput = messageInput;
        this.sendButton = sendButton;
        this.chatContainer = chatContainer;
        this.statusIndicator = statusIndicator;
        this.statusText = statusText;
    }

    /**
     * Initialize chat manager and set up listeners
     */
    initialize(): void {
        this.setupListeners();
        this.checkConfiguration();
    }

    /**
     * Send a chat message
     */
    sendMessage(): void {
        const message = this.messageInput.value.trim();

        if (!message || this.isProcessing) return;

        // Add user message to chat
        MessageRenderer.addMessage(message, 'user', this.chatContainer);

        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Show typing indicator
        MessageRenderer.addTypingIndicator(this.chatContainer);

        // Disable send button
        this.isProcessing = true;
        this.sendButton.disabled = true;

        // Send to main process
        IPCService.sendChatMessage(message);
    }

    /**
     * Clear all messages from chat
     */
    clear(): void {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatContainer.innerHTML = `
                <div class="welcome-message">
                    <h2>👋 Welcome!</h2>
                    <p>I can help you with:</p>
                    <ul>
                        <li>📋 Viewing and analyzing your Jira tasks</li>
                        <li>🔍 Searching Confluence pages</li>
                        <li>📖 Reading and summarizing documentation</li>
                        <li>💡 Answering questions about your work</li>
                    </ul>
                    <p class="hint">Try asking: "What are my sprint tasks?" or "Search for API documentation"</p>
                </div>
            `;
        }
    }

    /**
     * Check configuration status
     */
    private checkConfiguration(): void {
        IPCService.checkConfig();
    }

    /**
     * Update configuration status indicator
     */
    private updateConfigStatus(status: ConfigStatus): void {
        if (status.configured) {
            this.statusIndicator.classList.add('connected');
            this.statusText.textContent = 'Connected';
        } else {
            this.statusIndicator.classList.add('error');
            this.statusText.textContent = 'Configuration needed';
        }
    }

    /**
     * Set up event listeners for IPC and UI
     */
    private setupListeners(): void {
        // Chat response handler
        IPCService.onChatResponse((response: ChatResponse) => {
            MessageRenderer.removeTypingIndicator();
            ProgressPanel.remove();
            MessageRenderer.addMessage(response.message, 'assistant', this.chatContainer);
            this.isProcessing = false;
            this.sendButton.disabled = false;
        });

        // Chat error handler
        IPCService.onChatError((error: ChatError) => {
            MessageRenderer.removeTypingIndicator();
            ProgressPanel.remove();
            MessageRenderer.addMessage('Sorry, I encountered an error: ' + error.message, 'assistant', this.chatContainer, true);
            this.isProcessing = false;
            this.sendButton.disabled = false;
        });

        // Progress update handler
        IPCService.onChatProgress((progressData: ProgressData) => {
            ProgressPanel.update(progressData, this.chatContainer);
        });

        // Config status handler
        IPCService.onConfigStatus((status: ConfigStatus) => {
            this.updateConfigStatus(status);
        });

        // Send on Enter (without Shift)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        });

        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
    }
}
