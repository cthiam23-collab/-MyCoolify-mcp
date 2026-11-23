/**
 * MCP Tools for Coolify Plugin
 * Each tool is mapped to a Coolify API operation
 */

import { z } from 'zod';
import { CoolifyClient } from './coolifyClient.js';
import {
  CoolifyProject,
  CoolifyDatabase,
  CoolifyService,
} from './types.js';

// Tool schemas for validation
export const ListProjectsSchema = z.object({
  search: z.string().optional().describe('Search term to filter projects'),
  page: z.number().int().min(1).optional().describe('Page number for pagination'),
  limit: z.number().int().min(1).max(100).optional().describe('Number of results per page'),
});

export const GetProjectSchema = z.object({
  projectId: z.string().describe('The ID of the project to retrieve'),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).describe('Name of the project'),
  description: z.string().optional().describe('Project description'),
  environment: z.string().optional().describe('Environment name (e.g., production, staging)'),
  gitRepository: z.string().url().optional().describe('Git repository URL'),
  buildCommand: z.string().optional().describe('Custom build command'),
  startCommand: z.string().optional().describe('Custom start command'),
});

export const DeployProjectSchema = z.object({
  projectId: z.string().describe('The ID of the project to deploy'),
  branch: z.string().optional().describe('Git branch to deploy'),
  tag: z.string().optional().describe('Git tag to deploy'),
  message: z.string().optional().describe('Deployment message'),
});

export const ListDatabasesSchema = z.object({
  type: z.enum(['postgresql', 'mysql', 'mariadb', 'redis', 'mongodb', 'mongo', 'cassandra', 'elasticsearch', 'memcached']).optional().describe('Filter by database type'),
  search: z.string().optional().describe('Search term to filter databases'),
  page: z.number().int().min(1).optional().describe('Page number for pagination'),
  limit: z.number().int().min(1).max(100).optional().describe('Number of results per page'),
});

export const GetDatabaseSchema = z.object({
  databaseId: z.string().describe('The ID of the database to retrieve'),
});

export const DeleteDatabaseSchema = z.object({
  databaseId: z.string().describe('The ID of the database to delete'),
});

export const ListServicesSchema = z.object({
  search: z.string().optional().describe('Search term to filter services'),
  page: z.number().int().min(1).optional().describe('Page number for pagination'),
  limit: z.number().int().min(1).max(100).optional().describe('Number of results per page'),
});

export const GetServiceSchema = z.object({
  serviceId: z.string().describe('The ID of the service to retrieve'),
});

export const GetServerInfoSchema = z.object({
  includeMetrics: z.boolean().optional().default(false).describe('Include server metrics'),
});

export const GetProjectLogsSchema = z.object({
  projectId: z.string().describe('The ID of the project'),
  tail: z.number().int().min(1).max(10000).optional().describe('Number of recent log lines to retrieve'),
  lines: z.number().int().min(1).max(10000).optional().describe('Number of log lines to retrieve'),
});

export const HealthCheckSchema = z.object({
  timeout: z.number().int().min(1000).max(10000).optional().describe('Timeout in milliseconds'),
});

/**
 * Format project data for display
 */
function formatProject(project: CoolifyProject): string {
  const lines = [
    `# ${project.name}`,
    `ID: ${project.id}`,
    `Status: ${project.status}`,
    `Created: ${project.createdAt}`,
  ];

  if (project.description) lines.push(`Description: ${project.description}`);
  if (project.subdomain) lines.push(`Subdomain: ${project.subdomain}`);
  if (project.domain) lines.push(`Domain: ${project.domain}`);
  if (project.environment) lines.push(`Environment: ${project.environment}`);

  if (project.cpuUsage !== undefined || project.memoryUsage !== undefined) {
    lines.push(`Resource Usage:`);
    if (project.cpuUsage !== undefined) lines.push(`  CPU: ${project.cpuUsage}%`);
    if (project.memoryUsage !== undefined) lines.push(`  Memory: ${project.memoryUsage}MB`);
    if (project.diskUsage !== undefined) lines.push(`  Disk: ${project.diskUsage}MB`);
  }

  return lines.join('\n');
}

/**
 * Format database data for display
 */
function formatDatabase(db: CoolifyDatabase): string {
  const lines = [
    `# ${db.name}`,
    `ID: ${db.id}`,
    `Type: ${db.type}`,
    `Host: ${db.host}:${db.port}`,
    `Status: ${db.status}`,
    `Created: ${db.createdAt}`,
  ];

  if (db.username) lines.push(`Username: ${db.username}`);
  if (db.database) lines.push(`Database: ${db.database}`);

  return lines.join('\n');
}

/**
 * Format service data for display
 */
function formatService(service: CoolifyService): string {
  const lines = [
    `# ${service.name}`,
    `ID: ${service.id}`,
    `Image: ${service.image}`,
    `Status: ${service.status}`,
    `Created: ${service.createdAt}`,
  ];

  if (service.command) lines.push(`Command: ${service.command}`);

  if (service.ports && service.ports.length > 0) {
    lines.push(`Ports: ${service.ports.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Tool implementations
 */

export async function listProjects(client: CoolifyClient, args: z.infer<typeof ListProjectsSchema>): Promise<string> {
  const projects = await client.listProjects(args);

  if (projects.length === 0) {
    return 'No projects found.';
  }

  return projects.map(formatProject).join('\n\n---\n\n');
}

export async function getProject(client: CoolifyClient, args: z.infer<typeof GetProjectSchema>): Promise<string> {
  const project = await client.getProject(args.projectId);
  return formatProject(project);
}

export async function createProject(client: CoolifyClient, args: z.infer<typeof CreateProjectSchema>): Promise<string> {
  const project = await client.createProject(args);
  return `Project created successfully:\n\n${formatProject(project)}`;
}

export async function deployProject(client: CoolifyClient, args: z.infer<typeof DeployProjectSchema>): Promise<string> {
  await client.deployProject(args.projectId, {
    branch: args.branch,
    tag: args.tag,
    message: args.message,
  });

  return `Deployment initiated for project ${args.projectId}${
    args.branch ? ` (branch: ${args.branch})` : ''
  }${args.tag ? ` (tag: ${args.tag})` : ''}.`;
}

export async function startProject(client: CoolifyClient, args: { projectId: string }): Promise<string> {
  await client.startProject(args.projectId);
  return `Project ${args.projectId} started.`;
}

export async function stopProject(client: CoolifyClient, args: { projectId: string }): Promise<string> {
  await client.stopProject(args.projectId);
  return `Project ${args.projectId} stopped.`;
}

export async function restartProject(client: CoolifyClient, args: { projectId: string }): Promise<string> {
  await client.restartProject(args.projectId);
  return `Project ${args.projectId} restarted.`;
}

export async function listDatabases(client: CoolifyClient, args: z.infer<typeof ListDatabasesSchema>): Promise<string> {
  const databases = await client.listDatabases(args);

  if (databases.length === 0) {
    return 'No databases found.';
  }

  return databases.map(formatDatabase).join('\n\n---\n\n');
}

export async function getDatabase(client: CoolifyClient, args: z.infer<typeof GetDatabaseSchema>): Promise<string> {
  const db = await client.getDatabase(args.databaseId);
  return formatDatabase(db);
}

export async function deleteDatabase(client: CoolifyClient, args: z.infer<typeof DeleteDatabaseSchema>): Promise<string> {
  await client.deleteDatabase(args.databaseId);
  return `Database ${args.databaseId} deleted successfully.`;
}

export async function listServices(client: CoolifyClient, args: z.infer<typeof ListServicesSchema>): Promise<string> {
  const services = await client.listServices(args);

  if (services.length === 0) {
    return 'No services found.';
  }

  return services.map(formatService).join('\n\n---\n\n');
}

export async function getService(client: CoolifyClient, args: z.infer<typeof GetServiceSchema>): Promise<string> {
  const service = await client.getService(args.serviceId);
  return formatService(service);
}

/**
 * Scale a project's resources
 */
export async function scaleProject(client: CoolifyClient, args: { projectId: string; replicas?: number; cpu?: number; memory?: string }): Promise<string> {
  await client.scaleProject(args.projectId, {
    replicas: args.replicas,
    cpu: args.cpu,
    memory: args.memory,
  });

  return `Project ${args.projectId} scaled successfully.`;
}

/**
 * Delete a project from Coolify
 */
export async function deleteProject(client: CoolifyClient, args: { projectId: string }): Promise<string> {
  await client.deleteProject(args.projectId);
  return `Project ${args.projectId} deleted successfully.`;
}

/**
 * Start a service
 */
export async function startService(client: CoolifyClient, args: { serviceId: string }): Promise<string> {
  await client.startService(args.serviceId);
  return `Service ${args.serviceId} started.`;
}

/**
 * Stop a service
 */
export async function stopService(client: CoolifyClient, args: { serviceId: string }): Promise<string> {
  await client.stopService(args.serviceId);
  return `Service ${args.serviceId} stopped.`;
}

/**
 * Get server info
 */
export async function getServerInfo(client: CoolifyClient, args: z.infer<typeof GetServerInfoSchema>): Promise<string> {
  const info = await client.getServerInfo();

  const lines = [
    `# Server Information`,
    `ID: ${info.id}`,
    `Name: ${info.name}`,
    `IP: ${info.ip}`,
    `OS: ${info.os}`,
    `Status: ${info.status}`,
    `CPU: ${info.cpu}`,
    `Memory: ${info.memory}`,
    `Disk: ${info.disk}`,
    `Created: ${info.createdAt}`,
  ];

  if (args.includeMetrics) {
    lines.push(`\n## Metrics`);
    lines.push(`CPU Usage: ${info.cpuUsage ?? 'N/A'}`);
    lines.push(`Memory Usage: ${info.memoryUsage ?? 'N/A'}`);
    lines.push(`Disk Usage: ${info.diskUsage ?? 'N/A'}`);
  }

  return lines.join('\n');
}

export async function getProjectLogs(client: CoolifyClient, args: z.infer<typeof GetProjectLogsSchema>): Promise<string> {
  const logs = await client.getProjectLogs(args.projectId, { tail: args.tail, lines: args.lines });

  if (logs.logs.length === 0) {
    return 'No logs available for this project.';
  }

  const formattedLogs = logs.logs.map((log: any) => 
    `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}`
  ).join('\n');

  return `## Project Logs\n\n\`\`\`\n${formattedLogs}\n\`\`\``;
}

export async function healthCheck(client: CoolifyClient, args: z.infer<typeof HealthCheckSchema>): Promise<string> {
  const timeout = args.timeout ?? 30000;
  const isHealthy = await client.healthCheck(timeout);
  return isHealthy 
    ? '✅ Coolify server is healthy and accessible'
    : '❌ Coolify server is not responding. Please check if it\'s running.';
}