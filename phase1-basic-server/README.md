# Phase 1: Basic MCP Server

This is the first phase of the MCP learning project - a basic MCP server that provides a calculator tool for arithmetic operations.

## What You'll Learn

- Setting up a basic MCP server with TypeScript
- Creating and registering tools
- Handling tool calls and responses
- Error handling in MCP servers
- Testing MCP tools

## Project Structure

```
phase1-basic-server/
├── src/
│   ├── index.ts                 # Main MCP server entry point
│   └── tools/
│       ├── calculator.ts        # Calculator tool implementation
│       └── calculator.test.ts   # Unit tests for calculator
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Features

### Calculator Tool

The server provides a single `calculator` tool that supports:
- **Addition**: `add` two numbers
- **Subtraction**: `subtract` second number from first
- **Multiplication**: `multiply` two numbers
- **Division**: `divide` first number by second

**Tool Schema:**
```json
{
  "name": "calculator",
  "description": "Perform basic arithmetic operations: add, subtract, multiply, divide",
  "inputSchema": {
    "type": "object",
    "properties": {
      "operation": {
        "type": "string",
        "enum": ["add", "subtract", "multiply", "divide"]
      },
      "a": {
        "type": "number",
        "description": "First number"
      },
      "b": {
        "type": "number",
        "description": "Second number"
      }
    },
    "required": ["operation", "a", "b"]
  }
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Navigate to the phase1 directory
cd phase1-basic-server

# Install dependencies
npm install
```

### Building

```bash
# Build the TypeScript code
npm run build
```

### Running the Server

```bash
# Start the server
npm start

# Or run in development mode (with ts-node)
npm run dev
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Testing with MCP Inspector

To test your MCP server with the MCP Inspector:

1. Install MCP Inspector globally:
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. Start your server in one terminal:
   ```bash
   npm run dev
   ```

3. In another terminal, run the inspector:
   ```bash
   mcp-inspector
   ```

4. The inspector will open in your browser where you can:
   - See available tools
   - Test tool calls
   - View responses

## Example Usage

### Tool Call Example

```json
{
  "method": "tools/call",
  "params": {
    "name": "calculator",
    "arguments": {
      "operation": "add",
      "a": 10,
      "b": 5
    }
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Result: 15"
    }
  ]
}
```

## Error Handling

The server handles several error cases:

- **Division by zero**: Returns an error when attempting to divide by zero
- **Invalid operation**: Returns an error for unknown operations
- **Invalid parameters**: Validates input according to the tool schema

## Code Overview

### Server Setup (`src/index.ts`)

The main server file:
- Creates an MCP Server instance
- Registers the calculator tool
- Sets up request handlers for listing and calling tools
- Handles errors and graceful shutdown

### Calculator Tool (`src/tools/calculator.ts`)

Contains:
- Tool definition with schema
- Execution logic for arithmetic operations
- Input validation and error handling

### Tests (`src/tools/calculator.test.ts`)

Comprehensive unit tests covering:
- All arithmetic operations
- Edge cases (negative numbers, zero)
- Error conditions (division by zero, invalid operations)

## Next Steps

Once you've mastered this basic server:

1. **Phase 2**: Add resources and prompts to your server
2. **Phase 3**: Integrate with real APIs
3. **Phase 4**: Implement advanced features like authentication

## Key Concepts Learned

- **MCP Server Architecture**: How to structure an MCP server
- **Tool Definition**: Creating tools with schemas and descriptions
- **Request Handling**: Processing tool calls and returning responses
- **Error Handling**: Proper error responses in MCP
- **Testing**: Unit testing MCP tools
- **Transport Layer**: Using stdio transport for communication

## Troubleshooting

### Common Issues

1. **Server won't start**: Check that all dependencies are installed with `npm install`
2. **Build errors**: Ensure TypeScript is properly configured, try `npm run clean && npm run build`
3. **Inspector connection fails**: Make sure the server is running before starting the inspector

### Debug Mode

Run the server with debug logging:
```bash
DEBUG=* npm run dev
```

## Resources

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP SDK Documentation](https://modelcontextprotocol.io/sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)