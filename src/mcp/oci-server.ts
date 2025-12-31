#!/usr/bin/env node

/**
 * Oracle Cloud MCP Server
 *
 * This server provides MCP tools for interacting with Oracle Cloud Infrastructure (OCI).
 * It exposes tools that can be used by AI agents through the Model Context Protocol.
 *
 * IMPORTANT: This server uses ONLY Session Token authentication for OCI.
 * Session tokens must be created using: oci session authenticate --profile-name <profile> --region <region>
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from '../config/index.js';
import { registerOCITools } from './tools/oci-tools.js';
import { OCI_TOOLS } from './oci-types.js';

async function main() {
  console.error('Starting Oracle Cloud MCP Server (TypeScript)...');

  try {
    // Load and validate configuration
    const config = loadConfig();

    // Check if OCI MCP is enabled
    if (!config.ociMcpEnabled) {
      console.error('❌ OCI MCP is not enabled. Set OCI_MCP_ENABLED=true in your .env file');
      process.exit(1);
    }

    console.error('Configuration validated successfully');

    // Create MCP server instance
    const server = new Server(
      {
        name: 'oracle-cloud-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    console.error('Registering OCI tools...');
    registerOCITools(server, config);

    // Register list_tools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error(`Listing ${OCI_TOOLS.length} available OCI tools`);
      return {
        tools: OCI_TOOLS,
      };
    });

    console.error(`OCI MCP Server initialized with ${OCI_TOOLS.length} tools`);

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Server running on stdio transport');

    // Keep the process running
    process.on('SIGINT', async () => {
      console.error('Shutting down OCI MCP server...');
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Server error:', error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
