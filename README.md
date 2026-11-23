# Coolify MCP Server

A Model Context Protocol (MCP) server for managing Coolify deployments. This server provides tools for managing projects, databases, and services through the MCP protocol, enabling AI assistants like Claude, ChatGPT, and others to interact with Coolify.

## 🚀 Features

- **Project Management**: List, create, deploy, start, stop, restart, scale, and delete projects
- **Database Management**: List, get, and delete databases
- **Service Management**: List, start, stop, and manage services
- **Server Info**: Retrieve Coolify server information and health status
- **Logs**: Retrieve project and database logs

## 📋 Installation

### Option 1: npm install (Recommended)

```bash
npm install -g coolify-mcp-server
```

### Option 2: Download Release

Download the latest release from the [releases page](https://github.com/cthiam23-collab/coolify-mcp-server/releases).

### Option 3: From Source

```bash
git clone https://github.com/cthiam23-collab/coolify-mcp-server.git
cd coolify-mcp-server
npm install
npm run build
npm link  # Global installation
```

### Option 4: Docker

```bash
docker run -d \
  -e COOLIFY_API_KEY=\${COOLIFY_API_KEY} \
  -e COOLIFY_API_URL=http://host.docker.internal:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name coolify-mcp \
  ghcr.io/coolify/coolify-mcp-server:latest
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file or set the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `COOLIFY_API_KEY` | ✅ Yes | - | Your Coolify API key (get from Dashboard → Settings → API Keys) |
| `COOLIFY_API_URL` | ❌ No | `http://localhost:3000` | Coolify server URL |
| `COOLIFY_API_VERSION` | ❌ No | `v1` | API version |
| `REQUEST_TIMEOUT` | ❌ No | `30000` | Request timeout in milliseconds |
| `LOG_LEVEL` | ❌ No | `info` | Log level (debug, info, warn, error) |
| `CHARACTER_LIMIT` | ❌ No | `10000` | Response truncation limit |

### Getting Your Coolify API Key

1. Log into your Coolify dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate New Key**
4. Copy the API key and set it in your `.env` file

## 💻 Alternative: Direct CLI Integration

For simpler setups without MCP protocol overhead, you can use the `coolify-cli` tool directly. This approach provides immediate API access via shell commands in any IDE.

### Installation

After installing the package, you can use the CLI directly:

```bash
npm install -g coolify-mcp-server
coolify-cli projects:list
```

### Available CLI Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `projects:list` | List all projects | `--search`, `--page`, `--limit` |
| `projects:get <id>` | Get project details | Project UUID |
| `projects:create` | Create a new project | `--name`, `--git`, `--branch`, `--compose`, `--env-json` |
| `projects:deploy <id>` | Deploy a project | `--branch`, `--tag`, `--message` |
| `projects:start <id>` | Start a project | Project UUID |
| `projects:stop <id>` | Stop a project | Project UUID |
| `projects:restart <id>` | Restart a project | Project UUID |
| `projects:scale <id>` | Scale project resources | Project UUID, `--replicas`, `--cpu`, `--memory` |
| `projects:delete <id>` | Delete a project | Project UUID |
| `databases:list` | List all databases | `--type`, `--search`, `--page`, `--limit` |
| `databases:get <id>` | Get database details | Database UUID |
| `databases:delete <id>` | Delete a database | Database UUID |
| `services:list` | List all services | `--search`, `--page`, `--limit` |
| `services:get <id>` | Get service details | Service UUID |
| `services:start <id>` | Start a service | Service UUID |
| `services:stop <id>` | Stop a service | Service UUID |
| `server:info` | Get server information | None |
| `logs:get <id>` | Get project logs | Project UUID, `--tail`, `--lines` |
| `health:check` | Check server health | None |

### Setting Environment Variables

```bash
export COOLIFY_API_KEY="your-api-key-here"
export COOLIFY_API_URL="http://localhost:3000"
```

### IDE Integration Examples

**VS Code (Tasks):**
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "coolify:list-projects",
      "type": "shell",
      "command": "coolify-cli",
      "args": ["projects:list"],
      "problemMatcher": []
    }
  ]
}
```

**JetBrains (External Tools):**
- Program: `coolify-cli`
- Arguments: `projects:list`
- Working directory: `$ProjectFileDir$`

**Cursor:**
Use `.cursor/settings.json` to define CLI aliases or scripts:
```json
{
  "shellIntegration": {
    "aliases": {
      "coolify-projects": "coolify-cli projects:list"
    }
  }
}
```

### When to Use Direct CLI vs MCP

| Use Case | Recommended Approach |
|----------|-------------|
| Quick project status checks | Direct CLI |
| Automated deployment scripts | Direct CLI |
| AI assistant tool integration | MCP Server |
| Multi-tool orchestration | MCP Server |
| Simple monitoring | Direct CLI |

## 🖥️ IDE and Agent Desktop App Integration

### Claude Desktop (Official MCP Support)

Create or edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["-y", "coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

Or use the built binary (after global npm install):

**macOS:**
```json
{
  "mcpServers": {
    "coolify": {
      "command": "/usr/local/bin/coolify-mcp-server",
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

**Windows (PowerShell):**
```json
{
  "mcpServers": {
    "coolify": {
      "command": "C:\\Users\\%USERNAME%\\AppData\\Roaming\\npm\\coolify-mcp-server.cmd",
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### ChatGPT (Custom GPTs with Code Interpreter)

**Note:** ChatGPT doesn't have native MCP support. You'll need to use a bridge tool or custom integration. One approach is to use a local MCP-to-API bridge.

Alternatively, use the direct REST API:

```javascript
// Example usage with ChatGPT Code Interpreter
const coolify = require('coolify-mcp-server');

// Configure with your API key
process.env.COOLIFY_API_KEY = 'your-api-key-here';
process.env.COOLIFY_API_URL = 'http://your-coolify-server:3000';

// Use the server directly
const { listProjects } = require('coolify-mcp-server/dist/coolifyClient');
```

Or use the web interface at `http://your-coolify-server:3000` directly.

### Cursor

Create `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Windsurf

Create `.windsurfer/mcp.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Cline

Add to `.cline/settings.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Replit

Create a `.replit` file:

```yaml
run = "node_modules/.bin/coolify-mcp-server"

[env]
COOLIFY_API_KEY = "${COOLIFY_API_KEY}"
COOLIFY_API_URL = "${COOLIFY_API_URL:-http://localhost:3000}"

[[ports]]
port = 8888
```

### VS Code (with MCP Extension)

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### JetBrains IDEs

Create `mcp.json` in your project root:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Zed Editor

Create `.zed/mcp.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Opencode

Create `.opencode/mcp.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Zcode (Z.ai)

Zcode is an AI coding assistant from Z.ai. To configure MCP servers in Zcode:

1. Open Zcode
2. Go to Settings → MCP Servers
3. Add a new MCP server with the following configuration:

```json
{
  "name": "coolify",
  "command": "npx",
  "args": ["coolify-mcp-server"],
  "env": {
    "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
    "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
  }
}
```

Or create a `.zcode/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "npx",
      "args": ["coolify-mcp-server"],
      "env": {
        "COOLIFY_API_KEY": "${COOLIFY_API_KEY}",
        "COOLIFY_API_URL": "${COOLIFY_API_URL:-http://localhost:3000}"
      }
    }
  }
}
```

### Docker Compose (for containerized setups)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  coolify-mcp:
    image: ghcr.io/coolify/coolify-mcp-server:latest
    environment:
      - COOLIFY_API_KEY=${COOLIFY_API_KEY}
      - COOLIFY_API_URL=http://coolify:8000
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - coolify
```

## 🔧 Available Tools

### Project Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `coolify_list_projects` | List all projects | `search`, `page`, `limit` |
| `coolify_get_project` | Get project details | `project_id` |
| `coolify_create_project` | Create a new project | `name`, `git_repository`, `branch`, `docker compose file`, `environment`, etc. |
| `coolify_delete_project` | Delete a project | `project_id` |
| `coolify_deploy_project` | Deploy a project | `project_id`, `branch`, `tag`, `message` |
| `coolify_start_project` | Start a project | `project_id` |
| `coolify_stop_project` | Stop a project | `project_id` |
| `coolify_restart_project` | Restart a project | `project_id` |
| `coolify_scale_project` | Scale project resources | `project_id`, `replicas`, `cpu`, `memory` |

### Database Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `coolify_list_databases` | List all databases | `type`, `search`, `page`, `limit` |
| `coolify_get_database` | Get database details | `database_id` |
| `coolify_delete_database` | Delete a database | `database_id` |

### Service Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `coolify_list_services` | List all services | `search`, `page`, `limit` |
| `coolify_get_service` | Get service details | `service_id` |
| `coolify_start_service` | Start a service | `service_id` |
| `coolify_stop_service` | Stop a service | `service_id` |

### Server Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `coolify_get_server_info` | Get server information | None |
| `coolify_get_project_logs` | Get project logs | `project_id`, `tail`, `lines` |
| `coolify_health_check` | Check server health | None |

## 📊 Example Usage

### List Projects

```json
{
  "tool": "coolify_list_projects",
  "arguments": {
    "limit": 10
  }
}
```

### Deploy a Project

```json
{
  "tool": "coolify_deploy_project",
  "arguments": {
    "project_id": "project-uuid-here",
    "branch": "main",
    "message": "Deploy via MCP"
  }
}
```

### Get Project Logs

```json
{
  "tool": "coolify_get_project_logs",
  "arguments": {
    "project_id": "project-uuid-here",
    "tail": 50
  }
}
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/cthiam23-collab/coolify-mcp-server.git
cd coolify-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Start in development mode
npm run dev

# Run tests
npm test

# Format code
npm run format
```

## 🐳 Docker Build

```bash
# Build the image
docker build -t coolify-mcp-server:latest .

# Run the container
docker run -d \
  -e COOLIFY_API_KEY=your-api-key \
  -e COOLIFY_API_URL=http://coolify:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name coolify-mcp \
  coolify-mcp-server:latest
```

## 🔐 Security

- API key is required for all operations
- Store your API key securely (never commit `.env` files)
- Use environment variables in production
- Consider using Docker secrets for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Coolify](https://coolify.io) - Self-hosted PaaS platform
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification
- [Claude](https://claude.ai) - AI assistant that inspired this project