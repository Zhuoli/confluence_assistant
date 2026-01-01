#!/usr/bin/env node

/**
 * Filesystem MCP Server Wrapper
 *
 * This server provides filesystem access to configured code repositories only.
 * It wraps the @modelcontextprotocol/server-filesystem package and restricts
 * access to only the directories specified in code-repos configuration.
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.error('Starting Filesystem MCP Server...');

  try {
    // Get allowed directories from environment variable
    const allowedDirsEnv = process.env.CODE_REPO_PATHS || '';
    const allowedDirs = allowedDirsEnv
      .split(':')
      .filter(path => path.trim().length > 0);

    if (allowedDirs.length === 0) {
      console.error('Warning: No code repositories configured. Filesystem MCP will have no allowed directories.');
      console.error('Please add code repositories in Settings to enable filesystem access.');
      process.exit(0); // Exit gracefully since this is optional
    }

    console.error(`Allowed directories: ${allowedDirs.join(', ')}`);

    // Find the filesystem server executable
    const projectRoot = resolve(__dirname, '..', '..');
    const filesystemServerPath = resolve(
      projectRoot,
      'node_modules',
      '@modelcontextprotocol',
      'server-filesystem',
      'dist',
      'index.js'
    );

    console.error(`Starting filesystem server from: ${filesystemServerPath}`);

    // Spawn the filesystem server with allowed directories
    const serverProcess = spawn('node', [filesystemServerPath, ...allowedDirs], {
      stdio: 'inherit',
      env: process.env,
    });

    serverProcess.on('error', (error) => {
      console.error('Filesystem server process error:', error);
      process.exit(1);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Filesystem server exited with code ${code}`);
        process.exit(code);
      }
    });

    // Handle termination signals
    process.on('SIGINT', () => {
      console.error('Shutting down filesystem server...');
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down filesystem server...');
      serverProcess.kill('SIGTERM');
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
