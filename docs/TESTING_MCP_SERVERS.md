# Testing MCP Servers

This guide explains how to test MCP servers independently without involving an LLM provider.

## Table of Contents

- [Quick Start](#quick-start)
- [Method 1: Authentication Testing](#method-1-authentication-testing)
- [Method 2: MCP Protocol Testing](#method-2-mcp-protocol-testing)
- [Method 3: MCP Inspector (Official Tool)](#method-3-mcp-inspector-official-tool)
- [Method 4: Manual JSON-RPC Testing](#method-4-manual-json-rpc-testing)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

1. Build the project:
```bash
npm run build
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Test Authentication (Fastest)

Test if your credentials work without starting MCP servers:

```bash
# Test Atlassian (Jira + Confluence)
node scripts/test-auth.js atlassian

# Test Oracle Cloud
node scripts/test-auth.js oci

# Test all
node scripts/test-auth.js all
```

### Test MCP Servers

Test MCP servers via JSON-RPC protocol:

```bash
# Test Atlassian MCP
node scripts/test-mcp.js atlassian

# Test Oracle Cloud MCP
node scripts/test-mcp.js oci
```

---

## Method 1: Authentication Testing

**Purpose**: Verify credentials and API connectivity without MCP protocol overhead.

### Test Atlassian Authentication

```bash
node scripts/test-auth.js atlassian
```

**What it tests**:
- ✅ Jira URL accessibility
- ✅ Jira API token validity
- ✅ Confluence URL accessibility
- ✅ Confluence API token validity
- ✅ User account details

**Expected Output**:
```
🔐 Testing Atlassian Authentication
=====================================

📋 Configuration Check:
✅ Jira URL: https://jira.yourcompany.com
✅ Jira Username: your.email@company.com
✅ Jira Token: abc123defg...

📋 Test 1: Jira Authentication
✅ Jira authentication successful!
   User: John Doe (john.doe@company.com)
   Account ID: 5b10a2844c20165700ede21g

📋 Test 2: Confluence Authentication
✅ Confluence authentication successful!
   User: John Doe (jdoe)
   User Key: 8a7f808a71f8b32d0171f8d4e580004f
```

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid credentials | Check API token in .env |
| `404 Not Found` | Wrong URL | Verify JIRA_URL/CONFLUENCE_URL |
| `ENOTFOUND` | Network/DNS issue | Check internet connection |

### Test OCI Authentication

```bash
node scripts/test-auth.js oci
```

**What it tests**:
- ✅ OCI config file exists (~/.oci/config)
- ✅ Session token is valid
- ✅ Compartment accessibility
- ✅ Tenancy access

**Expected Output**:
```
🔐 Testing OCI Authentication
==============================

📋 Configuration Check:
✅ Region: us-phoenix-1
✅ Compartment ID: ocid1.compartment.oc1..xxx
✅ Tenancy ID: ocid1.tenancy.oc1..xxx
✅ Config Path: ~/.oci/config
✅ Profile: DEFAULT

📋 Test 1: OCI Session Token Validation
⏳ Fetching compartment details...
✅ OCI authentication successful!
   Compartment: Production
   Description: Production environment
   State: ACTIVE

📋 Test 2: OCI Tenancy Access
⏳ Fetching tenancy details...
✅ Tenancy access successful!
   Tenancy: MyCompany
   Home Region: us-phoenix-1
```

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| `Config file not found` | No ~/.oci/config | Run `oci session authenticate` |
| `Session token expired` | Token expired | Refresh with `oci session authenticate` |
| `404 Not Found` | Invalid compartment ID | Check OCI_MCP_COMPARTMENT_ID |

---

## Method 2: MCP Protocol Testing

**Purpose**: Test MCP servers via JSON-RPC protocol (how LLMs communicate with them).

### Test Atlassian MCP Server

```bash
node scripts/test-mcp.js atlassian
```

**What it tests**:
- ✅ MCP server starts correctly
- ✅ Server responds to `initialize` request
- ✅ Server lists all available tools (10 tools)
- ✅ Server executes a sample tool (search_jira_tickets)

**Expected Output**:
```
🚀 Starting MCP server: dist/mcp/atlassian-server.js

📋 Test 1: Initialize MCP Server
✅ Server initialized successfully
   Server name: atlassian-mcp-server
   Server version: 3.0.0
   Protocol version: 2024-11-05

📋 Test 2: List Available Tools
✅ Found 10 tools:
   1. search_jira_tickets
      Search for Jira issues using JQL
   2. get_jira_issue
      Get detailed information about a specific Jira issue
   3. create_jira_issue
      Create a new Jira issue
   ...

📋 Test 3: Call Tool "search_jira_tickets"
✅ Tool executed successfully
   Response: Found 5 issues: PROJECT-123, PROJECT-124...

✅ All tests completed successfully!
```

### Test Oracle Cloud MCP Server

```bash
node scripts/test-mcp.js oci
```

**What it tests**:
- ✅ OCI MCP server starts correctly
- ✅ Server responds to `initialize` request
- ✅ Server lists all available tools (10 tools)
- ✅ Server executes connection test

**Expected Output**:
```
🚀 Starting MCP server: dist/mcp/oci-server.js

📋 Test 1: Initialize MCP Server
✅ Server initialized successfully
   Server name: oracle-cloud-mcp-server
   Server version: 1.0.0
   Protocol version: 2024-11-05

📋 Test 2: List Available Tools
✅ Found 10 tools:
   1. test_oci_connection
      Test OCI connection and authentication
   2. list_oci_compartments
      List compartments in OCI tenancy
   ...

📋 Test 3: Call Tool "test_oci_connection"
✅ Tool executed successfully
   Response: OCI connection successful. Region: us-phoenix-1...

✅ All tests completed successfully!
```

---

## Method 3: MCP Inspector (Official Tool)

**Purpose**: Official Anthropic tool for interactive MCP server testing with a GUI.

### Installation

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Or use via npx (no installation)
npx @modelcontextprotocol/inspector
```

### Test Atlassian MCP Server

```bash
# Start inspector with Atlassian MCP
npx @modelcontextprotocol/inspector node dist/mcp/atlassian-server.js
```

This will:
1. Start a local web server (usually http://localhost:5173)
2. Open your browser automatically
3. Connect to the MCP server

**In the Inspector UI**:
- 📋 **Tools Tab**: See all 10 available tools
- 🔧 **Call Tool**: Click any tool to test it with custom arguments
- 📊 **Logs**: View server logs and debug output
- 🔍 **Schema**: Inspect tool schemas and parameters

### Test Oracle Cloud MCP Server

```bash
# Start inspector with OCI MCP
npx @modelcontextprotocol/inspector node dist/mcp/oci-server.js
```

### Interactive Testing Workflow

1. **Initialize**: Inspector automatically sends `initialize` request
2. **Browse Tools**: Click "Tools" tab to see all available tools
3. **Test a Tool**:
   - Click on a tool (e.g., "search_jira_tickets")
   - Fill in required parameters in the form
   - Click "Call Tool"
   - View the response in the output panel
4. **Debug**: Check "Logs" tab for server-side logs

**Example: Testing search_jira_tickets**
```json
{
  "jql": "project = MYPROJ ORDER BY created DESC",
  "max_results": 10
}
```

---

## Method 4: Manual JSON-RPC Testing

**Purpose**: Low-level testing using raw JSON-RPC messages via stdio.

### Using curl-like approach with echo

```bash
# Start MCP server
node dist/mcp/atlassian-server.js

# In another terminal, send JSON-RPC request
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | node dist/mcp/atlassian-server.js
```

### Using Node.js REPL

```javascript
const { spawn } = require('child_process');

// Start server
const server = spawn('node', ['dist/mcp/atlassian-server.js']);

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// Listen for response
server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});
```

### Common JSON-RPC Messages

**Initialize Server**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}
```

**List Tools**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

**Call Tool**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_jira_tickets",
    "arguments": {
      "jql": "project = TEST",
      "max_results": 5
    }
  }
}
```

---

## Troubleshooting

### Atlassian MCP Issues

**Problem**: `401 Unauthorized` when calling tools

**Solution**:
1. Run authentication test:
   ```bash
   node scripts/test-auth.js atlassian
   ```
2. Verify .env has correct credentials
3. Regenerate API tokens if needed

**Problem**: `Cannot find module` errors

**Solution**:
```bash
npm run build  # Rebuild TypeScript
```

### OCI MCP Issues

**Problem**: `Session token expired`

**Solution**:
```bash
# Refresh session token
oci session authenticate --profile-name DEFAULT --region us-phoenix-1

# Test again
node scripts/test-auth.js oci
```

**Problem**: `Config file not found`

**Solution**:
```bash
# Create OCI config
mkdir -p ~/.oci
oci session authenticate --profile-name DEFAULT --region us-phoenix-1
```

### MCP Inspector Issues

**Problem**: Inspector won't start

**Solution**:
```bash
# Clear npx cache
npx clear-npx-cache

# Reinstall
npm install -g @modelcontextprotocol/inspector
```

**Problem**: "Cannot connect to server"

**Solution**:
1. Make sure server path is correct
2. Check server is built: `npm run build`
3. Try with full path: `npx @modelcontextprotocol/inspector node $(pwd)/dist/mcp/atlassian-server.js`

### General Debugging

**Enable verbose logging**:
```bash
# Set debug environment variable
DEBUG=* node dist/mcp/atlassian-server.js
```

**Check server stderr**:
The MCP servers log to stderr, you can redirect it:
```bash
node dist/mcp/atlassian-server.js 2>server.log
```

---

## Best Practices

1. **Test Authentication First**: Always run `test-auth.js` before testing MCP servers
2. **Use MCP Inspector for Development**: Great for interactive testing and debugging
3. **Automate with test-mcp.js**: Use in CI/CD pipelines for automated testing
4. **Check Logs**: MCP servers log to stderr, always check for errors
5. **Verify Build**: Run `npm run build` if you change source code

---

## Next Steps

- [MCP Protocol Specification](https://modelcontextprotocol.io/docs/specification)
- [Anthropic MCP SDK Documentation](https://github.com/anthropics/modelcontextprotocol)
- [OCI SDK Documentation](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm)
