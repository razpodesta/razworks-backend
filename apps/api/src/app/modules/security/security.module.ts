// apps/api/src/app/modules/security/security.module.ts
/**
 * @fileoverview Módulo de Seguridad (NestJS Wrapper)
 * @description Inyecta la configuración del .env en los servicios de criptografía.
 */
import { Module, Global } from '@nestjs/common';
import { EncryptionService, SignatureService } from '@razworks/security';

@Global() // Disponible en toda la app sin re-importar
@Module({
  providers: [
    {
      provide: EncryptionService,
      useFactory: () => {
        const key = process.env['ENCRYPTION_KEY'];
        if (!key) throw new Error('FATAL: ENCRYPTION_KEY missing in API');
        return new EncryptionService(key);
      },
    },
    {
      provide: SignatureService,
      useFactory: () => {
        const secret = process.env['SIGNING_SECRET'];
        if (!secret) throw new Error('FATAL: SIGNING_SECRET missing in API');
        return new SignatureService(secret);
      },
    },
  ],
  exports: [EncryptionService, SignatureService],
})
export class SecurityModule {}
