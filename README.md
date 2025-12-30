# Atlassian AI Assistant

An AI-powered assistant that integrates with **enterprise Jira and Confluence** instances to help you manage work items and access team documentation.

## 🚀 Quick Start (Using Makefile)

```bash
make setup      # Install everything
make config     # Create configuration files
make app        # Launch desktop app
```

**See all commands:** `make help` or just `make`

## Features

### Jira Integration
- ✅ Fetch work items assigned to you from Jira boards
- ✅ Filter by Sprint (active, future, or all issues)
- ✅ Support for custom boards
- ✅ AI-powered analysis and insights

### Confluence Integration
- ✅ Search team Confluence pages
- ✅ Read and analyze page content
- ✅ Get recently updated pages
- ✅ AI-powered summarization

### Enterprise-Ready
- ✅ Works with **self-hosted/on-premise** Atlassian instances
- ✅ Support for **custom domains** (e.g., confluence.companyinternal.com)
- ✅ **SSO compatible** via Personal Access Tokens (PAT)
- ✅ Direct REST API integration (no MCP dependency)
- ✅ **Fully configurable** - works with any Jira/Confluence deployment

## Requirements

- Python 3.9+
- Enterprise Jira and/or Confluence instance
- Personal Access Token (PAT) for authentication
- Anthropic API key

## Quick Start

### Automated Setup

Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your actual credentials:

**IMPORTANT:** Replace all placeholder values with your real credentials!

```bash
# Get your Anthropic API key from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-xxx...

# YOUR enterprise Jira URL (replace with your actual domain!)
# Examples: https://jira.yourcompany.com OR https://jira.companyinternal.com
JIRA_URL=https://jira.yourcompany.com

# YOUR enterprise Confluence URL (replace with your actual domain!)
# Examples: https://confluence.yourcompany.com OR https://confluence.companyinternal.com
CONFLUENCE_URL=https://confluence.yourcompany.com

# YOUR Jira/Confluence username (usually your work email)
JIRA_USERNAME=your.email@company.com
CONFLUENCE_USERNAME=your.email@company.com

# YOUR Personal Access Tokens (see Authentication section below)
JIRA_API_TOKEN=your_jira_personal_access_token
CONFLUENCE_API_TOKEN=your_confluence_personal_access_token

# YOUR team's Confluence space key
CONFLUENCE_SPACE_KEY=YOURSPACE

# YOUR user information
USER_DISPLAY_NAME=Your Name
USER_EMAIL=your.email@company.com
```

## Authentication

This tool uses **Personal Access Tokens (PAT)** which work with enterprise SSO setups.

### Creating a Personal Access Token

**For Jira/Confluence Server/Data Center:**
1. Log into your Atlassian instance
2. Go to Profile → Personal Access Tokens
3. Create a new token with appropriate permissions
4. Copy the token to your `.env` file

**For Atlassian Cloud:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Use your email as username and the token as password

## Usage

### Jira Commands

**Get Sprint issues (default):**
```bash
python -m src.main jira
```

**Get all your issues (not just sprints):**
```bash
python -m src.main jira --all-issues
```

**Get issues from a specific board:**
```bash
python -m src.main jira --board-id 123
```

**Ask Claude a custom question:**
```bash
python -m src.main jira --question "Which issues are blocked?"
```

**Skip AI analysis (faster):**
```bash
python -m src.main jira --no-analyze
```

### Confluence Commands

**Search for pages:**
```bash
python -m src.main confluence search "API documentation"
```

**Search in a specific space:**
```bash
python -m src.main confluence search "onboarding" --space TEAM
```

**Read a specific page:**
```bash
python -m src.main confluence read --title "Team Guidelines"
```

**Read a page by ID:**
```bash
python -m src.main confluence read --page-id 123456
```

**Get recently updated pages:**
```bash
python -m src.main confluence recent
```

**Search with AI analysis:**
```bash
python -m src.main confluence search "deployment" --analyze
```

## Configuration Reference

**Note:** All example values below must be replaced with your actual credentials!

| Variable | Required | Description | Example (replace with yours!) |
|----------|----------|-------------|-------------------------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key | `sk-ant-xxx...` |
| `JIRA_URL` | Yes | Your Jira instance URL | `https://jira.yourcompany.com` |
| `JIRA_USERNAME` | Yes | Your Jira username/email | `your.email@company.com` |
| `JIRA_API_TOKEN` | Yes | Your Jira Personal Access Token | `your_token_here` |
| `CONFLUENCE_URL` | Yes | Your Confluence instance URL | `https://confluence.yourcompany.com` |
| `CONFLUENCE_USERNAME` | Yes | Your Confluence username/email | `your.email@company.com` |
| `CONFLUENCE_API_TOKEN` | Yes | Your Confluence Personal Access Token | `your_token_here` |
| `CONFLUENCE_SPACE_KEY` | No | Default Confluence space | `YOURSPACE` |
| `USER_DISPLAY_NAME` | No | Your display name | `Your Name` |
| `USER_EMAIL` | No | Your email (for filtering issues) | `your.email@company.com` |

## Project Structure

```
confluence_assistant/
├── src/
│   ├── __init__.py
│   ├── main.py               # CLI entry point
│   ├── agent.py              # AI Agent orchestration
│   ├── config.py             # Configuration management
│   ├── jira_api.py           # Jira REST API client
│   ├── jira_service.py       # Jira business logic
│   ├── confluence_api.py     # Confluence REST API client
│   └── confluence_service.py # Confluence business logic
├── .env.example              # Environment template
├── requirements.txt          # Python dependencies
├── setup.sh                  # Automated setup script
├── run.sh                    # Quick run script
├── README.md
└── TROUBLESHOOTING.md
```

## How It Works

1. **Direct API Access**: Connects directly to your enterprise Jira/Confluence instances via REST API
2. **PAT Authentication**: Uses Personal Access Tokens for secure, SSO-compatible authentication
3. **Data Retrieval**: Fetches issues, pages, and content using JQL and CQL queries
4. **AI Analysis**: Claude analyzes the content and provides insights, summaries, and answers

## Customization

### JQL Queries

The default JQL query for Sprint issues:
```
assignee = "your-email@xyz.com" AND sprint in openSprints() ORDER BY priority DESC
```

You can customize queries in `src/jira_api.py`:
- Filter by projects: `AND project = "PROJECT_KEY"`
- Include specific sprint states: `sprint in futureSprints()` or `sprint in closedSprints()`
- Add status filters: `AND status != "Done"`
- Filter by labels: `AND labels = "backend"`

### Confluence Queries

The tool uses CQL (Confluence Query Language) for searches. Customize in `src/confluence_api.py`:
- Search specific content types: `type=page AND text~"query"`
- Filter by space: `AND space="TEAM"`
- Search by labels: `AND label="api"`
- Date filters: `AND lastModified >= "2025-01-01"`

## Next Steps

1. Run the setup:
   ```bash
   ./setup.sh
   ```

2. Configure your credentials in `.env`

3. Test the agent:
   ```bash
   ./run.sh
   ```

4. If you encounter issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Sources

- [Atlassian MCP Server Documentation](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/)
- [GitHub - Atlassian MCP Server](https://github.com/atlassian/atlassian-mcp-server)
