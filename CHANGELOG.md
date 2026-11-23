# Changelog

All notable changes to the Coolify MCP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added
- Initial release of Coolify MCP Server
- Project management tools: list, get, create, deploy, start, stop, restart, scale, delete
- Database management tools: list, get, delete
- Service management tools: list, get, start, stop
- Server information retrieval tool
- Project logs retrieval tool
- Health check tool
- TypeScript support with strict type checking
- Environment variable configuration via dotenv
- Error handling with descriptive messages
- Graceful shutdown on SIGTERM/SIGINT
- Docker support
- Comprehensive README documentation

### Security
- API key-based authentication
- HTTPS support through environment variables
- Non-root Docker user by default