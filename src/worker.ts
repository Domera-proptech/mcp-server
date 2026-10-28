import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "./server.js";

// Cloudflare Worker entry: the same stateless Streamable HTTP server as http.ts, on the web-standard transport.
// A fresh server and transport per request, nothing stored, no conversation logging.
export default {
  async fetch(req: Request): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname === "/health") return new Response("ok");
    if (pathname !== "/mcp") return new Response(null, { status: 404 });
    // Stateless: no server-initiated stream and no session to end, so only POST is served.
    if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
    const server = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    return transport.handleRequest(req);
  },
};
