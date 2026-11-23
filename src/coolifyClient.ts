/**
 * Coolify API Client
 * Handles all communication with the Coolify API
 */

import axios, { AxiosInstance } from 'axios';
import {
  CoolifyProject,
  CoolifyDatabase,
  CoolifyService,
  CoolifyResource,
  CoolifyServerInfo,
  CoolifyLogsResponse,
  ListProjectsOptions,
  CreateProjectOptions,
  ListDatabasesOptions,
  ListServicesOptions,
  GetLogsOptions,
} from './types.js';

export class CoolifyClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private apiVersion: string;

  constructor(baseUrl: string, apiKey: string, apiVersion: string = 'v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/${this.apiVersion}`,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid Coolify API key. Please check your COOLIFY_API_KEY.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. Check your API permissions.');
        }
        if (error.response?.status === 404) {
          throw new Error('Resource not found on Coolify server.');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Coolify server may be overloaded.');
        }
        if (!error.response) {
          throw new Error('Cannot connect to Coolify server. Check if it\'s running.');
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ Health Check ============
  async healthCheck(timeout: number = 30000): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // ============ Projects ============
  async listProjects(options: ListProjectsOptions = {}): Promise<CoolifyProject[]> {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));

    const response = await this.client.get<CoolifyProject[]>(`/projects?${params.toString()}`);
    return response.data;
  }

  async getProject(projectId: string): Promise<CoolifyProject> {
    const response = await this.client.get<CoolifyProject>(`/projects/${projectId}`);
    return response.data;
  }

  async createProject(data: CreateProjectOptions): Promise<CoolifyProject> {
    const response = await this.client.post<CoolifyProject>('/projects', data);
    return response.data;
  }

  async updateProject(projectId: string, data: Partial<CoolifyProject>): Promise<CoolifyProject> {
    const response = await this.client.patch<CoolifyProject>(`/projects/${projectId}`, data);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/projects/${projectId}`);
  }

  async deployProject(
    projectId: string,
    options: { branch?: string; tag?: string; message?: string } = {}
  ): Promise<void> {
    await this.client.post(`/projects/${projectId}/deploy`, options);
  }

  async startProject(projectId: string): Promise<void> {
    await this.client.post(`/projects/${projectId}/start`);
  }

  async stopProject(projectId: string): Promise<void> {
    await this.client.post(`/projects/${projectId}/stop`);
  }

  async restartProject(projectId: string): Promise<void> {
    await this.client.post(`/projects/${projectId}/restart`);
  }

  async scaleProject(
    projectId: string,
    options: { replicas?: number; cpu?: number; memory?: string } = {}
  ): Promise<void> {
    await this.client.post(`/projects/${projectId}/scale`, options);
  }

  // ============ Databases ============
  async listDatabases(options: ListDatabasesOptions = {}): Promise<CoolifyDatabase[]> {
    const params = new URLSearchParams();
    if (options.type) params.append('type', options.type);
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));

    const response = await this.client.get<CoolifyDatabase[]>(`/databases?${params.toString()}`);
    return response.data;
  }

  async getDatabase(databaseId: string): Promise<CoolifyDatabase> {
    const response = await this.client.get<CoolifyDatabase>(`/databases/${databaseId}`);
    return response.data;
  }

  async createDatabase(data: Omit<CoolifyDatabase, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'host' | 'port'>): Promise<CoolifyDatabase> {
    const response = await this.client.post<CoolifyDatabase>('/databases', data);
    return response.data;
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    await this.client.delete(`/databases/${databaseId}`);
  }

  // ============ Services ============
  async listServices(options: ListServicesOptions = {}): Promise<CoolifyService[]> {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));

    const response = await this.client.get<CoolifyService[]>(`/services?${params.toString()}`);
    return response.data;
  }

  async getService(serviceId: string): Promise<CoolifyService> {
    const response = await this.client.get<CoolifyService>(`/services/${serviceId}`);
    return response.data;
  }

  async startService(serviceId: string): Promise<void> {
    await this.client.post(`/services/${serviceId}/start`);
  }

  async stopService(serviceId: string): Promise<void> {
    await this.client.post(`/services/${serviceId}/stop`);
  }

  // ============ Server Info ============
  async getServerInfo(): Promise<CoolifyServerInfo> {
    const response = await this.client.get<CoolifyServerInfo>('/server');
    return response.data;
  }

  // ============ Logs ============
  async getProjectLogs(projectId: string, options: GetLogsOptions = {}): Promise<CoolifyLogsResponse> {
    const params = new URLSearchParams();
    if (options.tail) params.append('tail', String(options.tail));
    if (options.lines) params.append('lines', String(options.lines));

    const response = await this.client.get<CoolifyLogsResponse>(`/projects/${projectId}/logs?${params.toString()}`);
    return response.data;
  }

  async getDatabaseLogs(databaseId: string, options: GetLogsOptions = {}): Promise<CoolifyLogsResponse> {
    const params = new URLSearchParams();
    if (options.tail) params.append('tail', String(options.tail));
    if (options.lines) params.append('lines', String(options.lines));

    const response = await this.client.get<CoolifyLogsResponse>(`/databases/${databaseId}/logs?${params.toString()}`);
    return response.data;
  }

  // ============ Resources ============
  async listResources(): Promise<CoolifyResource[]> {
    const projects = await this.listProjects();
    const databases = await this.listDatabases();
    const services = await this.listServices();

    return [
      ...projects.map((p) => ({
        type: 'project' as const,
        id: p.id,
        name: p.name,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      ...databases.map((d) => ({
        type: 'database' as const,
        id: d.id,
        name: d.name,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
      ...services.map((s) => ({
        type: 'service' as const,
        id: s.id,
        name: s.name,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    ];
  }
}