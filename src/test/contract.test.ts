import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { KEYS, LANGUAGES, VENTILATION } from "../server.js";

// The tool's inputs must match the published contract of the Domera backend endpoint
// (contract/obligations.json, kept in step with the backend by its own test).
const contract = JSON.parse(readFileSync(new URL("../../contract/obligations.json", import.meta.url), "utf8"));

test("tool inputs match the backend contract", () => {
  assert.deepEqual([...KEYS].sort(), contract.query.lastDoneKeys);
  assert.deepEqual([...VENTILATION], contract.query.ventilation);
  assert.deepEqual([...LANGUAGES], contract.query.lang);
});
