'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createServer } = require('../src/app');
async function withServer(run) { const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'cod-service-')); const server = createServer({ dataDirectory }); await new Promise((resolve) => server.listen(0, resolve)); const { port } = server.address(); try { await run(`http://127.0.0.1:${port}`); } finally { await new Promise((resolve) => server.close(resolve)); await fs.rm(dataDirectory, { recursive: true, force: true }); } }
test('calculates COD and selects a range automatically', async () => { await withServer(async (baseUrl) => { const response = await fetch(`${baseUrl}/api/v1/cod/calculate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ r: 1, g: 2, b: 11, range: 'auto' }) }); const result = await response.json(); assert.equal(response.status, 200); assert.equal(result.data.range, 'low'); assert.equal(result.data.formulaVersion, 'rgb-calibration-v1'); }); });
test('rejects invalid RGB values', async () => { await withServer(async (baseUrl) => { const response = await fetch(`${baseUrl}/api/v1/cod/calculate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ r: 256, g: 2, b: 3 }) }); assert.equal(response.status, 400); }); });
test('stores and retrieves a measurement', async () => { await withServer(async (baseUrl) => { const created = await fetch(`${baseUrl}/api/v1/measurements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ r: 1, g: 2, b: 3, range: 'high' }) }); assert.equal(created.status, 201); const listed = await fetch(`${baseUrl}/api/v1/measurements`); const result = await listed.json(); assert.equal(result.data.length, 1); assert.equal(result.data[0].range, 'high'); }); });
