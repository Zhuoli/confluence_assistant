# Configuration Guide

## Overview

This application is **fully configurable** and works with any Atlassian deployment. All domains, usernames, and credentials are configured through environment variables in the `.env` file.

## Important Notes

⚠️ **NO values are hardcoded** - everything must be configured in `.env`

⚠️ **All examples are placeholders** - replace with your actual values

⚠️ **Works with any domain** - cloud, self-hosted, or custom internal domains

## Configuration File

Copy the example configuration:
```bash
cp .env.example .env
```

Then edit `.env` with your actual values.

## Required Variables

### Anthropic API
```bash
ANTHROPIC_API_KEY=sk-ant-xxx...
```
Get from: https://console.anthropic.com/

### Jira Configuration
```bash
# Replace with YOUR actual Jira domain!
# Examples:
#   Cloud: https://yourcompany.atlassian.net
#   Self-hosted: https://jira.yourcompany.com
#   Custom: https://jira.companyinternal.com
JIRA_URL=https://jira.yourcompany.com

# YOUR Jira username (usually your work email)
JIRA_USERNAME=your.email@company.com

# YOUR Jira Personal Access Token
JIRA_API_TOKEN=your_token_here
```

### Confluence Configuration
```bash
# Replace with YOUR actual Confluence domain!
# Examples:
#   Cloud: https://yourcompany.atlassian.net/wiki
#   Self-hosted: https://confluence.yourcompany.com
#   Custom: https://confluence.companyinternal.com
CONFLUENCE_URL=https://confluence.yourcompany.com

# YOUR Confluence username (usually same as Jira)
CONFLUENCE_USERNAME=your.email@company.com

# YOUR Confluence Personal Access Token
CONFLUENCE_API_TOKEN=your_token_here

# YOUR team's space key (optional, e.g., TEAM, ENG, DOCS)
CONFLUENCE_SPACE_KEY=YOURSPACE
```

## Optional Variables

```bash
# YOUR display name
USER_DISPLAY_NAME=Your Name

# YOUR email (used for filtering Jira issues)
# Should match your Jira account email
USER_EMAIL=your.email@company.com
```

## Examples for Different Deployments

### Enterprise Self-Hosted (e.g., Oracle)
```bash
JIRA_URL=https://jira.oracleinternal.com
CONFLUENCE_URL=https://confluence.oracleinternal.com
JIRA_USERNAME=john.doe@oracle.com
CONFLUENCE_USERNAME=john.doe@oracle.com
```

### Atlassian Cloud
```bash
JIRA_URL=https://mycompany.atlassian.net
CONFLUENCE_URL=https://mycompany.atlassian.net/wiki
JIRA_USERNAME=jane.smith@company.com
CONFLUENCE_USERNAME=jane.smith@company.com
```

### Mixed Deployment
```bash
JIRA_URL=https://jira-prod.company.local
CONFLUENCE_URL=https://wiki.company.com
JIRA_USERNAME=user@company.com
CONFLUENCE_USERNAME=user@company.com
```

### Custom Ports
```bash
JIRA_URL=https://jira.internal.com:8443
CONFLUENCE_URL=https://confluence.internal.com:8090
```

## Domain Requirements

### Format
- Must include protocol: `https://` (or `http://` for local testing)
- No trailing slash: ✅ `https://jira.company.com` ❌ `https://jira.company.com/`

### Valid Examples
- ✅ `https://jira.yourcompany.com`
- ✅ `https://jira.companyinternal.com`
- ✅ `https://atlassian.company.local`
- ✅ `https://company.atlassian.net`
- ✅ `https://jira-prod.corp.internal`

### Invalid Examples
- ❌ `jira.company.com` (missing protocol)
- ❌ `https://jira.company.com/` (trailing slash)
- ❌ `www.jira.company.com` (unnecessary www)

## Authentication

### Personal Access Tokens (PAT)

**For Self-Hosted (Server/Data Center):**
1. Log into your Atlassian instance
2. Click profile picture → Personal Access Tokens
3. Create token with appropriate permissions
4. Copy token to `.env`

**For Atlassian Cloud:**
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Copy token to `.env`
4. Username must be your email

### Token Permissions

Ensure your tokens have these permissions:
- **Jira**: Read issues, boards, sprints
- **Confluence**: Read pages, spaces, search

## Validation

After configuring, validate with:
```bash
python -c "from src.config import get_config; config = get_config(); print('✓ Configuration valid')"
```

If you see errors, check that all required variables are set.

## Security Best Practices

1. **Never commit `.env`** - it's in `.gitignore`
2. **Rotate tokens periodically** - every 6-12 months
3. **Use separate tokens** - different tools = different tokens
4. **Minimum permissions** - only grant what's needed
5. **Revoke unused tokens** - clean up old tokens

## Troubleshooting

### "JIRA_URL is required"
- Make sure `.env` file exists
- Verify variable is set (no typos)
- Check there are no extra spaces

### "Configuration Error"
- Run validation command above
- Check all required variables are set
- Verify no quotes around values in `.env`

### "Failed to connect"
- Verify URL is correct and accessible
- Check for typos in domain name
- Ensure no trailing slashes
- Test URL in browser first

## Support

For more help, see:
- [README.md](README.md) - Full documentation
- [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
