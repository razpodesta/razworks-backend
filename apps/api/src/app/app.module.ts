// apps/api/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingModule, PerformanceInterceptor } from '@razworks/logging';

// Feature Modules
import { SecurityModule } from './modules/security/security.module'; // ✅ Nuevo
import { ToolboxModule } from './modules/toolbox/toolbox.module';   // ✅ Nuevo
import { AuthModule } from './modules/auth/auth.module';
import { WhatsAppEngineModule } from '@razworks/whatsapp-engine';

// Controllers & Services Base
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggingModule,
    SecurityModule, // Global
    AuthModule,
    WhatsAppEngineModule,
    ToolboxModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {}
