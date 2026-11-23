#!/usr/bin/env node

/**
 * Coolify CLI - Direct IDE Integration
 * Lightweight command-line interface for Coolify management
 * Works with any IDE that supports shell commands
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration from environment
const CONFIG = {
  baseUrl: process.env.COOLIFY_API_URL || 'http://localhost:3000',
  apiKey: require('dotenv').config({ path: join(__dirname, '../.env') }).parsed?.COOLIFY_API_KEY || process.env.COOLIFY_API_KEY,
  timeout: parseInt(process.env.COOLIFY_TIMEOUT || '30000', 10)
};

// Zod schemas for validation
const schemas = {
  projectId: z.string().uuid(),
  projectName: z.string().min(1).max(255),
  replicas: z.number().min(1).max(100),
  cpu: z.number().min(0.1).max(32),
  memory: z.string().regex(/^([0-9]+(\.[0-9]+)?)(G|M)B?$/i),
  branch: z.string().optional(),
  tag: z.string().optional(),
  message: z.string().optional()
};

// Helper functions
async function coolifyRequest(endpoint, options = {}) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${CONFIG.apiKey}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return response.json();
}

function formatResponse(data, pretty = true) {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

function log(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

// Project Commands
async function listProjects() {
  try {
    const projects = await coolifyRequest('/api/project');
    log(`Found ${projects.length} projects`, 'info');
    console.log(formatResponse(projects));
  } catch (error) {
    log(`Failed to list projects: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function getProject(id) {
  try {
    schemas.projectId.parse(id);
    const project = await coolifyRequest(`/api/project/${id}`);
    console.log(formatResponse(project));
  } catch (error) {
    log(`Failed to get project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function createProject(name, type = 'docker') {
  try {
    const validatedName = schemas.projectName.parse(name);
    const project = await coolifyRequest('/api/project', {
      method: 'POST',
      body: JSON.stringify({ name: validatedName, type })
    });
    log(`Created project: ${name}`, 'success');
    console.log(formatResponse(project));
  } catch (error) {
    log(`Failed to create project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function deployProject(id, options = {}) {
  try {
    schemas.projectId.parse(id);
    const deployOptions = {
      branch: options.branch,
      tag: options.tag,
      message: options.message
    };
    const result = await coolifyRequest(`/api/project/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify(deployOptions)
    });
    log(`Deployment started for project ${id}`, 'success');
    console.log(formatResponse(result));
  } catch (error) {
    log(`Failed to deploy project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function startProject(id) {
  try {
    schemas.projectId.parse(id);
    await coolifyRequest(`/api/project/${id}/start`, { method: 'POST' });
    log(`Started project ${id}`, 'success');
  } catch (error) {
    log(`Failed to start project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function stopProject(id) {
  try {
    schemas.projectId.parse(id);
    await coolifyRequest(`/api/project/${id}/stop`, { method: 'POST' });
    log(`Stopped project ${id}`, 'success');
  } catch (error) {
    log(`Failed to stop project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function restartProject(id) {
  try {
    schemas.projectId.parse(id);
    await coolifyRequest(`/api/project/${id}/restart`, { method: 'POST' });
    log(`Restarted project ${id}`, 'success');
  } catch (error) {
    log(`Failed to restart project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function scaleProject(id, replicas, cpu, memory) {
  try {
    schemas.projectId.parse(id);
    const validatedReplicas = schemas.replicas.parse(replicas);
    const scaleOptions = { replicas: validatedReplicas };
    
    if (cpu) scaleOptions.cpu = schemas.cpu.parse(cpu);
    if (memory) scaleOptions.memory = schemas.memory.parse(memory);
    
    await coolifyRequest(`/api/project/${id}/scale`, {
      method: 'POST',
      body: JSON.stringify(scaleOptions)
    });
    log(`Scaled project ${id} to ${validatedReplicas} replicas`, 'success');
  } catch (error) {
    log(`Failed to scale project: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function deleteProject(id) {
  try {
    schemas.projectId.parse(id);
    await coolifyRequest(`/api/project/${id}`, { method: 'DELETE' });
    log(`Deleted project ${id}`, 'success');
  } catch (error) {
    log(`Failed to delete project: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Database Commands
async function listDatabases() {
  try {
    const databases = await coolifyRequest('/api/database');
    log(`Found ${databases.length} databases`, 'info');
    console.log(formatResponse(databases));
  } catch (error) {
    log(`Failed to list databases: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function getDatabase(id) {
  try {
    schemas.projectId.parse(id);
    const database = await coolifyRequest(`/api/database/${id}`);
    console.log(formatResponse(database));
  } catch (error) {
    log(`Failed to get database: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function deleteDatabase(id) {
  try {
    schemas.projectId.parse(id);
    await coolifyRequest(`/api/database/${id}`, { method: 'DELETE' });
    log(`Deleted database ${id}`, 'success');
  } catch (error) {
    log(`Failed to delete database: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Service Commands
async function listServices() {
  try {
    const services = await coolifyRequest('/api/service');
    log(`Found ${services.length} services`, 'info');
    console.log(formatResponse(services));
  } catch (error) {
    log(`Failed to list services: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Server Information
async function getServerInfo() {
  try {
    const info = await coolifyRequest('/api/server/info');
    console.log(formatResponse(info));
  } catch (error) {
    log(`Failed to get server info: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function getProjectLogs(id, lines = 100) {
  try {
    schemas.projectId.parse(id);
    const logs = await coolifyRequest(`/api/project/${id}/logs?lines=${lines}`);
    console.log(logs);
  } catch (error) {
    log(`Failed to get logs: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function healthCheck(id) {
  try {
    schemas.projectId.parse(id);
    const health = await coolifyRequest(`/api/project/${id}/health`);
    console.log(formatResponse(health));
  } catch (error) {
    log(`Health check failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Help
function showHelp() {
  console.log(`
Coolify CLI - Direct IDE Integration
Usage: coolify-cli <command> [options]

Projects:
  coolify-cli projects:list              List all projects
  coolify-cli projects:get <id>           Get project details
  coolify-cli projects:create <name>      Create new project
  coolify-cli projects:deploy <id>        Deploy project
  coolify-cli projects:start <id>         Start project
  coolify-cli projects:stop <id>          Stop project
  coolify-cli projects:restart <id>       Restart project
  coolify-cli projects:scale <id> <n>     Scale project replicas
  coolify-cli projects:delete <id>        Delete project

Databases:
  coolify-cli databases:list              List all databases
  coolify-cli databases:get <id>          Get database details
  coolify-cli databases:delete <id>       Delete database

Services:
  coolify-cli services:list               List all services

Server:
  coolify-cli server:info                 Get server information
  coolify-cli logs:get <id> [lines]       Get project logs
  coolify-cli health:check <id>           Health check project

Options:
  --help, -h                            Show this help
  --api-url <url>                       Override API URL
  --quiet, -q                           Suppress output

Environment Variables:
  COOLIFY_API_KEY                       Your Coolify API key (required)
  COOLIFY_API_URL                       Coolify API URL (default: http://localhost:3000)
  COOLIFY_TIMEOUT                       Request timeout in ms (default: 30000)

Examples:
  COOLIFY_API_KEY=xxx coolify-cli projects:list
  coolify-cli projects:create my-app
  coolify-cli projects:deploy abc123 --branch main
`);
}

// Parse arguments
function parseArgs(args) {
  const result = { command: null, options: {} };
  
  // Parse commands and options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.options.help = true;
    } else if (arg === '--quiet' || arg === '-q') {
      result.options.quiet = true;
    } else if (arg === '--api-url') {
      result.options.apiUrl = args[++i];
    } else if (!arg.startsWith('--')) {
      if (!result.command) {
        result.command = arg;
      } else {
        result.options._args = result.options._args || [];
        result.options._args.push(arg);
      }
    }
  }
  
  return result;
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  const { command, options } = parseArgs(args);
  
  if (options.help || !command) {
    showHelp();
    process.exit(0);
  }
  
  // Override config with options
  if (options.apiUrl) {
    CONFIG.baseUrl = options.apiUrl;
  }
  
  if (!CONFIG.apiKey) {
    log('COOLIFY_API_KEY environment variable is required. See: coolify-cli --help', 'error');
    process.exit(1);
  }
  
  // Command handlers
  const cmd = args[0] || command;
  const opts = options._args || [];
  
  const handlers = {
    'projects:list': { fn: listProjects, expects: 0 },
    'projects:get': { fn: getProject, expects: 1 },
    'projects:create': { fn: createProject, expects: 1 },
    'projects:deploy': { fn: deployProject, expects: 1, parseOpts: parseDeployOpts },
    'projects:start': { fn: startProject, expects: 1 },
    'projects:stop': { fn: stopProject, expects: 1 },
    'projects:restart': { fn: restartProject, expects: 1 },
    'projects:scale': { fn: scaleProject, expects: 2 },
    'projects:delete': { fn: deleteProject, expects: 1 },
    'databases:list': { fn: listDatabases, expects: 0 },
    'databases:get': { fn: getDatabase, expects: 1 },
    'databases:delete': { fn: deleteDatabase, expects: 1 },
    'services:list': { fn: listServices, expects: 0 },
    'server:info': { fn: getServerInfo, expects: 0 },
    'logs:get': { fn: getProjectLogs, expects: 1, minArgs: 1 },
    'health:check': { fn: healthCheck, expects: 1 }
  };
  
  if (handlers[cmd]) {
    const handler = handlers[cmd];
    
    if (opts.length < (handler.minArgs || handler.expects)) {
      log(`Usage: coolify-cli ${cmd} <args>`, 'error');
      process.exit(1);
    }
    
    try {
      if (handler.parseOpts) {
        await handler.fn(opts[0], handler.parseOpts(opts.slice(1)));
      } else {
        await handler.fn(...opts);
      }
    } catch (error) {
      if (!options.quiet) {
        log(error.message, 'error');
      }
      process.exit(1);
    }
  } else {
    log(`Unknown command: ${cmd}\nRun 'coolify-cli --help' for usage`, 'error');
    process.exit(1);
  }
}

function parseDeployOpts(args) {
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    opts[key] = value;
  }
  return opts;
}

main().catch(error => {
  log(error.message, 'error');
  process.exit(1);
});