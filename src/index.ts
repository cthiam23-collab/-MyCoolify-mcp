/**
 * Main entry point for Coolify MCP Server
 * This file is the build entry point that exports the server
 */

import './server.js';

// Re-export types for external use
export * from './types.js';
export * from './coolifyClient.js';
export * from './tools/index.js';