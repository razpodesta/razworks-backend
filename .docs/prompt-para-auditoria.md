# 🔬 RAZWORKS WORKSPACE AUDIT & OPTIMIZATION PROTOCOL
**AI-Powered Atomic Architecture Refinement Engine**

---

## 📋 CONTEXTO DEL PROYECTO

**RazWorks** es un marketplace freelance IA-First que elimina la fricción en la contratación mediante:
- **Conversational AI** (LIA Engine) que estructura proyectos desde audio/texto
- **Matching Semántico** con pgvector para conectar talento con oportunidades
- **Gamificación Profunda** (Sistema Razters: 33 niveles, 5 reinos)
- **Zero-Friction UX** con internacionalización nativa y procesamiento asíncrono

**Stack Core:**
- Monorepo: Nx Workspace
- Backend: NestJS + Fastify + Drizzle ORM
- Frontend: Next.js 14+ (App Router) + Tailwind + Shadcn/UI
- Database: Supabase (Postgres + pgvector + Auth)
- Cache/Jobs: Upstash Redis + BullMQ
- AI: Adapter Pattern (Gemini Pro / Groq / OpenAI)

**Principios de Arquitectura:**
1. **Single Responsibility Principle (SOLID)**: Cada módulo/clase/función tiene UNA razón para cambiar
2. **DRY via Shared Libs**: Código compartido vive en `libs/shared/*`
3. **Event-Driven**: Comunicación asíncrona mediante eventos (BullMQ + Redis)
4. **Performance First**: DTOs ligeros, lazy loading, caching estratégico
5. **AI-Native**: Cada módulo debe considerar integración con LLMs desde el diseño

---

## 🎯 MISIÓN DE AUDITORÍA

Recibirás un **snapshot completo de un workspace** de Nx (puede ser una app o una lib). Tu objetivo es realizar una **Auditoría Holística de 360°** siguiendo este protocolo:

### FASE 1: ANÁLISIS ESTRUCTURAL 🏗️

#### 1.1. Mapeo de Responsabilidades
- **Identifica cada archivo/clase/función** y lista su responsabilidad actual
- **Detecta violaciones SRP**: Si un módulo hace 2+ cosas no relacionadas, MARCALO
- **Propón atomización**: Divide en submódulos/servicios especializados

**Ejemplo de Output:**
```
❌ VIOLACIÓN DETECTADA: `auth.service.ts`
   Responsabilidades mezcladas:
   - Autenticación de usuarios (JWT)
   - Envío de emails de verificación (debería ser NotificationService)
   - Validación de contraseñas (debería ser SecurityService)

✅ SOLUCIÓN PROPUESTA:
   - `auth/core/auth.service.ts` → Solo lógica de tokens/sesiones
   - `auth/security/password-validator.service.ts` → Validaciones
   - `notification/email/verification-mailer.service.ts` → Emails
```

#### 1.2. Coherencia con Convenciones RazWorks
Verifica que TODOS los archivos incluyan el **TSDoc Header Obligatorio**:

```typescript
/**
 * @fileoverview [Descripción clara del propósito]
 * @module [NombreDelMódulo]
 *
 * @author Raz Podestá <raz.podesta@metashark.tech>
 * @copyright 2025 MetaShark Tech - Florianópolis, SC. All rights reserved.
 * @license UNLICENSED - Proprietary Software.
 *
 * @description
 * [Explicación técnica detallada: patrones usados, decisiones arquitectónicas]
 *
 * @requires [Dependencias críticas]
 * @version 1.0.0
 */
```

#### 1.3. Análisis de Dependencias
- **Identifica dependencias circulares**: A importa B, B importa A
- **Detecta acoplamiento fuerte**: Si un módulo importa >5 servicios externos
- **Propón inyección de dependencias** donde falte (NestJS Providers)

---

### FASE 2: OPTIMIZACIÓN DE PERFORMANCE ⚡

#### 2.1. Bundle Size & Tree-Shaking
- **Identifica imports masivos**: `import * as _ from 'lodash'` → usar imports específicos
- **Detecta librerías pesadas** no necesarias
- **Propón code-splitting** para rutas/módulos grandes

#### 2.2. Estrategias de Caché
Para servicios que consultan DB/APIs externas:
```typescript
// ❌ MAL: Consulta en cada request
async getUser(id: string) {
  return this.db.user.findUnique({ where: { id } });
}

// ✅ BIEN: Cache con TTL
@Cacheable('user', 300) // 5 min
async getUser(id: string) {
  return this.db.user.findUnique({ where: { id } });
}
```

#### 2.3. Queries N+1 y Optimización de DB
- **Detecta consultas repetidas en loops**
- **Propón eager loading** (Drizzle `.with()`)
- **Sugiere índices** para campos frecuentemente filtrados

---

### FASE 3: SEGURIDAD & VALIDACIÓN 🔒

#### 3.1. Sanitización de Inputs
TODO input de usuario DEBE pasar por **Zod Schemas**:

```typescript
// libs/shared/dtos/src/auth/login.dto.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128)
});

export type LoginDTO = z.infer<typeof LoginSchema>;
```

#### 3.2. Rate Limiting & Throttling
Endpoints críticos (login, AI generation) DEBEN tener `@ThrottlerGuard()`:

```typescript
@Post('login')
@UseGuards(ThrottlerGuard)
async login(@Body() dto: LoginDTO) { ... }
```

#### 3.3. Manejo de Secretos
- **NUNCA hardcodear** API keys
- **Validar** que `.env.example` exista con todas las vars necesarias
- **Propón** uso de `@nestjs/config` con validación Zod

---

### FASE 4: TESTING & CALIDAD 🧪

#### 4.1. Cobertura de Tests
- **Calcula cobertura esperada**: Servicios core deben tener >80% coverage
- **Propón estructura espejo**:
  ```
  src/modules/auth/auth.service.ts
  test/unit/auth/auth.service.spec.ts
  ```

#### 4.2. Fábrica de Mocks
Crea helpers reutilizables:

```typescript
// libs/testing/src/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createMockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  razterLevel: 1,
  realm: 'THE_SCRIPT',
  ...overrides
});
```

---

### FASE 5: INTEGRACIÓN IA & FEATURES NATIVAS 🤖

#### 5.1. AI-Ready Endpoints
Si el workspace interactúa con usuarios, DEBE considerar:
- **Endpoints de streaming** (SSE) para respuestas progresivas
- **Procesamiento asíncrono** (BullMQ) para tareas >2seg
- **Embeddings** para búsqueda semántica (si aplica)

#### 5.2. Internacionalización (i18n)
- **Backend**: Usar `nestjs-i18n` para mensajes de error
- **Frontend**: `next-intl` con detección automática de idioma
- **Propón** estructura de traducciones:
  ```
  libs/i18n/
  ├── locales/
  │   ├── en/
  │   │   └── common.json
  │   ├── es/
  │   └── pt-BR/
  ```

---

### FASE 6: NUEVAS FUNCIONALIDADES & WORKSPACES 💡

Analiza el workspace actual y **propón proactivamente**:

#### 6.1. Workspaces Sugeridos (Si no existen)

**A. `libs/payments` - Sistema de Pagos**
```
Responsabilidades:
- Integración con Stripe/Mercado Pago
- Manejo de Escrow (pagos en garantía)
- Webhooks de confirmación
- Facturación automática

Estructura:
libs/payments/
├── src/
│   ├── providers/
│   │   ├── stripe.provider.ts
│   │   └── mercadopago.provider.ts
│   ├── escrow/
│   │   └── escrow.service.ts
│   ├── invoicing/
│   │   └── invoice-generator.service.ts
│   └── webhooks/
│       └── payment-webhook.controller.ts
```

**B. `libs/subscription` - Gestión de Suscripciones**
```
Responsabilidades:
- Planes (Free, Pro, Enterprise)
- Límites de uso (ej: proyectos IA/mes)
- Renovación automática
- Métricas de facturación

Features:
- Integración con Stripe Billing
- Quotas dinámicas por tier
- Webhooks de cancelación/upgrade
```

**C. `libs/crypto-wallet` - Blockchain & Crypto**
```
Responsabilidades:
- Conexión con wallets (MetaMask, WalletConnect)
- Pagos en USDT/USDC (Polygon/BSC)
- Conversión automática fiat↔crypto
- Smart contracts para escrow descentralizado

Tech Stack:
- ethers.js / viem
- Alchemy/Infura RPC
- Coingecko API para precios
```

**D. `libs/gamification` - Motor de Razters**
```
Responsabilidades:
- Cálculo de XP y niveles
- Sistema de badges (logros)
- Leaderboards (ranking global)
- Notificaciones de logros

Estructura:
libs/gamification/
├── src/
│   ├── xp/
│   │   ├── xp-calculator.service.ts
│   │   └── level-up.handler.ts
│   ├── badges/
│   │   ├── badge-registry.ts (mapa de todos los badges)
│   │   └── badge-validator.service.ts
│   ├── leaderboard/
│   │   └── ranking.service.ts (con Redis Sorted Sets)
│   └── events/
│       └── achievement-unlocked.event.ts
```

**E. `libs/ai-orchestration` - Orquestador de LLMs**
```
Responsabilidades:
- Router inteligente (Gemini para análisis, Groq para velocidad)
- Fallback automático si un proveedor falla
- Cost tracking por modelo
- Prompt caching para requests repetidos

Features:
- Adapter Pattern para N proveedores
- Circuit Breaker pattern
- Métricas en tiempo real (latencia, costo)
```

**F. `libs/vector-search` - Búsqueda Semántica**
```
Responsabilidades:
- Generación de embeddings (proyectos, perfiles)
- Indexación vectorial (pgvector)
- Búsqueda por similitud coseno
- Re-ranking con metadatos

Casos de uso:
- Matching freelancer↔proyecto
- Búsqueda "Encuentra proyectos como este"
- Detección de duplicados
```

**G. `libs/notifications` - Sistema de Notificaciones**
```
Responsabilidades:
- Push notifications (OneSignal/Firebase)
- Emails transaccionales (Resend/SendGrid)
- In-app notifications
- Preferencias de usuario (opt-in/out)

Estructura:
libs/notifications/
├── src/
│   ├── channels/
│   │   ├── email/
│   │   ├── push/
│   │   └── in-app/
│   ├── templates/
│   │   └── email-templates/ (React Email)
│   └── preferences/
│       └── notification-settings.service.ts
```

#### 6.2. Features Específicas por Workspace

**Si estás auditando `apps/api` (Backend):**
- **Propón** sistema de webhooks para integraciones externas
- **Sugiere** versionado de API (`/v1/`, `/v2/`)
- **Añade** health checks para monitoreo (`/health`, `/metrics`)

**Si estás auditando `apps/web-client` (Frontend):**
- **Propón** PWA support (offline mode)
- **Sugiere** optimización de imágenes (next/image + CDN)
- **Añade** analytics (PostHog/Plausible)

**Si estás auditando `libs/shared/dtos`:**
- **Propón** generación automática de OpenAPI schemas desde Zod
- **Sugiere** versionado de DTOs (breaking changes)

---

### FASE 7: REFACTORING & ENTREGABLES 📦

#### 7.1. Plan de Migración
Si propones cambios estructurales grandes:
```markdown
## 🚀 Plan de Refactoring: [Nombre del Workspace]

### Cambios Críticos (Requieren migración de DB/datos)
1. [Cambio 1 con pasos específicos]

### Cambios No-Breaking (Safe deploys)
1. [Cambio 1]

### Orden de Implementación
- Sprint 1: [Tareas]
- Sprint 2: [Tareas]

### Riesgos Identificados
- [Riesgo 1 + Mitigación]
```

#### 7.2. Código Completo Production-Ready
**NUNCA abrevies código**. Entrega:
- Archivos completos con imports
- Tests unitarios para servicios críticos
- README.md del workspace con:
  - Propósito
  - Comandos de instalación
  - Ejemplos de uso
  - Diagramas (Mermaid) si aplica

**Ejemplo de Entregable:**

```typescript
/**
 * @fileoverview Servicio de Cálculo de XP para Sistema Razters
 * @module Gamification/XP
 *
 * @author Raz Podestá <raz.podesta@metashark.tech>
 * @copyright 2025 MetaShark Tech. All rights reserved.
 * @license UNLICENSED
 *
 * @description
 * Calcula puntos de experiencia basado en acciones del usuario.
 * Aplica multiplicadores según el reino actual y badges activos.
 * Usa Redis para caché de cálculos complejos (TTL: 1h).
 *
 * @requires RedisService
 * @requires UserRepository
 * @version 1.0.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { UserRepository } from '@/domain/user/user.repository';
import { RazterRealm, LEVEL_MAP } from '@razworks/shared/dtos';

export interface XPGainEvent {
  userId: string;
  action: 'PROJECT_COMPLETED' | 'PROPOSAL_SENT' | 'FEEDBACK_GIVEN';
  metadata?: Record<string, any>;
}

@Injectable()
export class XPCalculatorService {
  private readonly logger = new Logger(XPCalculatorService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly userRepo: UserRepository,
  ) {}

  /**
   * Calcula y aplica XP al usuario, manejando level-ups automáticamente
   */
  async processXPGain(event: XPGainEvent): Promise<{
    xpGained: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    const { userId, action, metadata } = event;

    // 1. Base XP por acción
    const baseXP = this.getBaseXP(action);

    // 2. Aplicar multiplicadores (realm, badges, streaks)
    const user = await this.userRepo.findById(userId);
    const multiplier = await this.calculateMultiplier(user);

    const finalXP = Math.floor(baseXP * multiplier);

    // 3. Actualizar en DB
    const updatedUser = await this.userRepo.addXP(userId, finalXP);

    // 4. Verificar level-up
    const leveledUp = updatedUser.level > user.level;

    if (leveledUp) {
      await this.handleLevelUp(updatedUser);
    }

    // 5. Invalidar caché
    await this.redis.del(`user:${userId}:stats`);

    this.logger.log(
      `User ${userId} gained ${finalXP}XP (${action}). Level: ${updatedUser.level}`,
    );

    return {
      xpGained: finalXP,
      newLevel: updatedUser.level,
      leveledUp,
    };
  }

  private getBaseXP(action: XPGainEvent['action']): number {
    const XP_TABLE = {
      PROJECT_COMPLETED: 500,
      PROPOSAL_SENT: 10,
      FEEDBACK_GIVEN: 25,
    };
    return XP_TABLE[action] || 0;
  }

  private async calculateMultiplier(user: any): Promise<number> {
    let multiplier = 1.0;

    // Bonus por reino
    const REALM_MULTIPLIERS: Record<RazterRealm, number> = {
      [RazterRealm.SCRIPT]: 1.0,
      [RazterRealm.COMPILER]: 1.2,
      [RazterRealm.KERNEL]: 1.5,
      [RazterRealm.NETWORK]: 2.0,
      [RazterRealm.SOURCE]: 3.0,
    };
    multiplier *= REALM_MULTIPLIERS[user.realm];

    // Bonus por badges especiales
    if (user.badges.includes('CLEAN_SHEET')) {
      multiplier *= 1.1; // +10%
    }

    return multiplier;
  }

  private async handleLevelUp(user: any): Promise<void> {
    const newLevelName = LEVEL_MAP[user.level];

    // Emit event para notificaciones
    // await this.eventBus.emit('user.leveled-up', { userId: user.id, newLevel: user.level });

    this.logger.log(
      `🎉 User ${user.id} leveled up to ${user.level}: ${newLevelName}`,
    );

    // Desbloquear features según nivel
    if (user.level === 13) {
      // "Sudo User" - acceso a proyectos premium
      await this.userRepo.grantPermission(user.id, 'ACCESS_PREMIUM_PROJECTS');
    }
  }
}
```

---

## 📊 FORMATO DE REPORTE FINAL

Entrega tu auditoría en este formato Markdown:

```markdown
# 🔍 AUDITORÍA: [Nombre del Workspace]
**Fecha:** [ISO 8601]
**Auditor:** Claude (RazWorks Audit Protocol v1.0)

---

## 📈 RESUMEN EJECUTIVO

### Métricas de Salud
- **Complejidad Ciclomática Promedio:** [Número]
- **Cobertura de Tests:** [%]
- **Violaciones SRP Detectadas:** [Cantidad]
- **Deuda Técnica Estimada:** [Horas de refactoring]

### Nivel de Calificación
⭐⭐⭐☆☆ (3/5) - [Justificación breve]

---

## 🔴 PROBLEMAS CRÍTICOS (Bloqueantes)

### 1. [Título del Problema]
**Severidad:** Alta
**Archivos afectados:** `path/to/file.ts`
**Descripción:** [Explicación técnica]
**Impacto:** [Consecuencias en producción]
**Solución:** [Pasos específicos]

---

## 🟡 MEJORAS RECOMENDADAS (No bloqueantes)

### 1. [Título de la Mejora]
**Prioridad:** Media
**Beneficio esperado:** [Performance/Mantenibilidad/Seguridad]
**Esfuerzo estimado:** [Story points o horas]

---

## ✅ FORTALEZAS DETECTADAS

- [Práctica bien implementada #1]
- [Decisión arquitectónica acertada #2]

---

## 🚀 NUEVAS FUNCIONALIDADES PROPUESTAS

### Feature 1: [Nombre]
**Justificación:** [Por qué mejora RazWorks]
**Stack sugerido:** [Tecnologías]
**Esfuerzo:** [S/M/L]

[Código de ejemplo o diagrama]

---

## 📦 ENTREGABLES

### Archivos Nuevos
- `libs/[workspace]/src/[module]/[file].ts` (Código completo adjunto abajo)

### Archivos Modificados
- `[path]` (Diff o versión completa adjunta)

### Migraciones de DB (si aplica)
```sql
-- Migration: add_xp_system
ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;
CREATE INDEX idx_users_xp ON users(xp DESC);
```

---

## 📚 CÓDIGO COMPLETO PRODUCTION-READY

[Incluir TODOS los archivos nuevos/modificados aquí]
```

---

## 🎯 INSTRUCCIONES FINALES PARA LA IA

1. **NO asumas** que el código existente está bien. Cuestiona TODO.
2. **SÉ PROACTIVO**: Si ves que falta un workspace crítico (ej: pagos), PROPÓNLO con código completo.
3. **ENTREGA CÓDIGO COMPLETO**: Nunca uses `// ... resto del código`. Escribe el archivo entero.
4. **PIENSA EN PRODUCCIÓN**: Cada línea de código debe ser deploy-able HOY.
5. **ALINEA CON RAZWORKS**: Valida que el workspace sirve a la visión del proyecto (IA-First, Gamificación, Zero-Friction).

---

## 🔗 RECURSOS DE REFERENCIA

- **Nx Best Practices:** https://nx.dev/concepts/decisions/project-size
- **NestJS Patterns:** https://docs.nestjs.com/fundamentals/async-providers
- **Zod Performance:** https://github.com/colinhacks/zod#performance
- **pgvector Docs:** https://github.com/pgvector/pgvector

---

**Versión del Protocolo:** 1.0.0
**Última Actualización:** 2025-01-XX
**Mantenido por:** Raz Podestá @ MetaShark Tech
```

---

## 💬 EJEMPLO DE USO

**Prompt del Usuario:**
```
Audita el workspace `libs/ai-core` usando el Protocolo RazWorks.
Adjunto el snapshot del directorio actual.
```

**Respuesta Esperada de la IA:**
- Análisis estructural completo
- Detección de violaciones SRP
- Código refactorizado production-ready
- Propuesta de nuevas features (ej: prompt caching, cost tracking)
- Plan de migración paso a paso
- Tests unitarios completos

---

**¡Este prompt está diseñado para llevar cada workspace al siguiente nivel con visión holística y entrega ejecutable inmediata!** 🚀
