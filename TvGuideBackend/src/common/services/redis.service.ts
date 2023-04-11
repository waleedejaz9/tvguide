import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  
  async setUrlCache(key: string, value: any, ttl: number): Promise<void> {
    await this.cache.set(key, value);
  }
  
  async getUrlCache(key: string): Promise<any> {
    return await this.cache.get(key);
  }
}