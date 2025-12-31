import { Redis as RedisClient } from "ioredis";

export class RedisManager {

  private client: RedisClient;

  constructor() {
    this.client = new RedisClient({
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      reconnectOnError: (err) => {
        console.error("Redis error:", err);
        return true;
      },
    });

    this.client.on("connect", () => console.info("Redis connected"));
    this.client.on("reconnecting", () => console.warn("Redis reconnecting..."));
    this.client.on("error", (err) => console.error("Redis error:", err));
    this.client.on("close", () => console.warn("Redis connection closed"));
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Error fetching key "${key}":`, error);
      return null;
    }
  }

  async set(key: string, value: string) {
    try {
      const ttl = Number(process.env.REDIS_TTL);
      await this.client.set(key, value, "EX", ttl, "NX");
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
    }
  }

  async del(key: string) {
    const stream = this.client.scanStream({ match: key });
    const keys = [];
    
    for await (const chunk of stream) {
      keys.push(...chunk);
    }
  
    if (keys.length) {
      await this.client.del(...keys);
    }
  }

  connect(): RedisClient {
    return this.client;
  }

  close(): void {
    this.client.disconnect();
  }
  
}

let redisManager: RedisManager = null;

export function getCacheManager(): RedisManager {
  if (!redisManager) {
    redisManager = new RedisManager();
  }
  return redisManager;
}