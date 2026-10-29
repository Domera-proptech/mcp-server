# Domera MCP server

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Glama](https://glama.ai/mcp/servers/Domera-proptech/mcp-server/badges/score.svg)](https://glama.ai/mcp/servers/Domera-proptech/mcp-server)

A read-only MCP server that tells an AI assistant which inspections a **Swedish residential or commercial building** must or should have, how often, on what legal basis, who may perform them, and (given last-done dates) what is overdue.

Covers the OVK ventilation inspection, energy declaration, lift inspection, radon, legionella and fire-safety follow-up. Answers in English, Swedish or Spanish. No account, no API key, nothing stored.

Built by [Domera](https://domera.se), property management and bookkeeping software for Swedish landlords and housing co-operatives (BRF). For landlords, property managers, BRF boards and real estate or proptech teams.

## Connect

Endpoint (Streamable HTTP, no authentication): `https://mcp.domera.se/mcp`

| Client | How |
|---|---|
| **Claude** (claude.ai, Desktop, mobile) | Search for "Domera" in Connectors (Customize, Connectors), or add a custom connector with the URL above |
| **ChatGPT** | Plugins, Add, Add custom MCP server, URL above, no authentication, then mention `@Domera` in a chat (a directory listing is in review) |
| **Claude Code** | `claude mcp add --transport http domera https://mcp.domera.se/mcp` |
| **Cursor, VS Code and other MCP clients** | `{ "mcpServers": { "domera": { "url": "https://mcp.domera.se/mcp" } } }` |
| **Official MCP Registry** | `io.github.Domera-proptech/mcp` |

## Try it

- "Which inspections does a 1974 apartment building in Gothenburg with a lift need?"
- "My OVK was done in May 2019 and the building has exhaust-only ventilation. Is it overdue?"
- "Who is allowed to perform a lift inspection in Sweden?"
- "Vilka kontroller behöver ett flerbostadshus utan hiss?"

## Tool

`swedish_building_obligations` (read-only, idempotent). Optional inputs:

| Input | Values |
|---|---|
| `ventilation` | `FT_FTX` (mechanical supply and exhaust, 3-year OVK) or `F_FX_S` (exhaust only or natural draught, 6-year OVK) |
| `has_lift` | `true` or `false` |
| `language` | `en`, `sv` or `es` |
| `last_done` | a `YYYY-MM-DD` date per obligation: `OVK`, `ENERGY_DECLARATION`, `ELEVATOR_INSPECTION`, `RADON`, `LEGIONELLA`, `FIRE_SAFETY` |

Each returned obligation has an interval, legal basis, who may perform it, a due date and a status (`done`, `dueSoon`, `overdue`, `unknown`). Rules without a confirmed statutory interval are labelled as recommendations. General information, not legal advice; always check the current regulations.

## Limits and privacy

- Read-only: no write actions, no account or customer data is reachable.
- Nothing is stored; no conversation data is collected.
- 60 requests per minute per IP, identical queries cached at the edge for 5 minutes.

## Run it yourself (stdio)

```bash
git clone https://github.com/Domera-proptech/mcp-server.git
cd mcp-server && npm ci && npm run build
node dist/stdio.js
```

## What this repository is

A thin client over a public endpoint (`/api/public/obligations`). It contains no Domera application code. The endpoint contract is pinned in `contract/obligations.json` and checked against production by CI. MIT licensed.

## Contact

hej@domera.se · https://domera.se

See also: [swedish-property-data](https://github.com/Domera-proptech/swedish-property-data), open data and helpers for Swedish rent (KPI, reference rate, statutory figures), and Domera's [free calculators](https://domera.se/verktyg) (in Swedish).
