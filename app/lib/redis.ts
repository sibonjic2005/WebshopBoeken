import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createClient() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");
  return new Redis(url);
}

let _redis: Redis | undefined;

export function getRedis() {
  if (!_redis) {
    _redis = globalThis.__redis ?? createClient();
    if (process.env.NODE_ENV !== "production") globalThis.__redis = _redis;
  }
  return _redis;
}

export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    return getRedis()[prop as keyof Redis];
  },
});
