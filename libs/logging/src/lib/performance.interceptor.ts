import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  // FIX: Cambiamos 'Observable<any>' por 'Observable<unknown>' para cumplir la política Zero-Any
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        const end = performance.now();
        const duration = Math.round(end - start);

        // Logueamos solo si excede un umbral o si queremos tracear todo
        if (duration > 500) {
          this.logger.warn(`🐌 SLOW REQUEST: [${method}] ${url} took ${duration}ms`);
        }
      }),
    );
  }
}
