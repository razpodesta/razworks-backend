/**
 * @fileoverview Módulo Raíz del API Gateway (The Cortex Root)
 * @module API/Root
 * @author Raz Podestá & LIA Legacy
 * @copyright 2025 MetaShark Tech.
 *
 * @description
 * Orquestador Supremo del Backend.
 * Configura la inyección de dependencias global, conecta los Aparatos Soberanos (Modules)
 * y establece el Sistema Nervioso (BullMQ/Redis) para la arquitectura orientada a eventos.
 *
 * INTEGRACIONES CRÍTICAS:
 * 1. Vinculación del Puerto de Eventos del Core con el Adaptador de BullMQ.
 * 2. Inicialización del Córtex de IA.
 * 3. Configuración de Seguridad y Observabilidad.
 * 4. Activación del Worker de Eventos de Dominio (Oído del Sistema).
 */

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// --- PUERTOS DEL NÚCLEO (CORE) ---
import { EventDispatcherPort } from '@razworks/core';

// --- ADAPTADORES DE INFRAESTRUCTURA Y WORKERS ---
import { BullMqEventDispatcher } from './shared/adapters/bullmq-event.dispatcher';
import { DomainEventsWorker } from './shared/workers/domain-events.worker'; // ✅ EL OÍDO DEL SISTEMA

// --- INFRAESTRUCTURA TRANSVERSAL (LIBS) ---
import { LoggingModule, PerformanceInterceptor, AuditDbStream } from '@razworks/logging';
import { saveAuditLog } from './shared/audit-logger.factory';
import { SecurityModule } from './modules/security/security.module';
import { AiSystemModule } from '@razworks/ai'; // ✅ Córtex Cognitivo Global

// --- MÓDULOS DE DOMINIO (APPS) ---
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ToolboxModule } from './modules/toolbox/toolbox.module';

// --- MOTORES DE EVENTOS (LIBS) ---
import { WhatsAppEngineModule } from '@razworks/whatsapp-engine';
import { NotificationsModule } from '@razworks/notifications';
import { GamificationModule } from '@razworks/gamification';

// --- CONTROLADORES BASE ---
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. CONFIGURACIÓN GLOBAL
    // Carga variables de entorno y las hace accesibles en todo el grafo de inyección.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    // 2. SEGURIDAD PERIMETRAL (Rate Limiting)
    // Protección contra DDoS y abuso de API.
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 100, // 100 peticiones por IP
    }]),

    // 3. SISTEMA NERVIOSO (Configuración Raíz de Redis/BullMQ)
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL,
        keepAlive: 10000,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false, // Fail Fast si Redis cae
        family: 4, // Forzar IPv4
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: { count: 100 }, // Mantener últimos 100 fallos para autopsia
      },
    }),

    // 4. REGISTRO DE COLAS DEL SISTEMA NERVIOSO
    // Registramos la cola principal de eventos de dominio.
    BullModule.registerQueue({
      name: 'domain-events',
    }),

    // 5. SISTEMA COGNITIVO GLOBAL
    // Provee AiProviderPort y NeuralContextManager a toda la aplicación.
    AiSystemModule,

    // 6. OBSERVABILIDAD (Logging Estructurado)
    // Redirige logs críticos a la base de datos de auditoría.
    LoggingModule.forRoot(new AuditDbStream(saveAuditLog)),

    // 7. SEGURIDAD CRIPTOGRÁFICA
    // Provee servicios de encriptación y firma HMAC.
    SecurityModule,

    // 8. MÓDULOS DE NEGOCIO (Aparatos Funcionales)
    AuthModule,
    ProjectsModule,
    ToolboxModule,
    WhatsAppEngineModule,
    NotificationsModule,
    GamificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Interceptor Global de Rendimiento
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    // Guardia Global de Rate Limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // --- BINDING HEXAGONAL MAESTRO ---
    // Cuando el Core solicite 'EventDispatcherPort', inyectamos el Adaptador de BullMQ.
    {
      provide: EventDispatcherPort,
      useClass: BullMqEventDispatcher,
    },
    // --- ACTIVACIÓN DE WORKERS ---
    // Registramos el Worker para que Nest lo instancie y comience a escuchar la cola.
    DomainEventsWorker,
  ],
})
export class AppModule {}
