#!/usr/bin/env node

/**
 * MCP Server Test Utility
 *
 * This script tests MCP servers directly via stdio without requiring an LLM.
 * It sends JSON-RPC requests and validates responses.
 *
 * Usage:
 *   node scripts/test-mcp.js atlassian
 *   node scripts/test-mcp.js oci
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class MCPTester {
  constructor(serverPath) {
    this.serverPath = serverPath;
    this.messageId = 1;
    this.pendingRequests = new Map();
  }

  async start() {
    log(`\n🚀 Starting MCP server: ${this.serverPath}`, 'blue');

    this.process = spawn('node', [this.serverPath], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'inherit'],
      env: process.env,
    });

    this.process.on('error', (error) => {
      log(`❌ Failed to start server: ${error.message}`, 'red');
      process.exit(1);
    });

    this.process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`❌ Server exited with code ${code}`, 'red');
      }
    });

    // Set up response handler
    let buffer = '';
    this.process.stdout.on('data', (data) => {
      buffer += data.toString();

      // Process complete JSON-RPC messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            this.handleResponse(response);
          } catch (error) {
            // Ignore non-JSON lines (like console.error output)
          }
        }
      }
    });

    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  handleResponse(response) {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id);
      this.pendingRequests.delete(response.id);

      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.result);
      }
    }
  }

  sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify(request) + '\n';
      this.process.stdin.write(message);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }

  async testInitialize() {
    log('\n📋 Test 1: Initialize MCP Server', 'cyan');
    try {
      const result = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'mcp-test-client',
          version: '1.0.0',
        },
      });

      log(`✅ Server initialized successfully`, 'green');
      log(`   Server name: ${result.serverInfo?.name || 'Unknown'}`, 'green');
      log(`   Server version: ${result.serverInfo?.version || 'Unknown'}`, 'green');
      log(`   Protocol version: ${result.protocolVersion}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Initialize failed: ${error.message}`, 'red');
      return false;
    }
  }

  async testListTools() {
    log('\n📋 Test 2: List Available Tools', 'cyan');
    try {
      const result = await this.sendRequest('tools/list', {});

      if (!result.tools || result.tools.length === 0) {
        log(`⚠️  No tools found`, 'yellow');
        return false;
      }

      log(`✅ Found ${result.tools.length} tools:`, 'green');
      result.tools.forEach((tool, index) => {
        log(`   ${index + 1}. ${tool.name}`, 'green');
        log(`      ${tool.description || 'No description'}`, 'reset');
      });

      return result.tools;
    } catch (error) {
      log(`❌ List tools failed: ${error.message}`, 'red');
      return false;
    }
  }

  async testCallTool(toolName, args) {
    log(`\n📋 Test 3: Call Tool "${toolName}"`, 'cyan');
    try {
      const result = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: args,
      });

      log(`✅ Tool executed successfully`, 'green');
      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === 'text') {
          const preview = content.text.substring(0, 200);
          log(`   Response: ${preview}${content.text.length > 200 ? '...' : ''}`, 'reset');
        }
      }
      return true;
    } catch (error) {
      log(`❌ Tool call failed: ${error.message}`, 'red');
      log(`   Error: ${JSON.stringify(error, null, 2)}`, 'red');
      return false;
    }
  }

  async stop() {
    if (this.process) {
      this.process.kill();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Test configurations for different MCP servers
const testConfigs = {
  atlassian: {
    serverPath: 'dist/mcp/atlassian-server.js',
    testTool: {
      name: 'search_jira_tickets',
      args: {
        jql: 'project = TEST ORDER BY created DESC',
        max_results: 5,
      },
    },
  },
  oci: {
    serverPath: 'dist/mcp/oci-server.js',
    testTool: {
      name: 'test_oci_connection',
      args: {},
    },
  },
};

async function runTests(serverType) {
  const config = testConfigs[serverType];
  if (!config) {
    log(`❌ Unknown server type: ${serverType}`, 'red');
    log(`   Available: ${Object.keys(testConfigs).join(', ')}`, 'yellow');
    process.exit(1);
  }

  const serverPath = join(projectRoot, config.serverPath);
  const tester = new MCPTester(serverPath);

  try {
    await tester.start();

    // Run tests
    const initSuccess = await tester.testInitialize();
    if (!initSuccess) {
      throw new Error('Initialization failed');
    }

    const tools = await tester.testListTools();
    if (!tools) {
      throw new Error('Failed to list tools');
    }

    // Test calling a specific tool
    await tester.testCallTool(config.testTool.name, config.testTool.args);

    log('\n✅ All tests completed successfully!', 'green');
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await tester.stop();
  }
}

// Main execution
const serverType = process.argv[2];
if (!serverType) {
  log('Usage: node scripts/test-mcp.js <server-type>', 'yellow');
  log('Available server types:', 'yellow');
  log('  - atlassian  (Test Atlassian MCP with Jira/Confluence)', 'yellow');
  log('  - oci        (Test Oracle Cloud MCP)', 'yellow');
  process.exit(1);
}

runTests(serverType);
