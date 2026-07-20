'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function createMeasurementStore(dataDirectory) {
  const filePath = path.join(dataDirectory, 'measurements.json');
  let writeQueue = Promise.resolve();

  async function readAll() {
    try {
      return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  function save(record) {
    writeQueue = writeQueue.then(async () => {
      await fs.mkdir(dataDirectory, { recursive: true });
      const records = await readAll();
      records.push(record);
      const tempPath = `${filePath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(records, null, 2), 'utf8');
      await fs.rename(tempPath, filePath);
      return record;
    });
    return writeQueue;
  }

  async function list(limit = 20) {
    return (await readAll()).slice(-limit).reverse();
  }

  return { save, list };
}

module.exports = { createMeasurementStore };
