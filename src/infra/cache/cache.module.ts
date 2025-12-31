import { Module } from "@nestjs/common";
import { RedisManager } from "./redis-cache-manager";

@Module({
  providers: [
    { provide: 'REDIS_CACHE', useClass: RedisManager },
  ],
  exports: ['REDIS_CACHE'],
})
export class CacheModule { }