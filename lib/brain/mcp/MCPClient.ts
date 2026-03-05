import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class MCPClient {
  private client: Client;

  constructor(serverCommand: string, serverArgs: string[]) {
    const transport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs,
    });
    this.client = new Client(
      { name: "GameBrain-MCP", version: "1.0.0" },
      { capabilities: {} }
    );
    this.client.connect(transport);
  }

  async callTool(toolName: string, args: any) {
    return await this.client.callTool({
      name: toolName,
      arguments: args,
    });
  }
}
