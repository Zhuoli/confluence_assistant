/**
 * Conversation Manager
 *
 * Manages persistent conversation history for the Electron app.
 * Stores conversations in a JSON file in Electron's userData directory.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ConversationManager {
    constructor(dataPath) {
        this.dataPath = dataPath;
        this.conversations = [];
        this.activeConversationId = null;
        this.loaded = false;
    }

    /**
     * Load conversations from disk
     */
    async load() {
        try {
            if (fs.existsSync(this.dataPath)) {
                const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
                this.conversations = data.conversations || [];
                this.activeConversationId = data.activeConversationId || null;
                console.log(`Loaded ${this.conversations.length} conversations`);
            } else {
                console.log('No existing conversations file, starting fresh');
                this.conversations = [];
                this.activeConversationId = null;
            }
            this.loaded = true;
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.conversations = [];
            this.activeConversationId = null;
            this.loaded = true;
        }
    }

    /**
     * Save conversations to disk
     */
    async save() {
        try {
            const data = {
                conversations: this.conversations,
                activeConversationId: this.activeConversationId
            };

            // Ensure directory exists
            const dir = path.dirname(this.dataPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Saved ${this.conversations.length} conversations`);
        } catch (error) {
            console.error('Error saving conversations:', error);
            throw error;
        }
    }

    /**
     * Create a new conversation
     */
    async createConversation() {
        const conversation = {
            id: uuidv4(),
            title: 'New Conversation',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.conversations.unshift(conversation); // Add to beginning
        this.activeConversationId = conversation.id;
        await this.save();

        console.log(`Created new conversation: ${conversation.id}`);
        return conversation;
    }

    /**
     * Get a conversation by ID
     */
    getConversation(id) {
        return this.conversations.find(c => c.id === id) || null;
    }

    /**
     * Get the active conversation
     */
    getActiveConversation() {
        if (!this.activeConversationId) {
            return null;
        }
        return this.getConversation(this.activeConversationId);
    }

    /**
     * Get all conversations
     */
    getAllConversations() {
        // Return sorted by updatedAt (most recent first)
        return [...this.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    }

    /**
     * Update conversation messages
     */
    async updateConversation(id, messages) {
        const conversation = this.getConversation(id);
        if (!conversation) {
            throw new Error(`Conversation not found: ${id}`);
        }

        conversation.messages = messages;
        conversation.updatedAt = Date.now();

        // Update title from first user message if it's still "New Conversation"
        if (conversation.title === 'New Conversation' && messages.length > 0) {
            const firstUserMessage = messages.find(m => m.role === 'user');
            if (firstUserMessage) {
                conversation.title = this.generateTitle(firstUserMessage.content);
            }
        }

        await this.save();
        console.log(`Updated conversation: ${id}`);
    }

    /**
     * Add a message to the active conversation
     */
    async addMessage(role, content) {
        let conversation = this.getActiveConversation();

        // Create new conversation if none exists
        if (!conversation) {
            conversation = await this.createConversation();
        }

        const message = {
            role,
            content,
            timestamp: Date.now()
        };

        conversation.messages.push(message);
        await this.updateConversation(conversation.id, conversation.messages);

        return conversation;
    }

    /**
     * Set the active conversation
     */
    async setActiveConversation(id) {
        const conversation = this.getConversation(id);
        if (!conversation) {
            throw new Error(`Conversation not found: ${id}`);
        }

        this.activeConversationId = id;
        await this.save();
        console.log(`Set active conversation: ${id}`);
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(id) {
        const index = this.conversations.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error(`Conversation not found: ${id}`);
        }

        this.conversations.splice(index, 1);

        // If deleted conversation was active, switch to most recent
        if (this.activeConversationId === id) {
            if (this.conversations.length > 0) {
                this.activeConversationId = this.getAllConversations()[0].id;
            } else {
                this.activeConversationId = null;
            }
        }

        await this.save();
        console.log(`Deleted conversation: ${id}`);
    }

    /**
     * Generate a title from the first message
     */
    generateTitle(message) {
        if (!message) {
            return 'New Conversation';
        }

        // Remove special characters
        let title = message.trim().replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ');

        // Limit to 50 characters
        if (title.length > 50) {
            title = title.substring(0, 50).trim() + '...';
        }

        return title || 'New Conversation';
    }

    /**
     * Group conversations by time
     */
    groupByTime(conversations) {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const sevenDaysMs = 7 * oneDayMs;

        const groups = {
            today: [],
            yesterday: [],
            lastWeek: [],
            older: []
        };

        for (const conv of conversations) {
            const age = now - conv.updatedAt;

            if (age < oneDayMs) {
                groups.today.push(conv);
            } else if (age < 2 * oneDayMs) {
                groups.yesterday.push(conv);
            } else if (age < sevenDaysMs) {
                groups.lastWeek.push(conv);
            } else {
                groups.older.push(conv);
            }
        }

        return groups;
    }

    /**
     * Clear all conversations (for testing)
     */
    async clearAll() {
        this.conversations = [];
        this.activeConversationId = null;
        await this.save();
        console.log('Cleared all conversations');
    }
}

module.exports = ConversationManager;
