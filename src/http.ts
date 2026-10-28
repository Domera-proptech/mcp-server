import { createServer as createHttp } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

// Stateless Streamable HTTP: a fresh server and transport per request, nothing stored, no conversation logging.
createHttp(async (req, res) => {
  if (req.url === "/health") { res.writeHead(200).end("ok"); return; }
  if (req.url !== "/mcp") { res.writeHead(404).end(); return; }
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { void transport.close(); void server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res);
}).listen(Number(process.env.PORT ?? 8787));
