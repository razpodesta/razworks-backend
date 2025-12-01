/**
 * @fileoverview Repositorio de Memoria Neuronal (Optimized Edition)
 * @module AiSystem/Neural
 * @description
 * Persistencia en Redis con lectura eficiente.
 * CAMBIO: Ya no trae todo el historial. Trae solo la ventana relevante.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { Result } from '@razworks/shared/utils';

export interface NeuralMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NeuralRepository {
  private readonly redis: Redis;
  private readonly logger = new Logger(NeuralRepository.name);
  private readonly TTL_SECONDS = 86400 * 3; // 3 Días de retención
  // Límite duro de mensajes a recuperar para evitar OOM.
  // 30 mensajes suelen ser suficientes para ~8k tokens de contexto inmediato.
  private readonly FETCH_LIMIT = 30;

  constructor() {
    // Conexión Stateless (Serverless Friendly)
    this.redis = Redis.fromEnv();
  }

  /**
   * Recupera el historial crudo optimizado (Ventana Deslizante).
   * Solo trae los últimos N mensajes para ahorrar ancho de banda y memoria.
   */
  async getRawHistory(userId: string): Promise<Result<NeuralMessage[], Error>> {
    try {
      const key = this.getKey(userId);
      // OPTIMIZACIÓN: Solo traemos los últimos FETCH_LIMIT mensajes.
      // Redis almacena listas: 0 es el inicio (Left). Si usamos LPUSH, 0 es el más nuevo.
      const rawData = await this.redis.lrange<string>(key, 0, this.FETCH_LIMIT - 1);

      const history = rawData
        .map(item => JSON.parse(item) as NeuralMessage)
        .reverse(); // Redis devuelve [Nuevo -> Viejo]. Invertimos a [Viejo -> Nuevo] para el LLM.

      return Result.ok(history);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis Read Error [${userId}]: ${err.message}`);
      return Result.fail(new Error('Redis IO Failure'));
    }
  }

  /**
   * Persiste una nueva interacción atómicamente con Hard Cap.
   */
  async saveInteraction(userId: string, userMsg: NeuralMessage, aiMsg: NeuralMessage): Promise<Result<void, Error>> {
    try {
      const key = this.getKey(userId);
      const pipe = this.redis.pipeline();

      // Push atómico de ambos mensajes al inicio de la lista (LPUSH = Stack)
      pipe.lpush(key, JSON.stringify(userMsg));
      pipe.lpush(key, JSON.stringify(aiMsg));

      // Mantenimiento de higiene (Hard Limit físico en Redis)
      // Guardamos más de lo que leemos (100) para tener un buffer de auditoría,
      // pero evitamos crecimiento infinito.
      pipe.ltrim(key, 0, 99);

      // Renovación de sesión
      pipe.expire(key, this.TTL_SECONDS);

      await pipe.exec();
      return Result.ok(undefined);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis Write Error [${userId}]: ${err.message}`);
      return Result.fail(new Error('Redis Write Failure'));
    }
  }

  private getKey(userId: string): string {
    return `razworks:neural:ctx:${userId}`;
  }
}
