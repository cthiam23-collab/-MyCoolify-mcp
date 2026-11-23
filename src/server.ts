/**
 * Main MCP Server for Coolify Plugin
 * Provides tools for managing Coolify projects, databases, and services
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListProjectsTool,
  GetProjectTool,
  CreateProjectTool,
  DeployProjectTool,
  StartProjectTool,
  StopProjectTool,
  RestartProjectTool,
  ScaleProjectTool,
  DeleteProjectTool,
  ListDatabasesTool,
  GetDatabaseTool,
  DeleteDatabaseTool,
  ListServicesTool,
  GetServiceTool,
  StartServiceTool,
  StopServiceTool,
  GetServerInfoTool,
  GetProjectLogsTool,
  HealthCheckTool,
} from './tools/index.js';
import { CoolifyClient } from './coolifyClient.js';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Configuration
const config = {
  baseUrl: process.env.COOLIFY_API_URL || 'http://localhost:3000',
  apiKey: process.env.COOLIFY_API_KEY || '',
  timeout: parseInt(process.env.COOLIFY_TIMEOUT || '30000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate configuration
if (!config.apiKey) {
  console.error('❌ Error: COOLIFY_API_KEY is required. Set it in your .env file.');
  process.exit(1);
}

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server({
    name: 'coolify-mcp-server',
    version: '1.0.0',
  });

  // Initialize Coolify client
  const client = new CoolifyClient(config.baseUrl, config.apiKey, 'v1');

  // Define Zod schemas for tool requests
  const ToolsListRequestSchema = z.object({ method: z.literal('tools/list') });
  const ToolsCallRequestSchema = z.object({
    method: z.literal('tools/call'),
    params: z.object({
      name: z.string(),
      arguments: z.record(z.any()).optional(),
    }),
  });

  // Register tools list handler
  server.setRequestHandler(ToolsListRequestSchema, async () => ({
    tools: [
      // Project tools
      {
        name: 'coolify_list_projects',
        description: 'List all Coolify projects with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term to filter projects' },
            page: { type: 'integer', minimum: 1, description: 'Page number for pagination' },
            limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of results per page' },
          },
        },
      },
      {
        name: 'coolify_get_project',
        description: 'Get detailed information about a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project to retrieve' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coolify_create_project',
        description: 'Create a new Coolify project',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, description: 'Name of the project' },
            description: { type: 'string', description: 'Project description' },
            environment: { type: 'string', description: 'Environment name (e.g., production, staging)' },
            gitRepository: { type: 'string', format: 'uri', description: 'Git repository URL' },
            buildCommand: { type: 'string', description: 'Custom build command' },
            startCommand: { type: 'string', description: 'Custom start command' },
          },
          required: ['name'],
        },
      },
      {
        name: 'coolify_deploy_project',
        description: 'Deploy a project to Coolify',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project to deploy' },
            branch: { type: 'string', description: 'Git branch to deploy' },
            tag: { type: 'string', description: 'Git tag to deploy' },
            message: { type: 'string', description: 'Deployment message' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coolify_start_project',
        description: 'Start a running project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coolify_stop_project',
        description: 'Stop a running project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coolify_restart_project',
        description: 'Restart a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coolify_scale_project',
        description: 'Scale a project\'s resources',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            replicas: { type: 'integer', minimum: 1, description: 'Number of replicas' },
            cpu: { type: 'number', minimum: 0.1, description: 'CPU in cores' },
            memory: { type: 'string', description: 'Memory allocation (e.g., "256m", "1g")' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'coolify_delete_project',
        description: 'Delete a project from Coolify',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project to delete' },
          },
          required: ['projectId'],
        },
      },

      // Database tools
      {
        name: 'coolify_list_databases',
        description: 'List all databases with optional filtering by type',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['postgresql', 'mysql', 'mariadb', 'redis', 'mongodb', 'mongo', 'cassandra', 'elasticsearch', 'memcached'],
              description: 'Filter by database type',
            },
            search: { type: 'string', description: 'Search term to filter databases' },
            page: { type: 'integer', minimum: 1, description: 'Page number for pagination' },
            limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of results per page' },
          },
        },
      },
      {
        name: 'coolify_get_database',
        description: 'Get detailed information about a specific database',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: { type: 'string', description: 'The ID of the database to retrieve' },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'coolify_delete_database',
        description: 'Delete a database from Coolify',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: { type: 'string', description: 'The ID of the database to delete' },
          },
          required: ['databaseId'],
        },
      },

      // Service tools
      {
        name: 'coolify_list_services',
        description: 'List all services with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term to filter services' },
            page: { type: 'integer', minimum: 1, description: 'Page number for pagination' },
            limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Number of results per page' },
          },
        },
      },
      {
        name: 'coolify_get_service',
        description: 'Get detailed information about a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: { type: 'string', description: 'The ID of the service to retrieve' },
          },
          required: ['serviceId'],
        },
      },
      {
        name: 'coolify_start_service',
        description: 'Start a service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: { type: 'string', description: 'The ID of the service' },
          },
          required: ['serviceId'],
        },
      },
      {
        name: 'coolify_stop_service',
        description: 'Stop a service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: { type: 'string', description: 'The ID of the service' },
          },
          required: ['serviceId'],
        },
      },

      // Server info
      {
        name: 'coolify_get_server_info',
        description: 'Get information about the Coolify server',
        inputSchema: {
          type: 'object',
          properties: {
            includeMetrics: { type: 'boolean', default: false, description: 'Include server metrics' },
          },
        },
      },

      // Logs
      {
        name: 'coolify_get_project_logs',
        description: 'Get logs for a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            tail: { type: 'integer', minimum: 1, maximum: 10000, description: 'Number of recent log lines to retrieve' },
            lines: { type: 'integer', minimum: 1, maximum: 10000, description: 'Number of log lines to retrieve' },
          },
        },
      },

      // Health check
      {
        name: 'coolify_health_check',
        description: 'Check if the Coolify server is healthy and accessible',
        inputSchema: {
          type: 'object',
          properties: {
            timeout: { type: 'integer', minimum: 1000, maximum: 10000, description: 'Timeout in milliseconds' },
          },
        },
      },
    ],
  }));

  // Register tool call handler
  server.setRequestHandler(ToolsCallRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const toolArgs = args ?? {};

    try {
      switch (name) {
        // Project tools
        case 'coolify_list_projects':
          return { content: [{ type: 'text', text: await ListProjectsTool(client, args) }] };
        case 'coolify_get_project':
          return { content: [{ type: 'text', text: await GetProjectTool(client, args) }] };
        case 'coolify_create_project':
          return { content: [{ type: 'text', text: await CreateProjectTool(client, args) }] };
        case 'coolify_deploy_project':
          return { content: [{ type: 'text', text: await DeployProjectTool(client, args) }] };
        case 'coolify_start_project':
          return { content: [{ type: 'text', text: await StartProjectTool(client, args) }] };
        case 'coolify_stop_project':
          return { content: [{ type: 'text', text: await StopProjectTool(client, args) }] };
        case 'coolify_restart_project':
          return { content: [{ type: 'text', text: await RestartProjectTool(client, args) }] };
        case 'coolify_scale_project':
          return { content: [{ type: 'text', text: await ScaleProjectTool(client, args) }] };
        case 'coolify_delete_project':
          return { content: [{ type: 'text', text: await DeleteProjectTool(client, args) }] };

        // Database tools
        case 'coolify_list_databases':
          return { content: [{ type: 'text', text: await ListDatabasesTool(client, args) }] };
        case 'coolify_get_database':
          return { content: [{ type: 'text', text: await GetDatabaseTool(client, args) }] };
        case 'coolify_delete_database':
          return { content: [{ type: 'text', text: await DeleteDatabaseTool(client, args) }] };

        // Service tools
        case 'coolify_list_services':
          return { content: [{ type: 'text', text: await ListServicesTool(client, args) }] };
        case 'coolify_get_service':
          return { content: [{ type: 'text', text: await GetServiceTool(client, args) }] };
        case 'coolify_start_service':
          return { content: [{ type: 'text', text: await StartServiceTool(client, args) }] };
        case 'coolify_stop_service':
          return { content: [{ type: 'text', text: await StopServiceTool(client, args) }] };

        // Server info
        case 'coolify_get_server_info':
          return { content: [{ type: 'text', text: await GetServerInfoTool(client, args) }] };

        // Logs
        case 'coolify_get_project_logs':
          return { content: [{ type: 'text', text: await GetProjectLogsTool(client, args) }] };

        // Health check
        case 'coolify_health_check':
          return { content: [{ type: 'text', text: await HealthCheckTool(client, args) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  // Graceful error handling
  server.onerror = (error) => {
    if (config.logLevel === 'debug') {
      console.error('MCP Server Error:', error);
    }
  };

  // Cleanup on exit
  process.on('SIGTERM', () => {
    server.close();
  });

  process.on('SIGINT', () => {
    server.close();
  });

  return server;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const server = createServer();

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`${config.logLevel === 'debug' ? 'Debug mode enabled. ' : ''}Coolify MCP Server started.`);
  console.error(`Connected to Coolify at: ${config.baseUrl}`);
}

main().catch((error) => {
  console.error('Failed to start Coolify MCP Server:', error);
  process.exit(1);
});