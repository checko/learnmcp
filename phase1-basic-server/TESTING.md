# Testing Guide for Phase 1 MCP Server

This guide provides multiple ways to test your calculator MCP server. All methods are designed to verify that your server correctly implements the MCP protocol and calculator functionality.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Method 1: MCP Inspector (Recommended)](#method-1-mcp-inspector-recommended)
- [Method 2: Manual Testing with stdio](#method-2-manual-testing-with-stdio)
- [Method 3: Integration with Claude Desktop](#method-3-integration-with-claude-desktop)
- [Method 4: Test Client Script](#method-4-test-client-script)
- [Method 5: Unit Tests](#method-5-unit-tests)
- [Method 6: Testing with Other LLMs](#method-6-testing-with-other-llms)
  - [Ollama Integration](#ollama-integration)
  - [Codex CLI Integration](#codex-cli-integration)
  - [Gemini CLI Integration](#gemini-cli-integration)
  - [Cursor Agents Integration](#cursor-agents-integration)
- [Troubleshooting](#troubleshooting)
- [Quick Test Commands](#quick-test-commands)

## Prerequisites

Before testing, ensure your project is set up correctly:

```bash
# Navigate to Phase 1 directory
cd phase1-basic-server

# Install dependencies
npm install

# Build the project
npm run build

# Run unit tests to verify functionality
npm test
```

## Method 1: MCP Inspector (Recommended)

The MCP Inspector is the official interactive testing tool for MCP servers.

### Installation

```bash
npm install -g @modelcontextprotocol/inspector
```

### Testing Steps

1. **Start your server in development mode:**
   ```bash
   npm run dev
   ```

2. **In another terminal, launch the inspector:**
   ```bash
   mcp-inspector
   ```

3. **Test in the browser:**
   - Inspector opens at `http://localhost:5173`
   - You should see your "calculator" tool listed
   - Click on tools to make interactive calls

### Example Tool Calls

**Addition:**
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

**Multiplication:**
```json
{
  "operation": "multiply",
  "a": 6,
  "b": 7
}
```

**Division:**
```json
{
  "operation": "divide",
  "a": 144,
  "b": 12
}
```

## Method 2: Manual Testing with stdio

Test your server directly through stdin/stdout communication.

### Steps

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, send MCP messages:**

**Initialize the connection:**
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}
```

**List available tools:**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

**Test calculator operations:**

*Addition:*
```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"calculator","arguments":{"operation":"add","a":15,"b":27}}}
```

*Subtraction:*
```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"calculator","arguments":{"operation":"subtract","a":50,"b":23}}}
```

*Multiplication:*
```json
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"calculator","arguments":{"operation":"multiply","a":8,"b":9}}}
```

*Division:*
```json
{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"calculator","arguments":{"operation":"divide","a":100,"b":5}}}
```

### Expected Responses

**Successful calculation:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Result: 42"
      }
    ]
  }
}
```

**Error (division by zero):**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "error": {
    "code": -32602,
    "message": "Calculator error: Division by zero is not allowed"
  }
}
```

## Method 3: Integration with Claude Desktop

Test your server by integrating it with Claude Desktop for natural language interaction.

### Configuration

**1. Install Claude Desktop:**
Download from [https://claude.ai/download](https://claude.ai/download)

**2. Find your config file location:**

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

**3. Edit the config file:**

```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["/full/path/to/your/learnmcp/phase1-basic-server/dist/index.js"],
      "cwd": "/full/path/to/your/learnmcp/phase1-basic-server"
    }
  }
}
```

**⚠️ Important:** Replace `/full/path/to/your/learnmcp` with your actual absolute path.

**4. Restart Claude Desktop**

### Usage

Once configured, you can ask Claude to perform calculations naturally:

```
Calculate 15 + 27 for me
What is 8 times 9?
Divide 144 by 12
Subtract 50 from 100
```

## Method 4: Test Client Script

Use a Node.js script to programmatically test your server.

### Create Test Script

Create `test-client.js` in the project root:

```javascript
const { spawn } = require('child_process');

const server = spawn('node', ['dist/index.js'], {
  cwd: './phase1-basic-server',
  stdio: ['pipe', 'pipe', 'inherit']
});

let messageId = 1;

// Send initialize message
const initMessage = {
  jsonrpc: "2.0",
  id: messageId++,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};

server.stdin.write(JSON.stringify(initMessage) + '\n');

// Listen for responses
server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString().trim());
});

// Test calculator after initialization
setTimeout(() => {
  const calcMessage = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "tools/call",
    params: {
      name: "calculator",
      arguments: { operation: "add", a: 10, b: 20 }
    }
  };

  server.stdin.write(JSON.stringify(calcMessage) + '\n');
}, 1000);

// Test error case
setTimeout(() => {
  const errorMessage = {
    jsonrpc: "2.0",
    id: messageId++,
    method: "tools/call",
    params: {
      name: "calculator",
      arguments: { operation: "divide", a: 10, b: 0 }
    }
  };

  server.stdin.write(JSON.stringify(errorMessage) + '\n');
}, 2000);

// Clean exit
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 4000);
```

### Run the Test

```bash
node test-client.js
```

### Expected Output

```
Server response: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":false}},"serverInfo":{"name":"mcp-basic-calculator","version":"1.0.0"}}}
Server response: {"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"Result: 30"}]}}
Server response: {"jsonrpc":"2.0","id":3,"error":{"code":-32602,"message":"Calculator error: Division by zero is not allowed"}}
```

## Method 5: Unit Tests

Your project includes comprehensive unit tests for the calculator logic.

### Run Tests

```bash
npm test
```

### Expected Output

```
PASS src/tools/calculator.test.ts
Calculator Tool
  ✓ addition works correctly (1 ms)
  ✓ subtraction works correctly (1 ms)
  ✓ multiplication works correctly
  ✓ division works correctly
  ✓ division by zero throws error (3 ms)
  ✓ unknown operation throws error

Test Suites: 1 passed, 1 total
Tests: 6 passed, 6 total
```

### Test Coverage

The tests verify:
- ✅ Basic arithmetic operations (add, subtract, multiply, divide)
- ✅ Negative numbers and zero handling
- ✅ Error handling for division by zero
- ✅ Error handling for invalid operations
- ✅ Input validation

## Method 6: Testing with Other LLMs

Test your MCP server with various LLM tools and platforms beyond Claude Desktop.

### Ollama Integration

Ollama supports MCP server integration for local LLM testing.

#### Installation

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (e.g., Llama 2)
ollama pull llama2
```

#### Configuration

Create or edit Ollama's MCP configuration file:

**Location:** `~/.ollama/mcp.json` (create if it doesn't exist)

```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["/full/path/to/your/learnmcp/phase1-basic-server/dist/index.js"],
      "cwd": "/full/path/to/your/learnmcp/phase1-basic-server"
    }
  }
}
```

#### Usage

```bash
# Start Ollama with MCP integration
ollama serve --mcp-config ~/.ollama/mcp.json

# In another terminal, test with natural language
ollama run llama2
# Then ask: "Calculate 15 times 8"
```

#### Example Session

```
>>> Calculate 15 times 8
The calculator tool shows that 15 × 8 = 120.

>>> What is 144 divided by 12?
Using the calculator tool, 144 ÷ 12 = 12.
```

### Codex CLI Integration

Codex CLI provides command-line access to OpenAI's Codex model with MCP support.

#### Installation

```bash
npm install -g codex-cli
```

#### Configuration

Set environment variables for Codex CLI:

```bash
export CODEX_API_KEY="your-openai-api-key"
export CODEX_MCP_SERVERS='{"calculator":{"command":"node","args":["/full/path/to/your/learnmcp/phase1-basic-server/dist/index.js"],"cwd":"/full/path/to/your/learnmcp/phase1-basic-server"}}'
```

#### Usage

```bash
# Interactive mode
codex-cli --mcp

# Then ask questions like:
# "What is 25 plus 17?"
# "Calculate 9 times 7"
```

#### Example Commands

```bash
# Direct calculation
codex-cli "Calculate 15 + 27" --mcp

# Interactive session
codex-cli --interactive --mcp
```

### Gemini CLI Integration

Google's Gemini CLI tool with MCP server support.

#### Installation

```bash
# Install Gemini CLI (if available)
npm install -g gemini-cli
# OR use gcloud CLI
gcloud components install gemini-cli
```

#### Configuration

Create a Gemini CLI configuration file:

**Location:** `~/.config/gemini/config.json`

```json
{
  "mcp": {
    "servers": {
      "calculator": {
        "command": "node",
        "args": ["/full/path/to/your/learnmcp/phase1-basic-server/dist/index.js"],
        "cwd": "/full/path/to/your/learnmcp/phase1-basic-server"
      }
    }
  },
  "api_key": "your-gemini-api-key"
}
```

#### Usage

```bash
# Test with natural language
gemini-cli "What is 18 times 12?"

# Interactive mode
gemini-cli --interactive
```

#### Example Interactions

```
$ gemini-cli "Calculate 45 divided by 9"
Using the calculator tool, 45 ÷ 9 = 5.

$ gemini-cli "What is 7 squared?"
7² = 49 (calculated using the calculator tool).
```

### Cursor Agents Integration

Cursor's built-in agent system with MCP server integration.

#### Configuration

**1. Open Cursor Settings:**
- Go to `Cursor Settings` → `Agents` → `MCP Servers`

**2. Add your server:**
```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["/full/path/to/your/learnmcp/phase1-basic-server/dist/index.js"],
      "cwd": "/full/path/to/your/learnmcp/phase1-basic-server"
    }
  }
}
```

**3. Alternative: Edit config file directly**

**Location:** `~/Library/Application Support/Cursor/mcp.json` (macOS)

```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["/full/path/to/your/learnmcp/phase1-basic-server/dist/index.js"],
      "cwd": "/full/path/to/your/learnmcp/phase1-basic-server"
    }
  }
}
```

#### Usage

**1. Open Cursor**
**2. Use Cursor's Composer or Chat**
**3. Ask calculation questions:**

```
Calculate 23 + 47
What is 156 divided by 12?
Multiply 13 by 9
```

**4. Use Cursor Agents:**
- Open the agents panel
- Select your calculator agent
- Ask for calculations

#### Advanced Cursor Features

```javascript
// Use in Cursor's code editor
// Ask: "Calculate the factorial of 5"
// The agent will use your calculator tool for computations
```

### General MCP Integration Tips

#### For All LLM Tools

**1. Path Configuration:**
Always use absolute paths in configuration files:
```json
{
  "command": "node",
  "args": ["/full/absolute/path/to/dist/index.js"],
  "cwd": "/full/absolute/path/to/phase1-basic-server"
}
```

**2. Verify Server Startup:**
```bash
# Test that your server starts correctly
cd /path/to/phase1-basic-server
npm run build
timeout 5 npm start
```

**3. Check Tool Discovery:**
Most MCP-compatible tools will automatically discover your tools after configuration. If not, look for:
- Server logs for connection errors
- Tool listing commands
- Configuration validation

#### Environment Variables

Some tools support MCP configuration via environment variables:

```bash
export MCP_SERVERS='{"calculator":{"command":"node","args":["/path/to/dist/index.js"],"cwd":"/path/to/phase1-basic-server"}}'
```

#### Testing Script for Multiple LLMs

Create a comprehensive test script:

```bash
#!/bin/bash
# test-mcp-llms.sh

echo "Testing MCP Server with multiple LLMs..."

# Build server
cd phase1-basic-server
npm run build

# Test 1: MCP Inspector
echo "=== Testing MCP Inspector ==="
npm run dev &
SERVER_PID=$!
sleep 2
curl -X POST http://localhost:5173/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"calculator","arguments":{"operation":"add","a":10,"b":5}}'
kill $SERVER_PID

# Test 2: Unit Tests
echo "=== Running Unit Tests ==="
npm test

echo "=== MCP Server testing complete ==="
```

#### Common Issues Across LLMs

**Server Won't Connect:**
- Verify absolute paths in config
- Check file permissions
- Ensure Node.js is in PATH

**Tools Not Discovered:**
- Restart the LLM application
- Check server logs for errors
- Verify JSON configuration syntax

**Authentication Issues:**
- Ensure API keys are set correctly
- Check rate limits
- Verify account permissions

**Performance Problems:**
- Monitor server resource usage
- Check for memory leaks
- Optimize tool response times

## Troubleshooting

### Server Won't Start

**Symptoms:** Server exits immediately or shows errors

**Solutions:**
- Ensure dependencies are installed: `npm install`
- Build the project: `npm run build`
- Check Node.js version: `node --version` (requires v18+)
- Verify you're in the correct directory: `pwd`

### Inspector Connection Fails

**Symptoms:** Inspector can't connect to server

**Solutions:**
- Start the server first: `npm run dev`
- Check if port 5173 is available (inspector's default port)
- Verify the server is running: `ps aux | grep node`
- Try a different port: `mcp-inspector --port 5174`

### Tool Calls Fail

**Symptoms:** Tool calls return errors or unexpected results

**Solutions:**
- Verify exact argument names match the schema
- Check server logs for detailed error messages
- Ensure arguments are valid numbers
- Test with unit tests first: `npm test`

### Claude Desktop Integration Issues

**Symptoms:** Claude doesn't recognize the calculator tool

**Solutions:**
- Double-check the absolute path in `claude_desktop_config.json`
- Ensure `dist/index.js` exists: `ls -la dist/`
- Restart Claude Desktop completely
- Check Claude Desktop logs for connection errors

### Build Errors

**Symptoms:** TypeScript compilation fails

**Solutions:**
- Clean and rebuild: `npm run clean && npm run build`
- Check for syntax errors in source files
- Verify MCP SDK version compatibility
- Update dependencies: `npm update`

## Quick Test Commands

### Fast Verification
```bash
cd phase1-basic-server
npm run build && npm test && echo "✅ Build and tests passed!"
```

### Full Integration Test
```bash
cd phase1-basic-server
npm run build
npm test
npm run dev &
sleep 2
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | head -1
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"calculator","arguments":{"operation":"multiply","a":6,"b":7}}}' | head -1
kill %1
```

### Development Workflow
```bash
# Watch mode for development
npm run dev

# Run tests in watch mode
npm test -- --watch

# Lint and format (if you add these later)
npm run lint
npm run format
```

## Performance Testing

### Load Testing
```bash
# Simple load test with multiple calculations
for i in {1..10}; do
  echo "{\"jsonrpc\":\"2.0\",\"id\":$i,\"method\":\"tools/call\",\"params\":{\"name\":\"calculator\",\"arguments\":{\"operation\":\"add\",\"a\":$i,\"b\":$((i+1))}}}"
  sleep 0.1
done | npm run dev
```

## Contributing to Testing

When adding new features:

1. **Add unit tests** for new functionality
2. **Update this guide** with new test methods
3. **Test all methods** (inspector, manual, Claude integration)
4. **Document edge cases** and error conditions

## Next Steps

After successfully testing Phase 1:

- **Phase 2:** Add resources and prompts
- **Phase 3:** Integrate with external APIs
- **Phase 4:** Advanced features and deployment

## Support

If you encounter issues:

1. Check the [MCP Specification](https://modelcontextprotocol.io/specification)
2. Review the [MCP SDK Documentation](https://modelcontextprotocol.io/sdk)
3. Check existing [GitHub Issues](https://github.com/modelcontextprotocol/examples/issues)
4. Ask in the [MCP Discord Community](https://discord.gg/mcp)

---

**🎯 Pro Tip:** Start with Method 1 (MCP Inspector) for the most intuitive testing experience, then try Method 3 (Claude Desktop) to see your server in action with natural language!