/**
 * Conversation List
 * Renders conversation sidebar with grouping by time
 */

import { Conversation } from '../../services/IPCService';
import { formatRelativeTime } from '../utils/formatters';
import { clearElement, createElement } from '../utils/dom';

export interface GroupedConversations {
    today: Conversation[];
    yesterday: Conversation[];
    lastWeek: Conversation[];
    older: Conversation[];
}

export class ConversationList {
    private container: HTMLElement;
    private onSelectCallback?: (id: string) => void;
    private onDeleteCallback?: (id: string) => void;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    /**
     * Set callback for conversation selection
     */
    onSelect(callback: (id: string) => void): void {
        this.onSelectCallback = callback;
    }

    /**
     * Set callback for conversation deletion
     */
    onDelete(callback: (id: string) => void): void {
        this.onDeleteCallback = callback;
    }

    /**
     * Render conversation list with grouping
     */
    render(grouped: GroupedConversations, activeId: string | null): void {
        clearElement(this.container);

        // Check if there are any conversations
        const hasConversations = grouped.today.length + grouped.yesterday.length +
                                 grouped.lastWeek.length + grouped.older.length > 0;

        if (!hasConversations) {
            this.container.innerHTML = `
                <div class="conversations-empty">
                    <p>💬</p>
                    <p>No conversations yet</p>
                    <p>Start a new chat to begin!</p>
                </div>
            `;
            return;
        }

        // Render each group
        const groups = [
            { title: 'Today', conversations: grouped.today },
            { title: 'Yesterday', conversations: grouped.yesterday },
            { title: 'Last 7 Days', conversations: grouped.lastWeek },
            { title: 'Older', conversations: grouped.older }
        ];

        for (const group of groups) {
            if (group.conversations.length > 0) {
                const groupElement = this.renderGroup(group.title, group.conversations, activeId);
                this.container.appendChild(groupElement);
            }
        }
    }

    /**
     * Render a conversation group
     */
    private renderGroup(title: string, conversations: Conversation[], activeId: string | null): HTMLElement {
        const groupDiv = createElement('div', 'conversation-group');

        const titleDiv = createElement('div', 'conversation-group-title');
        titleDiv.textContent = title;
        groupDiv.appendChild(titleDiv);

        for (const conv of conversations) {
            const convItem = this.renderConversationItem(conv, conv.id === activeId);
            groupDiv.appendChild(convItem);
        }

        return groupDiv;
    }

    /**
     * Render a single conversation item
     */
    private renderConversationItem(conv: Conversation, isActive: boolean): HTMLElement {
        const convItem = createElement('div', 'conversation-item');
        convItem.dataset.conversationId = conv.id;

        if (isActive) {
            convItem.classList.add('active');
        }

        convItem.onclick = () => {
            if (this.onSelectCallback) {
                this.onSelectCallback(conv.id);
            }
        };

        const titleDiv = createElement('div', 'conversation-title');
        titleDiv.textContent = conv.title;

        const metaDiv = createElement('div', 'conversation-meta');

        const timeDiv = createElement('div', 'conversation-time');
        timeDiv.textContent = formatRelativeTime(conv.updatedAt);

        const deleteBtn = createElement('button', 'conversation-delete');
        deleteBtn.textContent = '🗑';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (this.onDeleteCallback) {
                this.onDeleteCallback(conv.id);
            }
        };

        metaDiv.appendChild(timeDiv);
        metaDiv.appendChild(deleteBtn);

        convItem.appendChild(titleDiv);
        convItem.appendChild(metaDiv);

        return convItem;
    }
}
