/**
 * @fileoverview Módulo de Logging (Fortress Edition)
 * @description Configuración centralizada de Pino con soporte Multi-Stream.
 */
import { Module, DynamicModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule, Params } from 'nestjs-pino';
import { IncomingMessage } from 'node:http';
import { PerformanceInterceptor } from './performance.interceptor';
import pino from 'pino';

const isProduction = process.env['NODE_ENV'] === 'production';

interface PinoRequest extends IncomingMessage {
  id: string | number;
}

@Module({
  providers: [PerformanceInterceptor],
  exports: [PinoLoggerModule, PerformanceInterceptor],
})
export class LoggingModule {
  /**
   * Configuración asíncrona que permite inyectar streams personalizados.
   * @param extraStream Stream opcional para persistencia (ej: AuditDbStream)
   */
  static forRoot(extraStream?: pino.DestinationStream): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        PinoLoggerModule.forRootAsync({
          useFactory: (): Params => {
            // 1. Configuración Base
            const baseConfig = {
              redact: ['req.headers.authorization', 'req.body.password', 'req.body.creditCard'],
              level: isProduction ? 'info' : 'debug',
              serializers: {
                req: (req: unknown) => {
                  const r = req as PinoRequest;
                  return { id: r.id, method: r.method, url: r.url };
                },
              },
            };

            // 2. Configuración de Streams (Multi-Destination)
            const streams: pino.StreamEntry[] = [
              // Siempre escribimos a stdout (para Render/Vercel logs nativos)
              { stream: process.stdout },
            ];

            // Si nos pasan el stream de auditoría, lo agregamos
            if (extraStream) {
              streams.push({ stream: extraStream });
            }

            // Nota: En producción real, 'pino-pretty' no se recomienda por performance,
            // pero si se usa, debe ser un stream separado. Aquí usamos multistream puro.

            return {
              pinoHttp: {
                ...baseConfig,
                // @ts-expect-error - multistream es compatible aunque los tipos de nestjs-pino sean estrictos
                stream: pino.multistream(streams),
              },
            };
          },
        }),
      ],
    };
  }
}
