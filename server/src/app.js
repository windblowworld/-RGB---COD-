'use strict';
const http = require('node:http');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { calculateCOD, calculateAverage } = require('./algorithm');
const { ValidationError, validateCalculation, validateAverage } = require('./validation');
const { createMeasurementStore } = require('./storage');
function sendJson(response, statusCode, payload) { response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); response.end(JSON.stringify(payload)); }
function readJson(request) {
  return new Promise((resolve, reject) => { let body = ''; request.setEncoding('utf8'); request.on('data', (chunk) => { body += chunk; if (body.length > 1024 * 1024) { reject(new ValidationError('Request body is too large')); request.destroy(); } }); request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new ValidationError('Request body must be valid JSON')); } }); request.on('error', reject); });
}
function createServer({ dataDirectory = path.join(__dirname, '..', 'data') } = {}) {
  const store = createMeasurementStore(dataDirectory);
  return http.createServer(async (request, response) => {
    try {
      if (request.method === 'OPTIONS') return sendJson(response, 204, {});
      if (request.method === 'GET' && request.url === '/health') return sendJson(response, 200, { status: 'ok' });
      if (request.method === 'POST' && request.url === '/api/v1/cod/calculate') return sendJson(response, 200, { data: calculateCOD(validateCalculation(await readJson(request))) });
      if (request.method === 'POST' && request.url === '/api/v1/cod/average') { const input = validateAverage(await readJson(request)); return sendJson(response, 200, { data: calculateAverage(input.values, input.range) }); }
      if (request.method === 'POST' && request.url === '/api/v1/measurements') { const input = validateCalculation(await readJson(request)); const calculation = calculateCOD(input); const record = await store.save({ id: randomUUID(), createdAt: new Date().toISOString(), input, ...calculation }); return sendJson(response, 201, { data: record }); }
      if (request.method === 'GET' && request.url.startsWith('/api/v1/measurements')) return sendJson(response, 200, { data: await store.list() });
      return sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Route not found' } });
    } catch (error) { const statusCode = error instanceof ValidationError ? 400 : 500; if (statusCode === 500) console.error(error); return sendJson(response, statusCode, { error: { code: statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message: error.message } }); }
  });
}
if (require.main === module) { const port = Number(process.env.PORT || 3000); createServer().listen(port, () => console.log(`COD service listening on port ${port}`)); }
module.exports = { createServer };
