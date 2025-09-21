#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { calculatorTool, executeCalculator } from "./tools/calculator";

/**
 * Basic MCP Server with Calculator Tool
 * This is Phase 1 of the MCP learning project
 */
class CalculatorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-basic-calculator",
        version: "1.0.0",
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [calculatorTool],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "calculator":
          try {
            const result = executeCalculator(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: `Result: ${result}`,
                },
              ],
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Calculator error: ${error instanceof Error ? error.message : String(error)}`
            );
          }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Server Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Calculator server running on stdio");
  }
}

// Start the server
const server = new CalculatorServer();
server.start().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});