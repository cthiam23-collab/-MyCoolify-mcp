/**
 * Tool implementations and schemas exported from a single module
 */

// Export functions as tool handlers for the server
export {
  listProjects as ListProjectsTool,
  getProject as GetProjectTool,
  createProject as CreateProjectTool,
  deployProject as DeployProjectTool,
  startProject as StartProjectTool,
  stopProject as StopProjectTool,
  restartProject as RestartProjectTool,
  scaleProject as ScaleProjectTool,
  deleteProject as DeleteProjectTool,
  listDatabases as ListDatabasesTool,
  getDatabase as GetDatabaseTool,
  deleteDatabase as DeleteDatabaseTool,
  listServices as ListServicesTool,
  getService as GetServiceTool,
  startService as StartServiceTool,
  stopService as StopServiceTool,
  getServerInfo as GetServerInfoTool,
  getProjectLogs as GetProjectLogsTool,
  healthCheck as HealthCheckTool,
} from '../tools.js';

// Export raw functions for direct use
export {
  listProjects,
  getProject,
  createProject,
  deployProject,
  startProject,
  stopProject,
  restartProject,
  scaleProject,
  deleteProject,
  listDatabases,
  getDatabase,
  deleteDatabase,
  listServices,
  getService,
  startService,
  stopService,
  getServerInfo,
  getProjectLogs,
  healthCheck,
} from '../tools.js';

// Export schemas for validation
export {
  ListProjectsSchema,
  GetProjectSchema,
  CreateProjectSchema,
  DeployProjectSchema,
  ListDatabasesSchema,
  GetDatabaseSchema,
  DeleteDatabaseSchema,
  ListServicesSchema,
  GetServiceSchema,
  GetServerInfoSchema,
  GetProjectLogsSchema,
  HealthCheckSchema,
} from '../tools.js';