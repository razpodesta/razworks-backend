/**
 * @fileoverview Módulo Raíz del API Gateway (The Cortex Root)
 * @module API/Root
 * @description
 * Orquestador Supremo. Ahora potenciado con el Sistema Cognitivo Global.
 */

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// --- INFRAESTRUCTURA TRANSVERSAL ---
import { LoggingModule, PerformanceInterceptor, AuditDbStream } from '@razworks/logging';
import { saveAuditLog } from './shared/audit-logger.factory';
import { SecurityModule } from './modules/security/security.module';
import { AiSystemModule } from '@razworks/ai'; // ✅ EL NUEVO CEREBRO GLOBAL

// --- MÓDULOS DE DOMINIO ---
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ToolboxModule } from './modules/toolbox/toolbox.module';

// --- MOTORES DE EVENTOS ---
import { WhatsAppEngineModule } from '@razworks/whatsapp-engine';
import { NotificationsModule } from '@razworks/notifications';
import { GamificationModule } from '@razworks/gamification';

// --- CONTROLADORES BASE ---
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. CONFIGURACIÓN
    ConfigModule.forRoot({ isGlobal: true, cache: true }),

    // 2. SEGURIDAD PERIMETRAL
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // 3. SISTEMA NERVIOSO (Redis)
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL,
        keepAlive: 10000,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        family: 4,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: { count: 100 },
      },
    }),

    // 4. SISTEMA COGNITIVO GLOBAL (Nuevo)
    // Provee AiProviderPort y NeuralContextManager a toda la app
    AiSystemModule,

    // 5. OBSERVABILIDAD
    LoggingModule.forRoot(new AuditDbStream(saveAuditLog)),

    // 6. SEGURIDAD CRYPTO
    SecurityModule,

    // 7. NEGOCIO & MOTORES
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
    { provide: APP_INTERCEPTOR, useClass: PerformanceInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
