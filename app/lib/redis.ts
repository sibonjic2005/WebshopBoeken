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

export const redis = globalThis.__redis ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis.__redis = redis;
