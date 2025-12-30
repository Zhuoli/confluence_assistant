# Atlassian AI Assistant - Desktop App

A native desktop application that provides an AI-powered chatbot interface for interacting with Jira and Confluence.

## Features

### 🤖 AI-Powered Chat Interface
- Natural language conversations about your work
- Context-aware responses using Claude AI
- Chat history maintained during session

### 📋 Jira Integration
- View your sprint tasks
- Get all assigned issues
- AI analysis of your work priorities
- Direct links to Jira issues

### 📄 Confluence Integration
- Search team documentation
- View recent pages
- AI-powered summarization
- Quick access to pages

### 🖥️ Native Desktop Experience
- Cross-platform (macOS, Windows, Linux)
- Native look and feel
- Secure credential storage
- Offline configuration management

## Screenshots

[Coming soon]

## Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Jira and Confluence access (cloud or self-hosted)
- Anthropic API key

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure settings:**

You can configure in two ways:

**Option A: Using `.env` file (recommended for first setup)**
```bash
cp .env.example .env
# Edit .env with your credentials
```

**Option B: Using the app's Settings UI**
- Launch the app
- Click the ⚙️ Settings button
- Fill in your credentials
- Click Save

3. **Run the app:**
```bash
npm start
```

### Development Mode

Run with DevTools open:
```bash
npm run dev
```

## Configuration

### Required Settings

| Setting | Description | Example |
|---------|-------------|---------|
| Anthropic API Key | Your Claude API key | `sk-ant-xxx...` |
| Jira URL | Your Jira instance URL | `https://jira.yourcompany.com` |
| Jira Username | Your Jira username/email | `your.email@company.com` |
| Jira API Token | Personal Access Token | `xxx...` |
| Confluence URL | Your Confluence instance URL | `https://confluence.yourcompany.com` |
| Confluence Username | Your Confluence username/email | `your.email@company.com` |
| Confluence API Token | Personal Access Token | `xxx...` |
| Confluence Space Key | Default space (optional) | `TEAM` |

### Getting API Tokens

**Jira/Confluence (Self-Hosted):**
1. Log into your instance
2. Profile → Personal Access Tokens
3. Create token
4. Copy to settings

**Atlassian Cloud:**
1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Use your email as username

## Building for Distribution

### Build for all platforms:
```bash
npm run build
```

### Build for specific platform:
```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

Builds will be in the `dist/` folder.

## Usage Examples

### Ask About Your Work
- "What are my sprint tasks?"
- "What should I focus on today?"
- "Show me high priority issues"

### Search Documentation
- "Search for API documentation"
- "Find deployment guide"
- "Show recent pages"

### Get Analysis
- "Analyze my current workload"
- "What are my blockers?"
- "Summarize this sprint"

## Project Structure

```
electron-app/
├── src/
│   ├── main/              # Electron main process
│   │   └── main.js
│   ├── renderer/          # UI (HTML/CSS/JS)
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── renderer.js
│   └── backend/           # Business logic
│       ├── chatbot.js     # AI orchestration
│       ├── config.js      # Configuration management
│       ├── jira-client.js
│       └── confluence-client.js
├── assets/                # App icons
├── package.json
└── README.md
```

## Troubleshooting

### "Configuration needed" status
- Open Settings (⚙️ button)
- Fill in all required fields
- Click Save Settings

### "Unable to fetch Jira issues"
- Verify Jira URL is correct (no trailing slash)
- Check your API token is valid
- Ensure you have access to Jira

### "Unable to fetch Confluence pages"
- Verify Confluence URL is correct
- Check your API token has read permissions
- Try without specifying a space key

### App won't start
- Check Node.js version: `node --version` (need v18+)
- Delete `node_modules` and reinstall: `npm install`
- Check console for errors

## Security

- Credentials are stored locally in your user directory
- API tokens are never transmitted except to your Atlassian instances
- No data is sent to third parties except Anthropic for AI processing
- All Atlassian communication uses HTTPS

### Credential Storage Location

- **macOS**: `~/Library/Application Support/atlassian-ai-assistant/config.json`
- **Windows**: `%APPDATA%/atlassian-ai-assistant/config.json`
- **Linux**: `~/.config/atlassian-ai-assistant/config.json`

## Development

### Tech Stack
- **Electron**: Desktop application framework
- **Node.js**: Backend runtime
- **Anthropic SDK**: Claude AI integration
- **Axios**: HTTP client for Atlassian APIs

### Adding Features

1. **Add UI**: Update `src/renderer/index.html` and `styles.css`
2. **Add Logic**: Update `src/backend/chatbot.js`
3. **Add IPC**: Update `src/main/main.js` for Electron IPC
4. **Update Renderer**: Update `src/renderer/renderer.js`

## Support

For issues and feature requests, please open an issue on GitHub.

## License

MIT License - See LICENSE file for details
