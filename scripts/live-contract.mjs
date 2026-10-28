// Calls the live backend and the live MCP endpoint and checks both against contract/obligations.json.
// Exits non-zero on any drift, so a scheduled workflow turns a silent backend change into a red run.
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const contract = JSON.parse(readFileSync(new URL("../contract/obligations.json", import.meta.url), "utf8"));
const api = process.env.DOMERA_API_BASE ?? "https://domera.se";
const mcp = process.env.DOMERA_MCP_URL ?? "https://mcp.domera.se/mcp";
const fail = (m) => { console.error("DRIFT:", m); process.exit(1); };
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

const res = await fetch(`${api}${contract.endpoint}?ventilation=FT_FTX&lift=true&lang=en&last_OVK=2019-05-01`);
if (!res.ok) fail(`backend answered ${res.status}`);
const body = await res.json();
if (!same(Object.keys(body), contract.response.topLevelKeys)) fail(`top-level keys ${Object.keys(body)}`);
for (const o of body.obligations) {
  if (!same(Object.keys(o), contract.response.obligationKeys)) fail(`obligation keys ${Object.keys(o)}`);
  if (!contract.response.status.includes(o.status)) fail(`status ${o.status}`);
  if (!contract.response.category.includes(o.category)) fail(`category ${o.category}`);
}

const client = new Client({ name: "domera-live-contract", version: "0.0.1" });
await client.connect(new StreamableHTTPClientTransport(new URL(mcp)));
const tools = (await client.listTools()).tools;
if (tools.length !== 1 || tools[0].name !== "swedish_building_obligations") fail(`tools ${tools.map((t) => t.name)}`);
if (tools[0].annotations?.readOnlyHint !== true) fail("tool is not marked read-only");
const out = await client.callTool({ name: "swedish_building_obligations", arguments: { ventilation: "FT_FTX", has_lift: true } });
if (out.isError) fail("tool call returned an error");
await client.close();
console.log("contract OK:", body.obligations.length, "obligations, 1 read-only tool");
