/**
 * @fileoverview Proveedor de Pub/Sub con Redis (IOredis)
 * @module Notifications/Infra
 * @description
 * Instancia Singleton para el bus de eventos en tiempo real.
 * Maneja la reconexión automática y la separación de clientes Publisher/Subscriber.
 */
import { Global, Module, Provider, Logger } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis, RedisOptions } from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

const pubSubProvider: Provider = {
  provide: PUB_SUB,
  useFactory: () => {
    const logger = new Logger('RedisPubSub');
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

    if (!redisUrl) {
      throw new Error('FATAL: REDIS_URL is missing. Real-time notifications cannot start.');
    }

    // Configuración optimizada para mantener conexiones vivas en la nube
    const options: RedisOptions = {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      keepAlive: 10000,
      family: 4, // Forzar IPv4
      reconnectOnError: (err) => {
        logger.warn(`Redis connection error: ${err.message}`);
        return true;
      }
    };

    // RedisPubSub requiere dos clientes distintos: uno para publicar, otro para escuchar.
    return new RedisPubSub({
      publisher: new Redis(redisUrl, options),
      subscriber: new Redis(redisUrl, options),
    });
  },
};

@Global()
@Module({
  providers: [pubSubProvider],
  exports: [pubSubProvider],
})
export class PubSubModule {}
