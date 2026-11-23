# Available Skills

## mcp-server-builder
Build production-ready MCP servers for any platform/service by following established patterns.

### When to use
Use this skill when building MCP (Model Context Protocol) servers to integrate external services with AI assistants like Claude, ChatGPT, Cursor, etc.

### Prerequisites
- Node.js >= 20.0.0
- Understanding of the target platform's API
- npm or package manager

### Steps

#### 1. Research the Platform API
- Find official API documentation
- Identify key endpoints (list, get, create, update, delete operations)
- Understand authentication requirements
- Note rate limits and error handling patterns

#### 2. Set Up Project Structure
```
my-mcp-server/
├── src/
│   ├── coolifyClient.ts     # API client implementation
│   ├── types.ts            # TypeScript types/interfaces
│   ├── tools.ts            # Tool implementations
│   ├── tools/index.ts      # Tool exports
│   └── server.ts           # MCP server setup
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
└── Dockerfile
```

#### 3. Configure package.json
```json
{
  "name": "my-platform-mcp-server",
  "version": "1.0.0",
  "main": "dist/server.js",
  "bin": { "my-platform-mcp-server": "./dist/server.js" },
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "axios": "^1.6.0",
    "dotenv": "^16.0.0",
    "zod": "^3.21.4"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.2.0",
    "ts-node": "^10.9.0"
  }
}
```

#### 4. Configure TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### 5. Create Environment Template (.env.example)
```bash
# API Configuration
API_KEY=your_api_key_here
API_URL=https://api.myplatform.com/v1
```

#### 6. Implement API Client
Follow the pattern from our Coolify implementation:
- Create authenticated HTTP client (axios)
- Implement CRUD operations
- Handle errors gracefully
- Return consistent response format

#### 7. Define Types and Schemas
- Create TypeScript interfaces for API responses
- Use Zod schemas for parameter validation
- Follow single responsibility principle per tool

#### 8. Implement Tools
Each tool needs:
- A Zod schema for input validation
- An async function handler
- Clear error messages

Tool naming convention: `coolify_list_projects`, `hermes_list_agents`, etc.

#### 9. Set Up MCP Server (server.ts)
- Import all tool handlers
- Configure stdio transport
- Handle tool/list and tool/call requests
- Follow MCP SDK v0.4.0+ API signature

#### 10. Build and Test
```bash
npm run build
npm test
```

### IDE Integration Configuration
Add MCP configuration for each IDE:

#### Claude Desktop
```json
{
  "mcpServers": {
    "my-platform": {
      "command": "npx",
      "args": ["my-platform-mcp-server"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

#### Similar IDEs: Cursor, Windsurf, Cline, Replit, VS Code, JetBrains, Zed, Opencode, Zcode

### Key Patterns from Coolify MCP Server
1. **Export naming**: Use `ToolName` suffix for handlers in index.ts
2. **Direct re-export**: Use `export { func as ToolName } from '../tools.js'` for bundler compatibility
3. **Schema organization**: Keep schemas in tools.ts for single-file tool definition
4. **Environment variables**: Always use `${ENV_VAR:-default}` pattern for optional values

### Testing Strategy
- Test API client with mock responses
- Test tool handlers with sample data
- Test schema validation edge cases
- Verify MCP protocol compliance

### Deployment
- Build with `npm run build`
- Run with `node dist/server.js`
- Package with Docker for containerized deployment
- Publish to npm registry for easy installation

---

## coolify-ide-integration
Direct IDE integration for Coolify without MCP protocol - provides immediate access to Coolify management from any AI-assistant-enabled IDE.

### When to use
Use this skill when you want direct Coolify integration in IDEs without the MCP protocol overhead, or when MCP is not available/configured.

### Benefits
- **No MCP server required** - Direct API integration
- **Instant deployment** - No build/publish cycle
- **Lower latency** - Direct HTTP calls
- **Offline mode** - Can work with local Coolify instances
- **Custom workflows** - Tailor actions to specific IDE capabilities

### Implementation Approaches

#### Option A: IDE-Specific Scripts/Commands
Each IDE has its own way to execute commands:

**Claude Desktop:**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "coolify-direct": {
      "command": "bash",
      "args": ["-c", "curl -X GET 'http://localhost:3000/api/project' -H 'Authorization: Bearer $COOLIFY_API_KEY'"],
      "env": { "COOLIFY_API_KEY": "..." }
    }
  }
}
```

**Cursor:**
Use `.cursor/mcp.json` with curl commands or Node scripts

**VS Code:**
Use tasks.json with shell commands:
```json
{
  "label": "coolify:list-projects",
  "type": "shell",
  "command": "curl",
  "args": ["-X", "GET", "http://localhost:3000/api/project", "-H", "Authorization: Bearer ${env:COOLIFY_API_KEY}"]
}
```

**JetBrains:**
Use External Tools in Settings:
- Program: `curl`
- Arguments: `-X GET http://localhost:3000/api/project -H "Authorization: Bearer $COOLIFY_API_KEY"`

**Replit:**
Create a `.replit` file with coolify commands:
```bash
run = "node coolify-cli.js list-projects"
[env]
COOLIFY_API_KEY = "..."
```

#### Option B: Lightweight CLI Tool
Create a simple Node.js CLI that IDEs can call directly:

```javascript
#!/usr/bin/env node
// coolify-cli.js
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const args = process.argv.slice(2);
const [command, ...rest] = args;

const config = {
  apiKey: process.env.COOLIFY_API_KEY,
  baseUrl: process.env.COOLIFY_API_URL || 'http://localhost:3000'
};

async function listProjects() {
  const response = await fetch(`${config.baseUrl}/api/project`, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });
  const projects = await response.json();
  console.log(JSON.stringify(projects, null, 2));
}

// Register command handlers
const commands = { listProjects, listDatabases, listServices };
if (commands[command]) {
  commands[command](...rest);
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}