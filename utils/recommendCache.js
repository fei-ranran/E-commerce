const memStore = new Map();
const DEFAULT_TTL_SEC = 600;
const MAX_MEM_ENTRIES = 800;

let redisClient = null;
let redisLoadAttempted = false;

function getRedisClient() {
  if (redisLoadAttempted) return redisClient;
  redisLoadAttempted = true;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true
    });
    redisClient.on('error', () => {});
  } catch {
    redisClient = null;
  }
  return redisClient;
}

function pruneMemIfNeeded() {
  if (memStore.size <= MAX_MEM_ENTRIES) return;
  const drop = memStore.size - Math.floor(MAX_MEM_ENTRIES * 0.85);
  const keys = memStore.keys();
  for (let i = 0; i < drop; i++) {
    const k = keys.next();
    if (k.done) break;
    memStore.delete(k.value);
  }
}

async function cacheGet(key) {
  const redis = getRedisClient();
  if (redis) {
    try {
      if (redis.status === 'wait') await redis.connect();
      const v = await redis.get(key);
      if (v != null) return v;
    } catch {
      /* fall back to memory */
    }
  }
  const entry = memStore.get(key);
  if (!entry || entry.exp < Date.now()) {
    memStore.delete(key);
    return null;
  }
  return entry.val;
}

async function cacheSet(key, val, ttlSec = DEFAULT_TTL_SEC) {
  const redis = getRedisClient();
  if (redis) {
    try {
      if (redis.status === 'wait') await redis.connect();
      await redis.set(key, val, 'EX', ttlSec);
      return;
    } catch {
      /* fall back to memory */
    }
  }
  pruneMemIfNeeded();
  memStore.set(key, { val, exp: Date.now() + ttlSec * 1000 });
}

async function getJson(key) {
  const raw = await cacheGet(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function setJson(key, obj, ttlSec) {
  await cacheSet(key, JSON.stringify(obj), ttlSec);
}

module.exports = {
  cacheGet,
  cacheSet,
  getJson,
  setJson,
  DEFAULT_TTL_SEC
};
