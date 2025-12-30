# Getting Started Guide

## Quick Start (5 minutes)

### 1. Prerequisites

- Python 3.9 or higher
- Access to enterprise Jira and/or Confluence
- Anthropic API key

### 2. Setup

```bash
# Clone or navigate to the project
cd confluence_assistant

# Run setup script
./setup.sh

# Edit configuration
nano .env  # or use your preferred editor
```

### 3. Configure .env

**IMPORTANT:** Replace ALL placeholder values with your actual credentials!

**Required for Jira:**
```bash
ANTHROPIC_API_KEY=your_key_here
JIRA_URL=https://jira.yourcompany.com     # <-- Replace with YOUR Jira domain!
JIRA_USERNAME=your.email@company.com      # <-- Replace with YOUR email!
JIRA_API_TOKEN=your_personal_access_token # <-- Replace with YOUR token!
```

**Required for Confluence:**
```bash
CONFLUENCE_URL=https://confluence.yourcompany.com  # <-- Replace with YOUR domain!
CONFLUENCE_USERNAME=your.email@company.com         # <-- Replace with YOUR email!
CONFLUENCE_API_TOKEN=your_personal_access_token    # <-- Replace with YOUR token!
CONFLUENCE_SPACE_KEY=YOUR_TEAM_SPACE               # <-- Replace with YOUR space!
```

**User Information:**
```bash
USER_DISPLAY_NAME=Your Name                  # <-- Replace with YOUR name!
USER_EMAIL=your.email@company.com           # <-- Replace with YOUR email!
```

### 4. Get Your Personal Access Token (PAT)

#### For Self-Hosted Atlassian (Server/Data Center):

1. Log into your Jira or Confluence instance
2. Click your profile picture → **Personal Access Tokens**
3. Click **Create token**
4. Name it (e.g., "AI Assistant")
5. Select expiration (recommend 1 year)
6. Copy the token to your `.env` file

#### For Atlassian Cloud:

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a label (e.g., "AI Assistant")
4. Copy the token to your `.env` file
5. Your username is your email address

### 5. Test It

```bash
# Activate virtual environment
source venv/bin/activate

# Get your Jira sprint issues
python -m src.main jira

# Search Confluence
python -m src.main confluence search "onboarding"
```

## Common Use Cases

### Daily Standup Prep
```bash
# Get your sprint issues with AI analysis
python -m src.main jira --question "What are my priorities today?"
```

### Find Documentation
```bash
# Search team documentation
python -m src.main confluence search "deployment process" --analyze

# Read a specific page
python -m src.main confluence read --title "Team Guidelines"
```

### Review Your Work
```bash
# Get all your issues, not just sprints
python -m src.main jira --all-issues --question "What's my progress this week?"
```

### Team Documentation Discovery
```bash
# See recent updates in your team space
python -m src.main confluence recent --space TEAM --analyze
```

## Troubleshooting

### "Configuration Error: JIRA_URL is required"
- Make sure you copied `.env.example` to `.env`
- Fill in all required fields

### "Failed to fetch Jira issues"
- Check your JIRA_URL is correct (no trailing slash)
- Verify your PAT has the right permissions
- Test the PAT in your browser or with curl

### "Authentication failed"
- For Cloud: Username must be your email
- For Server/Data Center: Username might be different from email
- Regenerate your PAT if it expired

### "No issues found"
- Verify you have issues assigned to you in Jira
- Check your email in .env matches your Jira account
- Try `--all-issues` flag to see all your issues

## Next Steps

- Read [README.md](README.md) for full documentation
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed help
- Customize JQL queries in `src/jira_api.py`
- Customize Confluence searches in `src/confluence_api.py`

## Tips

1. **Use aliases** for common commands:
   ```bash
   alias jira="python -m src.main jira"
   alias conf="python -m src.main confluence"
   ```

2. **Keep tokens secure**:
   - Never commit `.env` to git (already in `.gitignore`)
   - Rotate tokens periodically
   - Use separate tokens for different tools

3. **Save time with quick scripts**:
   ```bash
   # Add to your ~/.bashrc or ~/.zshrc
   daily_standup() {
       cd ~/confluence_assistant
       source venv/bin/activate
       python -m src.main jira --question "What should I focus on today?"
   }
   ```
