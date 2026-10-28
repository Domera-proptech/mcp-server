import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, buildQuery } from "../server.js";

test("buildQuery maps arguments to the public endpoint", () => {
  assert.equal(buildQuery({ ventilation: "FT_FTX", has_lift: false, last_done: { OVK: "2024-05-01" } }), "ventilation=FT_FTX&lift=false&last_OVK=2024-05-01");
});

test("tool is listed read-only and calls the API", async () => {
  let url = "";
  const fake = (async (u: string) => { url = u; return new Response(JSON.stringify({ obligations: [] }), { status: 200 }); }) as unknown as typeof fetch;
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer(fake).connect(a);
  const client = new Client({ name: "t", version: "0" });
  await client.connect(b);
  const tools = await client.listTools();
  assert.equal(tools.tools[0].name, "swedish_building_obligations");
  assert.equal(tools.tools[0].annotations?.readOnlyHint, true);
  const r = await client.callTool({ name: "swedish_building_obligations", arguments: { has_lift: true, language: "en" } });
  assert.match(url, /\/api\/public\/obligations\?lift=true&lang=en$/);
  assert.equal(r.isError, undefined);
});
