const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'runtime-config.json');

const DEFAULT_CONFIG = {
  duplicateSimilarityThreshold: 0.78
};

async function ensureConfigFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(CONFIG_FILE);
  } catch {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
  }
}

async function readRuntimeConfig() {
  await ensureConfigFile();
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

async function writeRuntimeConfig(patch) {
  const current = await readRuntimeConfig();
  const next = { ...current, ...patch };
  await fs.writeFile(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

module.exports = {
  readRuntimeConfig,
  writeRuntimeConfig,
  DEFAULT_CONFIG
};
