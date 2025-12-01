/**
 * @fileoverview Proveedor de Pub/Sub con Redis
 * @module Notifications/Infra
 * @description
 * Puente de comunicación asíncrona para WebSockets.
 * Utiliza instancias separadas para publicar y suscribir (requisito de Redis).
 */
import { Global, Module, Provider } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

const pubSubProvider: Provider = {
  provide: PUB_SUB,
  useFactory: () => {
    // Detectar si estamos usando Upstash (HTTP) o Redis TCP estándar.
    // Para Subscriptions, necesitamos conexión TCP persistente.
    // Si usas Upstash, asegúrate de usar la URL con puerto 6379 (no la REST API).
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

    if (!redisUrl) {
      throw new Error('FATAL: REDIS_URL missing for Notification PubSub');
    }

    const options = {
      // Configuración de reintento agresiva para mantener el socket vivo
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    };

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
