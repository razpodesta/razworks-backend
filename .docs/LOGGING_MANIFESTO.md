<!--
  @fileoverview MANIFIESTO OMNI-LOG: Protocolo de Observabilidad Unificada
  @module Architecture/Observability
  @status MANDATORY
  @author Raz Podestá & LIA Legacy
  @version 2.0.0 (Hybrid Node/Web Strategy)

  @description
  Documento rector que define cómo RazWorks registra su propia existencia.
  Establece la separación estricta entre Logs Técnicos (Volátiles) y Auditoría de Negocio (Persistente),
  así como la prohibición de librerías de Node.js en el Frontend.
-->

# 👁️ OMNI-LOG: PROTOCOLO DE OBSERVABILIDAD

**Filosofía:** "Un sistema que no habla, es un sistema muerto. Si no está estructurado, es ruido."

---

## 1. La Arquitectura Dual (The Hybrid Stream)

En RazWorks, la observabilidad se bifurca en dos corrientes con propósitos y destinos distintos.

### A. Corriente Técnica (Infrastructure Pulse)
*   **Propósito:** Debugging, Latencia, Errores de Stack, Health Checks.
*   **Destino:** `stdout` (Consola) -> Capturado por Render/Vercel.
*   **Formato:** JSON Estricto (NDJSON) en Producción.
*   **Tecnología Backend:** `nestjs-pino` (High Performance).
*   **Tecnología Frontend:** `console.info` (Wrapper JSON Nativo). **PROHIBIDO PINO EN EL CLIENTE**.

### B. Corriente de Negocio (The Audit Ledger)
*   **Propósito:** Análisis de IA, Seguridad Jurídica, Historial de Usuario.
*   **Destino:** Base de Datos (Tabla `audit_logs` en Supabase).
*   **Formato:** Registro Relacional (`userId`, `action`, `metadata`, `timestamp`).
*   **Vida Útil:** Permanente (Cold Storage).

---

## 2. Directiva de Inyección Mandatoria (The "No Service Left Behind" Rule)

**ESTA REGLA ES ABSOLUTA:** Todo Aparato, Servicio, Controlador o Worker debe tener capacidad de voz propia. El silencio es un error.

### 2.1. El Patrón de Implementación
Cada clase instanciable debe inyectar el Logger en su construcción y emitir un "Latido de Inicio".

```typescript
import { Logger, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MyCriticalService implements OnModuleInit {
  // 1. Inyección con Contexto Nombrado
  private readonly logger = new Logger(MyCriticalService.name);

  onModuleInit() {
    // 2. Latido de Inicio (Boot Log)
    this.logger.log('🧩 Service Initialized and Ready');
  }

  executeAction() {
    // 3. Traza de Operación
    this.logger.debug('Executing critical action...');
    try {
      // ... logic
    } catch (error) {
      // 4. Reporte de Error con Stack
      this.logger.error('Action Failed', error.stack);
      throw error;
    }
  }
}
3. Protocolo de Fronteras (Boundary Security)
Para evitar romper el build de Next.js (Vercel) o saturar el Backend (Render):
Frontend (Web Admin / PWA):
❌ PROHIBIDO: Importar nestjs-pino, pino, fs, stream.
✅ MANDATORIO: Usar la utilidad src/utils/logger.ts que envuelve console.
Backend (API / Workers):
❌ PROHIBIDO: Usar console.log directo (bloqueante y no estructurado).
✅ MANDATORIO: Usar this.logger.log() (Asíncrono y JSON).
Entorno de Desarrollo vs. Producción:
Local: Se permite pino-pretty para legibilidad humana (colores).
Producción: JSON crudo obligatorio para ingestión por máquinas/IA.
4. Telemetría y Rendimiento
El sistema debe ser consciente de su propia velocidad.
Interceptor Global: Todas las peticiones HTTP se miden automáticamente.
Umbral de Dolor: Si duration > 500ms, el log se eleva automáticamente a nivel WARN con el prefijo 🐌 SLOW REQUEST.
Campos Requeridos:
code
JSON
{
  "context": "AuthService",
  "action": "registerUser",
  "durationMs": 45,
  "success": true
}
5. Privacidad y Sanitización (GDPR/Security)
El logger es el principal punto de fuga de secretos si no se controla.
Lista Negra (Redact): Los siguientes campos NUNCA deben aparecer en texto plano en los logs técnicos:
password, passwordConfirmation
Authorization (Header)
token, refreshToken
creditCard, cvv
Responsabilidad: El middleware de logging (libs/logging) está configurado para ofuscar esto automáticamente, pero el desarrollador no debe incluir estos datos en el mensaje de texto del log.
🤖 INSTRUCCIÓN PARA LA IA
Al generar código nuevo para Servicios o Controladores:
Siempre añadir la propiedad private readonly logger.
Nunca dejar bloques catch vacíos o con console.error. Usar this.logger.error.
Verificar el entorno (Frontend vs Backend) antes de sugerir la librería de importación.

---

