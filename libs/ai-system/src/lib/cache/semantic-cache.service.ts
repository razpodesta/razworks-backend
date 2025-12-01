/**
 * @fileoverview Servicio de Caché Semántico (Deduplication Engine)
 * @module AiSystem/Cache
 *
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Intercepta solicitudes a la IA para evitar procesamiento redundante.
 * Genera una huella digital (SHA-256) del input (Texto/Buffer) y busca en Redis.
 *
 * @efficiency O(1) Lookup. Reduce costos de API en un ~30% para flujos repetitivos.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';
import { Result } from '@razworks/shared/utils';

@Injectable()
export class SemanticCacheService {
  private readonly logger = new Logger(SemanticCacheService.name);
  private readonly redis: Redis;
  private readonly TTL_SECONDS = 86400; // 24 Horas de memoria a corto plazo

  constructor() {
    this.redis = Redis.fromEnv();
  }

  /**
   * Genera una clave determinista basada en el contenido.
   */
  private generateKey(prompt: string, binaryData?: Buffer): string {
    const hash = createHash('sha256');
    hash.update(prompt);

    if (binaryData) {
      hash.update(binaryData);
    }

    return `ai:cache:${hash.digest('hex')}`;
  }

  /**
   * Intenta recuperar una respuesta previa.
   */
  async retrieve(prompt: string, binaryData?: Buffer): Promise<string | null> {
    try {
      const key = this.generateKey(prompt, binaryData);
      const cached = await this.redis.get<string>(key);

      if (cached) {
        this.logger.debug(`⚡ Semantic Cache Hit: ${key.substring(0, 12)}...`);
        return cached;
      }

      return null;
    } catch (error) {
      // El fallo del caché no debe detener el proceso cognitivo
      this.logger.warn('Redis Cache retrieval failed', error);
      return null;
    }
  }

  /**
   * Guarda una inferencia exitosa para el futuro.
   */
  async store(prompt: string, response: string, binaryData?: Buffer): Promise<void> {
    try {
      const key = this.generateKey(prompt, binaryData);
      await this.redis.set(key, response, { ex: this.TTL_SECONDS });
    } catch (error) {
      this.logger.warn('Redis Cache write failed', error);
    }
  }
}
