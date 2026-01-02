/**
 * Conversation Manager
 * Manages conversation lifecycle (create, load, delete, switch)
 */

import { IPCService, Conversation, ConversationsData } from '../../services/IPCService';
import { ConversationList } from './ConversationList';
import { MessageRenderer } from '../chat/MessageRenderer';
import { clearElement } from '../utils/dom';

export class ConversationManager {
    private chatContainer: HTMLElement;
    private conversationList: ConversationList;

    constructor(chatContainer: HTMLElement, listContainer: HTMLElement) {
        this.chatContainer = chatContainer;
        this.conversationList = new ConversationList(listContainer);
    }

    /**
     * Initialize conversation manager
     */
    initialize(): void {
        this.setupListeners();
        this.loadAll();
    }

    /**
     * Load all conversations
     */
    loadAll(): void {
        IPCService.getConversations();
    }

    /**
     * Start a new conversation
     */
    startNew(): void {
        IPCService.createConversation();
    }

    /**
     * Select and load a conversation
     */
    select(id: string): void {
        IPCService.loadConversation(id);
    }

    /**
     * Delete a conversation
     */
    delete(id: string): void {
        if (confirm('Delete this conversation?')) {
            IPCService.deleteConversation(id);
        }
    }

    /**
     * Clear the chat area
     */
    private clearChat(): void {
        clearElement(this.chatContainer);
    }

    /**
     * Load conversation messages into chat area
     */
    private loadConversationMessages(conversation: Conversation): void {
        this.clearChat();

        if (!conversation || conversation.messages.length === 0) {
            return;
        }

        // Render each message
        for (const message of conversation.messages) {
            MessageRenderer.addMessage(message.content, message.role as 'user' | 'assistant', this.chatContainer);
        }
    }

    /**
     * Set up event listeners
     */
    private setupListeners(): void {
        // Conversations list updated
        IPCService.onConversationsList((data: ConversationsData) => {
            this.conversationList.render(data.grouped, data.activeId);
        });

        // New conversation created
        IPCService.on('conversation-created', () => {
            this.clearChat();
        });

        // Conversation loaded
        IPCService.onConversationLoaded((data) => {
            this.loadConversationMessages(data.conversation);
        });

        // Set up conversation list callbacks
        this.conversationList.onSelect((id: string) => this.select(id));
        this.conversationList.onDelete((id: string) => this.delete(id));
    }
}
