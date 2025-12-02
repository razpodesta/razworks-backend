// Imports limpios (Sin 'Result' si no se usa)
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

@Injectable()
export class SemanticCacheService {
  private readonly logger = new Logger(SemanticCacheService.name);
  private readonly redis: Redis;
  private readonly TTL_SECONDS = 86400;

  constructor() {
    this.redis = Redis.fromEnv();
  }
  // ... resto del archivo igual ...
  // Asegúrate de borrar "import { Result }..." si no se usa en el cuerpo.
  // Si se usa en retrieve, mantenerlo. El error decía que no se usaba.

  private generateKey(prompt: string, binaryData?: Buffer): string {
    const hash = createHash('sha256');
    hash.update(prompt);
    if (binaryData) hash.update(binaryData);
    return `ai:cache:${hash.digest('hex')}`;
  }

  async retrieve(prompt: string, binaryData?: Buffer): Promise<string | null> {
    try {
      const key = this.generateKey(prompt, binaryData);
      const cached = await this.redis.get<string>(key);
      if (cached) {
        this.logger.debug(`⚡ Cache Hit: ${key.substring(0, 8)}...`);
        return cached;
      }
      return null;
    } catch (error) {
      this.logger.warn('Redis Cache retrieval failed', error);
      return null;
    }
  }

  async store(prompt: string, response: string, binaryData?: Buffer): Promise<void> {
    try {
      const key = this.generateKey(prompt, binaryData);
      await this.redis.set(key, response, { ex: this.TTL_SECONDS });
    } catch (error) {
      this.logger.warn('Redis Cache write failed', error);
    }
  }
}
