'use strict';
const { RANGE } = require('./algorithm');
class ValidationError extends Error {}
function numberInRange(value, name, min, max) { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new ValidationError(`${name} must be a finite number between ${min} and ${max}`); return value; }
function validateCalculation(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('Request body must be a JSON object');
  const range = body.range || 'auto'; if (!['auto', RANGE.HIGH, RANGE.LOW].includes(range)) throw new ValidationError('range must be auto, high, or low');
  return { r: numberInRange(body.r, 'r', 0, 255), g: numberInRange(body.g, 'g', 0, 255), b: numberInRange(body.b, 'b', 0, 255), range };
}
function validateAverage(body) {
  if (!body || !Array.isArray(body.values) || body.values.length === 0 || body.values.length > 10) throw new ValidationError('values must contain 1 to 10 numbers');
  if (![RANGE.HIGH, RANGE.LOW].includes(body.range)) throw new ValidationError('range must be high or low');
  return { range: body.range, values: body.values.map((value, index) => numberInRange(value, `values[${index}]`, -1000000, 1000000)) };
}
module.exports = { ValidationError, validateCalculation, validateAverage };
