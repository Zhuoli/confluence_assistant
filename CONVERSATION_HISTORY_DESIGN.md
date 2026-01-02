# Conversation History Feature Design

## Overview

Add persistent conversation history with a sidebar UI allowing users to:
- View all previous conversations
- Resume any previous conversation
- Start a new conversation
- Delete old conversations
- See conversations grouped by time (Today, Yesterday, Last 7 days, Older)

---

## Data Model

### Conversation Structure

```typescript
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;              // UUID
  title: string;           // Auto-generated from first user message (max 50 chars)
  messages: ConversationMessage[];
  createdAt: number;       // Unix timestamp
  updatedAt: number;       // Unix timestamp
}
```

### Storage

**File**: `<Electron userData>/conversations.json`

**Format**:
```json
{
  "conversations": [
    {
      "id": "uuid-1234",
      "title": "Show me my sprint tasks",
      "messages": [
        { "role": "user", "content": "Show me my sprint tasks", "timestamp": 1704153600000 },
        { "role": "assistant", "content": "Here are your tasks...", "timestamp": 1704153605000 }
      ],
      "createdAt": 1704153600000,
      "updatedAt": 1704153605000
    }
  ],
  "activeConversationId": "uuid-1234"
}
```

---

## UI Design

### Layout

```
┌─────────────────┬──────────────────────────────────┐
│   Sidebar       │      Chat Area                   │
│   (250px)       │                                  │
│                 │                                  │
│ ┌─────────────┐ │  [Welcome or Chat Messages]      │
│ │ + New Chat  │ │                                  │
│ └─────────────┘ │                                  │
│                 │                                  │
│ Today           │                                  │
│ ┌─────────────┐ │                                  │
│ │ 💬 Show my  │ │                                  │
│ │   sprint... │ │                                  │
│ │   2:30 PM   │ │                                  │
│ └─────────────┘ │                                  │
│                 │                                  │
│ Yesterday       │                                  │
│ ┌─────────────┐ │                                  │
│ │ 💬 Create   │ │                                  │
│ │   technical │ │                                  │
│ │   design    │ │                                  │
│ │   Jan 1     │ │                                  │
│ │         [🗑] │ │                                  │
│ └─────────────┘ │                                  │
│                 │                                  │
│ [≡] Collapse    │                                  │
└─────────────────┴──────────────────────────────────┘
```

### Components

1. **Sidebar Header**
   - "New Chat" button (prominent, always visible)
   - Collapse/expand toggle

2. **Conversation Groups**
   - Today
   - Yesterday
   - Last 7 Days
   - Older

3. **Conversation Item**
   - Title (truncated to 2 lines)
   - Timestamp (relative: "2:30 PM", "Yesterday", "Jan 1")
   - Delete button (appears on hover)
   - Active state highlighting

4. **Sidebar States**
   - Expanded (default, 250px)
   - Collapsed (50px, shows only icons)

---

## Backend Implementation

### ConversationManager Class

**File**: `electron-app/src/backend/conversation-manager.js`

```javascript
class ConversationManager {
  constructor(dataPath);

  // CRUD Operations
  async loadConversations(): Promise<Conversation[]>
  async saveConversations(): Promise<void>
  async createConversation(): Promise<Conversation>
  async getConversation(id: string): Promise<Conversation | null>
  async updateConversation(id: string, messages: ConversationMessage[]): Promise<void>
  async deleteConversation(id: string): Promise<void>
  async setActiveConversation(id: string): Promise<void>
  async getActiveConversation(): Promise<Conversation | null>

  // Helper Methods
  generateTitle(firstMessage: string): string
  groupByTime(conversations: Conversation[]): GroupedConversations
}
```

### Integration with AgentClient

**Update**: `electron-app/src/backend/agent-client.js`

- Replace in-memory `conversationHistory` with ConversationManager
- Load active conversation on init
- Save messages after each exchange
- Auto-create new conversation on first message

---

## IPC Communication

### New Channels

| Channel | Direction | Data | Purpose |
|---------|-----------|------|---------|
| `get-conversations` | Renderer → Main | - | Get all conversations |
| `conversations-list` | Main → Renderer | `{ conversations, activeId }` | Return conversations |
| `new-conversation` | Renderer → Main | - | Create new conversation |
| `conversation-created` | Main → Renderer | `{ conversation }` | New conversation created |
| `load-conversation` | Renderer → Main | `{ id }` | Load specific conversation |
| `conversation-loaded` | Main → Renderer | `{ conversation }` | Conversation loaded |
| `delete-conversation` | Renderer → Main | `{ id }` | Delete conversation |
| `conversation-deleted` | Main → Renderer | `{ id }` | Conversation deleted |

---

## Frontend Implementation

### HTML Structure

**Add to**: `electron-app/src/renderer/index.html`

```html
<!-- Conversation Sidebar -->
<div class="conversation-sidebar" id="conversationSidebar">
  <div class="sidebar-header">
    <button class="new-chat-button" id="newChatButton">
      <span class="icon">+</span>
      <span class="text">New Chat</span>
    </button>
    <button class="collapse-button" id="collapseSidebarButton">
      <span class="icon">≡</span>
    </button>
  </div>

  <div class="conversations-container" id="conversationsContainer">
    <!-- Dynamically populated -->
  </div>
</div>

<!-- Main content wrapper (modified) -->
<div class="main-content">
  <!-- Existing chat container, settings, etc. -->
</div>
```

### JavaScript Functions

**Add to**: `electron-app/src/renderer/renderer.js`

```javascript
// Load conversations on startup
async function loadConversations() { ... }

// Render conversation list
function renderConversationList(groupedConversations, activeId) { ... }

// Group conversations by time
function groupConversationsByTime(conversations) { ... }

// Handle conversation click
function selectConversation(conversationId) { ... }

// Handle new chat button
function startNewConversation() { ... }

// Handle delete conversation
function deleteConversation(conversationId) { ... }

// Toggle sidebar collapse
function toggleSidebar() { ... }

// Format relative time
function formatRelativeTime(timestamp) { ... }
```

### CSS Styles

**Add to**: `electron-app/src/renderer/styles.css`

```css
/* Sidebar Container */
.conversation-sidebar {
  width: 250px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.conversation-sidebar.collapsed {
  width: 50px;
}

/* Sidebar Header */
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.new-chat-button {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Conversation Groups */
.conversation-group-title {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* Conversation Item */
.conversation-item {
  padding: 12px 16px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background-color 0.2s;
}

.conversation-item:hover {
  background-color: var(--bg-tertiary);
}

.conversation-item.active {
  background-color: var(--bg-tertiary);
  border-left-color: var(--primary-color);
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.conversation-time {
  font-size: 12px;
  color: var(--text-secondary);
}
```

---

## User Experience Flow

### 1. First Launch (No History)
1. Sidebar shows "New Chat" button only
2. Chat area shows welcome message
3. User sends first message
4. Conversation auto-created with title from first message
5. Conversation appears in sidebar under "Today"

### 2. Returning User (With History)
1. App loads last active conversation
2. Sidebar shows all previous conversations grouped by time
3. Chat area displays messages from active conversation
4. User can click any conversation to switch
5. User can click "New Chat" to start fresh

### 3. Switching Conversations
1. User clicks conversation in sidebar
2. Chat area clears
3. Loading indicator briefly shown
4. Previous conversation messages render
5. Input remains ready for continuation

### 4. Deleting Conversations
1. User hovers over conversation item
2. Delete button (🗑) appears
3. User clicks delete
4. Confirmation dialog (optional)
5. Conversation removed from sidebar and storage
6. If deleted conversation was active, switch to most recent

---

## Implementation Checklist

### Backend
- [ ] Create `ConversationManager` class
- [ ] Implement CRUD operations
- [ ] Add file persistence logic
- [ ] Integrate with `AgentClient`
- [ ] Add IPC handlers in `main.js`

### Frontend
- [ ] Update HTML structure with sidebar
- [ ] Implement conversation rendering
- [ ] Add event handlers for interactions
- [ ] Style sidebar components
- [ ] Handle conversation switching
- [ ] Add delete confirmation

### Testing
- [ ] Test conversation creation
- [ ] Test conversation loading
- [ ] Test conversation switching
- [ ] Test conversation deletion
- [ ] Test persistence across restarts
- [ ] Test time grouping logic
- [ ] Test edge cases (empty history, single conversation, etc.)

---

## Auto-generated Title Logic

```javascript
function generateTitle(firstMessage) {
  // Remove special characters
  let title = firstMessage.trim().replace(/[^\w\s]/gi, ' ');

  // Limit to 50 characters
  if (title.length > 50) {
    title = title.substring(0, 50).trim() + '...';
  }

  return title;
}
```

**Examples**:
- "Show me my sprint tasks" → "Show me my sprint tasks"
- "Can you help me write a technical design document for the authentication feature?" → "Can you help me write a technical design docum..."

---

## Time Grouping Logic

```javascript
function groupByTime(conversations) {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;

  return {
    today: conversations.filter(c => now - c.updatedAt < oneDayMs),
    yesterday: conversations.filter(c => {
      const age = now - c.updatedAt;
      return age >= oneDayMs && age < 2 * oneDayMs;
    }),
    lastWeek: conversations.filter(c => {
      const age = now - c.updatedAt;
      return age >= 2 * oneDayMs && age < sevenDaysMs;
    }),
    older: conversations.filter(c => now - c.updatedAt >= sevenDaysMs)
  };
}
```

---

## Future Enhancements (Optional)

1. **Search**: Search conversations by content
2. **Export**: Export conversation as markdown/PDF
3. **Pin**: Pin important conversations to top
4. **Archive**: Archive old conversations
5. **Folders**: Organize conversations into folders
6. **Share**: Share conversation via link

---

This design provides a complete ChatGPT-like conversation history experience!
