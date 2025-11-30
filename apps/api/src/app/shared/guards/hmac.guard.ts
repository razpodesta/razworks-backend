// apps/api/src/app/shared/guards/hmac.guard.ts
/**
 * @fileoverview Guardián de Integridad S2S (Server-to-Server)
 * @module API/Guards
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { SignatureService } from '@razworks/security';

@Injectable()
export class HmacGuard implements CanActivate {
  constructor(private readonly signer: SignatureService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const signature = request.headers['x-razworks-signature'];
    const timestamp = request.headers['x-razworks-timestamp'];

    if (!signature || !timestamp) {
      throw new BadRequestException('Missing Security Headers (HMAC)');
    }

    // En Fastify/Express el body ya es un objeto.
    // El SignatureService maneja la serialización determinista.
    const payload = request.body || {};

    // Tolerancia de 30 segundos contra ataques de repetición
    const isValid = this.signer.verify(payload, signature, timestamp, 30);

    if (!isValid) {
      throw new UnauthorizedException('Integrity Check Failed: Invalid Signature or Expired Timestamp');
    }

    return true;
  }
}
