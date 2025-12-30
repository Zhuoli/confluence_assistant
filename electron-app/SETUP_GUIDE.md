# Setup Guide - Atlassian AI Assistant

## 5-Minute Quick Start

### 1. Install Node.js

Download and install Node.js v18 or higher from: https://nodejs.org/

Verify installation:
```bash
node --version  # Should show v18 or higher
npm --version
```

### 2. Install the App

```bash
cd electron-app
npm install
```

This will download all required dependencies (~100MB).

### 3. Configure Credentials

**Option A: Create `.env` file (recommended)**

```bash
cp .env.example .env
```

Then edit `.env` with your favorite editor and add:

```env
ANTHROPIC_API_KEY=your_actual_key
JIRA_URL=https://jira.yourcompany.com
JIRA_USERNAME=your.email@company.com
JIRA_API_TOKEN=your_token
CONFLUENCE_URL=https://confluence.yourcompany.com
CONFLUENCE_USERNAME=your.email@company.com
CONFLUENCE_API_TOKEN=your_token
```

**Option B: Use Settings UI**

Just run the app and configure in the UI (see step 4).

### 4. Launch the App

```bash
npm start
```

The app will open. If you didn't create a `.env` file:
1. Click the ⚙️ Settings button
2. Fill in your credentials
3. Click Save Settings

### 5. Start Chatting!

Try these:
- "Show me my sprint tasks"
- "Search for deployment documentation"
- "What should I work on today?"

## Getting Your API Keys

### Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy it to your configuration

### Jira & Confluence Tokens

**For Self-Hosted (Server/Data Center):**
1. Log into your Jira or Confluence
2. Click your profile picture
3. Select "Personal Access Tokens"
4. Click "Create token"
5. Give it a name (e.g., "AI Assistant")
6. Select expiration (recommend 1 year)
7. Copy the token immediately
8. Paste into your configuration

**For Atlassian Cloud:**
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a label (e.g., "AI Assistant")
4. Copy the token
5. Use your email as the username
6. Paste token into configuration

## Verifying Setup

After configuration, you should see:
- Green dot with "Connected" in the sidebar
- No error messages when clicking Quick Actions

## Troubleshooting

### npm install fails
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules
npm install
```

### App shows "Configuration needed"
- Open Settings
- Make sure ALL required fields are filled
- Click Save Settings
- Restart the app

### Can't connect to Jira/Confluence
- Check URLs don't have trailing slashes
- Verify you can access the URLs in your browser
- Test your credentials manually
- Check your network/VPN connection

### API token doesn't work
- Make sure you copied the entire token
- Check token hasn't expired
- Verify token has correct permissions
- Try creating a new token

## Building Standalone App

To create a distributable application:

**macOS:**
```bash
npm run build:mac
```
Creates a `.dmg` file in `dist/`

**Windows:**
```bash
npm run build:win
```
Creates a `.exe` installer in `dist/`

**Linux:**
```bash
npm run build:linux
```
Creates `.AppImage` and `.deb` in `dist/`

## Next Steps

- Read the [README.md](README.md) for full documentation
- Try the Quick Action buttons in the sidebar
- Explore different types of questions
- Configure your team's Confluence space

## Getting Help

If you encounter issues:
1. Check the console for error messages (Help → Toggle Developer Tools)
2. Verify all configuration values
3. Test Jira/Confluence access in browser
4. Check API key is valid
5. Open an issue on GitHub

