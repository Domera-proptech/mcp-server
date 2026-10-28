import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "./server.js";

type Env = { LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> } };

const MAX_BODY_BYTES = 16 * 1024;

// Cloudflare Worker entry: the same stateless Streamable HTTP server as http.ts, on the web-standard transport.
// A fresh server and transport per request, nothing stored, no conversation logging.
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname === "/health") return new Response("ok");
    if (pathname !== "/mcp") return new Response(null, { status: 404 });
    // Stateless: no server-initiated stream and no session to end, so only POST is served.
    if (req.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST" } });
    // A tool call is a few hundred bytes; anything large is not a client we serve.
    if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return new Response(null, { status: 413 });
    // Anonymous tool, so abuse control is a per-IP rate limit (the IP is only the limiter key, never stored or logged).
    const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
    if (env.LIMITER && !(await env.LIMITER.limit({ key: ip })).success) {
      return new Response("Rate limit exceeded, try again in a minute.", { status: 429, headers: { "retry-after": "60" } });
    }
    const server = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    return transport.handleRequest(req);
  },
};
