import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule, Params } from 'nestjs-pino';
import { IncomingMessage } from 'node:http';
import { PerformanceInterceptor } from './performance.interceptor';

// FIX: Acceso seguro a variable de entorno con índice string
const isProduction = process.env['NODE_ENV'] === 'production';

// Definimos la interfaz del Request extendida por Pino
interface PinoRequest extends IncomingMessage {
  id: string | number;
}

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (): Params => {
        // SAFETY: Definimos la configuración base.
        // TypeScript estricto se queja de 'transport' en la interfaz Params de nestjs-pino actual.
        // Usamos un objeto intermedio tipado como Record<string, unknown> para construir la config
        // y luego lo asignamos, lo cual es seguro en runtime porque pino lo soporta.

        const pinoConfig: Record<string, unknown> = {
          // Seguridad: Sanitización de datos sensibles
          redact: ['req.headers.authorization', 'req.body.password', 'req.body.creditCard'],

          // Nivel de log
          level: isProduction ? 'info' : 'debug',

          // Serializadores tipados
          serializers: {
            req: (req: unknown) => {
              const r = req as PinoRequest;
              return {
                id: r.id,
                method: r.method,
                url: r.url,
              };
            },
          },
        };

        // Inyección condicional del transporte (pino-pretty)
        if (!isProduction) {
          pinoConfig['transport'] = {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          };
        }

        return {
          // SAFETY: Casting final a la interfaz esperada por el módulo.
          // Esto evita el error TS2353 sin usar 'any'.
          pinoHttp: pinoConfig as Params['pinoHttp'],
        };
      },
    }),
  ],
  providers: [PerformanceInterceptor],
  exports: [PinoLoggerModule, PerformanceInterceptor],
})
export class LoggingModule {}
