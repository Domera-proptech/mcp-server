import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const API = process.env.DOMERA_API_BASE ?? "https://domera.se";
const KEYS = ["OVK", "ENERGY_DECLARATION", "ELEVATOR_INSPECTION", "RADON", "LEGIONELLA", "FIRE_SAFETY"] as const;
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD").optional();

export function buildQuery(args: {
  ventilation?: string; has_lift?: boolean; language?: string; last_done?: Partial<Record<(typeof KEYS)[number], string>>;
}): string {
  const q = new URLSearchParams();
  if (args.ventilation) q.set("ventilation", args.ventilation);
  if (args.has_lift !== undefined) q.set("lift", String(args.has_lift));
  if (args.language) q.set("lang", args.language);
  for (const k of KEYS) if (args.last_done?.[k]) q.set(`last_${k}`, args.last_done[k]!);
  return q.toString();
}

export function createServer(fetchImpl: typeof fetch = fetch): McpServer {
  const server = new McpServer({ name: "domera", version: "0.1.0" });
  server.registerTool(
    "swedish_building_obligations",
    {
      title: "Swedish building inspections and compliance calendar",
      description:
        "Lists the inspections a Swedish apartment building or commercial property must or should have (OVK ventilation check, energy declaration, lift inspection, radon, legionella, fire safety), with interval, legal basis, who may perform it and, when last-done dates are given, whether each is done, due soon or overdue. Free, no account. General information, not legal advice.",
      inputSchema: {
        ventilation: z.enum(["FT_FTX", "F_FX_S"]).optional().describe("FT_FTX = mechanical supply and exhaust (3-year OVK); F_FX_S = exhaust only or natural draught (6-year OVK)."),
        has_lift: z.boolean().optional().describe("Does the building have a lift?"),
        language: z.enum(["en", "sv", "es"]).optional(),
        last_done: z.object(Object.fromEntries(KEYS.map((k) => [k, date])) as Record<(typeof KEYS)[number], typeof date>).partial().optional()
          .describe("Date of the last completed check per obligation, YYYY-MM-DD."),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args) => {
      const res = await fetchImpl(`${API}/api/public/obligations?${buildQuery(args)}`, { headers: { accept: "application/json" } });
      if (!res.ok) return { isError: true, content: [{ type: "text", text: `Domera API answered ${res.status}.` }] };
      return { content: [{ type: "text", text: JSON.stringify(await res.json(), null, 2) }] };
    }
  );
  return server;
}
