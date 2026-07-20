'use strict';
const FORMULA_VERSION = 'rgb-calibration-v1';
const RANGE = Object.freeze({ HIGH: 'high', LOW: 'low' });
function selectRange(b, requestedRange = 'auto') { return requestedRange === RANGE.HIGH || requestedRange === RANGE.LOW ? requestedRange : (b <= 10 ? RANGE.HIGH : RANGE.LOW); }
function calculateHighRangeCOD(r, g, b) {
  const [x1, x2, x3] = [-1713.2, 2280.8, 115.94]; const [x4, x5, x6] = [13.719, -23.992, -52.244]; const [x7, x8, x9] = [-0.048843, 0.11181, 7.6064]; const [x10, x11, x12] = [6.4492e-5, -0.00019355, -0.36434];
  return x1 * r + x2 * g + x3 * b + x4 * r ** 2 + x5 * g ** 2 + x6 * b ** 2 + x7 * r ** 3 + x8 * g ** 3 + x9 * b ** 3 + x10 * r ** 4 + x11 * g ** 4 + x12 * b ** 4;
}
function calculateLowRangeCOD(r, g, b) {
  const [x1, x2, x3] = [-271.75, -934.75, 2.3451]; const [x4, x5, x6] = [1.3166, 4.8288, -0.009684]; const [x7, x8, x9] = [-0.0021305, -0.0082982, 3.012e-5];
  return 78948 + x1 * r + x2 * g + x3 * b + x4 * r ** 2 + x5 * g ** 2 + x6 * b ** 2 + x7 * r ** 3 + x8 * g ** 3 + x9 * b ** 3;
}
function calculateCOD({ r, g, b, range = 'auto' }) { const selectedRange = selectRange(b, range); const value = selectedRange === RANGE.HIGH ? calculateHighRangeCOD(r, g, b) : calculateLowRangeCOD(r, g, b); return { cod: Number(value.toFixed(5)), range: selectedRange, formulaVersion: FORMULA_VERSION }; }
function calculateAverage(values, range) {
  const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; const threshold = range === RANGE.HIGH ? 30 : 5; const acceptedValues = values.filter((value) => Math.abs(value - median) <= threshold); const average = acceptedValues.reduce((sum, value) => sum + value, 0) / acceptedValues.length;
  return { average: Number(average.toFixed(5)), median: Number(median.toFixed(5)), threshold, acceptedValues, rejectedCount: values.length - acceptedValues.length };
}
module.exports = { RANGE, FORMULA_VERSION, calculateCOD, calculateAverage };
