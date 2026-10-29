# Domera MCP server

Free, read-only MCP server that tells an AI assistant which inspections a **Swedish residential or commercial building** must or should have, how often, on what legal basis, who may perform them, and (given last-done dates) what is overdue.

Covers: OVK ventilation inspection, energy declaration, lift inspection, radon, legionella and fire-safety follow-up. Answers in English, Swedish or Spanish. No account, no API key, nothing stored.

Built by [Domera](https://domera.se), property management and bookkeeping software for Swedish landlords and housing co-operatives (BRF).

## Use

Remote (Streamable HTTP): `https://mcp.domera.se/mcp`

Claude Desktop / any stdio client:

```json
{ "mcpServers": { "domera": { "command": "npx", "args": ["-y", "@domera/mcp-server"] } } }
```

## Tool

`swedish_building_obligations` with optional `ventilation` (`FT_FTX` | `F_FX_S`), `has_lift`, `language` and `last_done` (a date per obligation).

General information, not legal advice. Always check the current regulations.

## What this repository is

A thin client over a public endpoint (`/api/public/obligations`). It contains no Domera application code. MIT licensed.

## Contact

hej@domera.se · https://domera.se

See also: [swedish-property-data](https://github.com/Domera-proptech/swedish-property-data), open data and helpers for Swedish rent (KPI, reference rate, statutory figures), and Domera's [free calculators](https://domera.se/verktyg) (in Swedish).
