/**
 * Type definitions for Coolify MCP Server
 * Based on Coolify API v1
 */

export interface CoolifyProject {
  id: string;
  name: string;
  description?: string;
  subdomain?: string;
  domain?: string;
  status: 'running' | 'stopped' | 'error' | 'building' | 'pending';
  environment?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoolifyApplication extends CoolifyProject {
  gitRepository?: string;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
  dockerfile?: string;
  dockerCompose?: string;
  environmentVariables?: Record<string, string>;
  secrets?: Record<string, string>;
  labels?: Record<string, string>;
}

export interface CoolifyDatabase {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mariadb' | 'redis' | 'mongodb' | 'mongo' | 'cassandra' | 'elasticsearch' | 'memcached';
  host: string;
  port: number;
  username?: string;
  password?: string;
  database?: string;
  status: 'running' | 'stopped' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface CoolifyService {
  id: string;
  name: string;
  image: string;
  command?: string;
  ports?: number[];
  environment?: Record<string, string>;
  volumes?: Record<string, string>;
  status: 'running' | 'stopped' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface CoolifyServerInfo {
  id: string;
  name: string;
  ip: string;
  os: string;
  cpu: string;
  memory: string;
  disk: string;
  status: 'online' | 'offline' | 'error';
  createdAt: string;
  updatedAt: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
}

export interface CoolifyDeployRequest {
  projectId: string;
  branch?: string;
  tag?: string;
  message?: string;
}

export interface CoolifyScaleRequest {
  projectId: string;
  replicas?: number;
  cpu?: number;
  memory?: string;
}

export interface CoolifyLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

export interface CoolifyLogsResponse {
  logs: CoolifyLogEntry[];
  hasMore: boolean;
  nextPageToken?: string;
}

export interface CoolifyResource {
  type: 'project' | 'database' | 'service' | 'server';
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Input validation schemas
export interface ListProjectsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProjectOptions {
  name: string;
  description?: string;
  environment?: string;
  gitRepository?: string;
  buildCommand?: string;
  startCommand?: string;
}

export interface ListDatabasesOptions {
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListServicesOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetLogsOptions {
  tail?: number;
  lines?: number;
}