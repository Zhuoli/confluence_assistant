# Troubleshooting Guide

## Common Issues

### 1. "ANTHROPIC_API_KEY is required"

**Problem**: Missing or invalid Anthropic API key.

**Solution**:
1. Get your API key from https://console.anthropic.com/
2. Add it to your `.env` file:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxx...
   ```

### 2. "ATLASSIAN_CLOUD_SITE is required"

**Problem**: Missing Atlassian Cloud site configuration.

**Solution**:
1. Find your Atlassian Cloud site (e.g., `company.atlassian.net`)
2. Add it to your `.env` file:
   ```
   ATLASSIAN_CLOUD_SITE=company.atlassian.net
   ```

### 3. "Failed to start MCP proxy"

**Problem**: Node.js is not installed or `mcp-remote` failed to start.

**Solutions**:
- Check Node.js installation:
  ```bash
  node --version  # Should be v18 or higher
  ```
- Install Node.js from https://nodejs.org/
- Try running the proxy manually:
  ```bash
  npx -y mcp-remote https://mcp.atlassian.com/v1/sse
  ```

### 4. OAuth Authentication Issues

**Problem**: Browser doesn't open or authentication fails.

**Solutions**:
- Ensure you're logged into your Atlassian account in your default browser
- Try clearing browser cookies for `atlassian.com`
- Check that you have access to Jira in your Atlassian Cloud site
- Verify your network allows connections to `mcp.atlassian.com`

### 5. "No tasks found" or Empty Results

**Problem**: The JQL query returns no results.

**Possible causes**:
- Your email in `.env` doesn't match your Jira account email
- You're not assigned to any tasks in active sprints
- You don't have access to view the Sprint tasks

**Solutions**:
- Verify your email matches your Jira account:
  - Go to your Atlassian profile
  - Check the email address
  - Update `JIRA_USER_EMAIL` in `.env` if needed
- Check if you have tasks in Jira manually
- Verify you have access to the Sprint boards

### 6. Rate Limit Errors

**Problem**: Too many requests to MCP server.

**Rate Limits** (per hour):
- Free: 500 calls
- Standard: 1,000 calls
- Premium/Enterprise: 1,000-10,000 calls

**Solution**:
- Wait for the rate limit to reset (hourly)
- Reduce frequency of requests
- Upgrade your Atlassian plan if needed

### 7. Python Module Import Errors

**Problem**: `ModuleNotFoundError` or import issues.

**Solutions**:
- Ensure virtual environment is activated:
  ```bash
  source venv/bin/activate
  ```
- Reinstall dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Use Python 3.9 or higher:
  ```bash
  python3 --version
  ```

### 8. MCP Connection Timeout

**Problem**: Connection to MCP server times out.

**Solutions**:
- Check your internet connection
- Verify firewall isn't blocking connections
- Check if `mcp.atlassian.com` is accessible:
  ```bash
  curl -I https://mcp.atlassian.com/v1/sse
  ```
- Try again later (server might be down)

## Getting Help

If you continue to experience issues:

1. Check the [Atlassian MCP Server Documentation](https://support.atlassian.com/atlassian-rovo-mcp-server/)
2. Review the [GitHub Issues](https://github.com/atlassian/atlassian-mcp-server/issues)
3. Contact Atlassian Support

## Debugging Tips

### Enable Verbose Logging

Add debug output to see what's happening:

```python
# In src/mcp_client.py, add logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Test MCP Proxy Manually

Run the proxy standalone:
```bash
npx -y mcp-remote https://mcp.atlassian.com/v1/sse
```

This will show if authentication works independently of the Python code.

### Verify Environment Variables

Check that your environment is loaded:
```bash
python3 -c "from src.config import get_config; print(get_config())"
```
