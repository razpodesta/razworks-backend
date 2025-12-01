<!--
  @title MANIFIESTO DE CICLO DE VIDA SOBERANO, DEVOPS Y CALIDAD
  @id DOC-007-LIFECYCLE
  @category Architecture/DevOps
  @status LAW (Inmutable)
  @version 3.0.0 (Consolidated)
  @author Raz Podestá & LIA Legacy
-->

# 🚀 APARATO VII: EL CICLO DE VIDA SOBERANO (LIFECYCLE & DEVOPS)

## 1. Visión: "Cloud-Native Localhost" (No Docker)
(Absorbido de CLOUD_NATIVE_WORKSPACES)

RazWorks opera bajo una restricción de hardware estricta para garantizar agilidad.

*   **Prohibición de Virtualización Local:** Está estrictamente **PROHIBIDO** el uso de Docker Desktop o contenedores locales para desarrollo.
*   **Modelo Operativo:** El código corre en el host (Windows), pero la persistencia (DB, Redis, AI) vive exclusivamente en la nube (Supabase, Upstash, Google).
*   **Fail Fast:** La aplicación debe fallar al inicio si no detecta conexión a los servicios remotos.

## 2. El Toolchain Soberano (Windows & pnpm)
(Absorbido de NX_COMMAND_PROTOCOL)

La estandarización del entorno de desarrollo es obligatoria.

### A. Motor de Paquetes: `pnpm`
*   **Exclusividad:** El uso de `npm` o `yarn` está prohibido. El algoritmo de resolución de `pnpm` es vital para la integridad del monorepo.
*   **Comandos:** Siempre usar `pnpm exec nx ...` o `pnpm run ...`.

### B. Entorno Operativo: Windows CMD
*   **Sintaxis:** Los scripts y comandos generados por la IA deben ser nativos para **cmd.exe**.
*   **Restricciones:** No usar `export` (usar `set`), no usar `ls` (usar `dir`), no usar `&&` complejos de bash.

## 3. Manifiesto de Calidad y Testing (QA)
(Absorbido de testing-directive)

### A. Estrategia "Ruta Espejo"
Los tests NO viven dentro de `src`. Viven en una raíz paralela `tests/` que replica la estructura.
*   *Código:* `apps/api/src/auth/auth.service.ts`
*   *Test:* `tests/apps/api/auth/auth.service.spec.ts`

### B. Directiva de Idioma (Localización QA)
*   **Mandato:** Toda descripción de prueba (`describe`, `it`) debe estar redactada en **Português do Brasil (pt-BR)**.
*   *Objetivo:* Alineación con el equipo LATAM/Brasil.
*   *Ejemplo:* `it('deve rejeitar o projeto se o orçamento for menor que o mínimo', ...)`

### C. Tipología de Pruebas
1.  **Unitarias:** 100% Offline. Mocks obligatorios.
2.  **Integración:** Conexión real a servicios remotos (solo en CI o bajo demanda).
3.  **E2E:** Playwright contra entorno de Staging.

## 4. Protocolo de Observabilidad (Omni-Log)
(Absorbido de LOGGING_MANIFESTO)

El sistema debe hablar. El silencio es un error.

### A. La Corriente Híbrida
1.  **Logs Técnicos (Volátiles):**
    *   *Destino:* `stdout` (Consola).
    *   *Formato:* JSON estructurado en Producción, `pino-pretty` en Local.
    *   *Contenido:* Latencia, Stack Traces, Health Checks.
2.  **Logs de Auditoría (Persistentes):**
    *   *Destino:* Base de Datos (Tabla `audit_logs`).
    *   *Contenido:* Acciones de negocio (`USER_LOGIN`, `PROJECT_CREATED`).
    *   *Mecanismo:* Inserción asíncrona vía Colas (Aparato V).

### B. Privacidad (Sanitización)
Los siguientes campos deben ser ofuscados automáticamente antes de imprimir:
*   `password`, `token`, `Authorization`, `credit_card`.

## 5. Estrategia de Diagnóstico y Autocuración
(Absorbido de 002-INFRASTRUCTURE_DIAGNOSTICS)

Antes de reportar un error de código, verificamos la infraestructura.

### La Tríada de Diagnóstico
Scripts atómicos en `scripts/` que devuelven Verde/Rojo:
1.  `supabase/test-connection.mjs`: Valida TCP y Credenciales Postgres.
2.  `upstash/test-connection.mjs`: Valida Redis PING.
3.  `google-ai/test-connection.mjs`: Valida generación real con modelo vigente.

## 6. Instrucciones para la IA (DevOps Rules)

**TÚ (La IA) DEBES:**

1.  **Validar Entorno:** Antes de sugerir un comando, verifica si es compatible con Windows CMD.
2.  **Generar Mocks:** Al crear un servicio nuevo, crear inmediatamente su `MockFactory` en `libs/testing`.
3.  **Escribir Tests en PT-BR:** Si generas un archivo `.spec.ts`, los strings de descripción deben estar en portugués.
4.  **Diagnóstico Primero:** Si el usuario reporta un error 500, sugiere correr `pnpm run audit:infra` antes de analizar el código.

---

<!--
  @title MANIFIESTO DE CICLO DE VIDA SOBERANO, DEVOPS Y CALIDAD
  @id DOC-007-LIFECYCLE
  @category Architecture/DevOps
  @status LAW (Inmutable)
  @version 3.1.0 (Strict-Compliance)
  @author Raz Podestá & LIA Legacy
-->

# 🚀 APARATO VII: EL CICLO DE VIDA SOBERANO (LIFECYCLE & DEVOPS)

## 1. Visión: "Cloud-Native Localhost" (No Docker)
RazWorks opera bajo una restricción de hardware estricta para garantizar agilidad.

*   **Prohibición de Virtualización Local:** Está estrictamente **PROHIBIDO** el uso de Docker Desktop o contenedores locales.
*   **Modelo Operativo:** El código corre en el host (Windows), pero la persistencia (DB, Redis, AI) vive exclusivamente en la nube (Supabase, Upstash, Google).
*   **Fail Fast:** La aplicación debe fallar al inicio (Bootstrap) si no valida la conexión a los servicios remotos (Zod Env Validation).

## 2. El Toolchain Soberano (Windows & pnpm)

### A. Motor de Paquetes: `pnpm`
*   **Exclusividad:** El uso de `npm` o `yarn` está prohibido.
*   **Comandos:** Siempre usar `pnpm exec nx ...` o `pnpm run ...`.

### B. Entorno Operativo: Windows CMD
*   **Sintaxis:** Los scripts deben ser nativos para **cmd.exe**.
*   **Restricciones:** Usar `set` (no `export`), `dir` (no `ls`), y evitar `&&` complejos.

## 3. Reglas de Importación y Límites (Package-Based)

Para mantener la higiene del Monorepo, la IA debe seguir estas reglas de importación sin excepción:

*   ❌ **PROHIBIDO:** Importaciones relativas que suban de nivel.
    *   *Mal:* `import { User } from '../../libs/core';`
*   ✅ **MANDATORIO:** Importaciones por Alias de Paquete (Path Aliases).
    *   *Bien:* `import { User } from '@razworks/core';`
*   **Fundamento:** Esto permite mover carpetas físicamente sin romper referencias.

## 4. Manifiesto de Calidad y Testing (QA)

### A. Estrategia "Ruta Espejo"
Los tests viven en una raíz paralela `tests/` que replica la estructura de `apps/` o `libs/`.

### B. Directiva de Idioma (Localización QA)
*   **Mandato:** Toda descripción de prueba (`describe`, `it`) debe estar redactada en **Português do Brasil (pt-BR)**.

### C. Estrategia de Testing Híbrida
1.  **Unitarias:** 100% Offline con Mocks (`@razworks/testing`).
2.  **Integración:**
    *   *Preferencia:* Conexión real a servicios remotos (Supabase Test Project).
    *   *Abstracción:* El código debe usar el **Patrón Repositorio** (Interfaces en `Core`) para permitir, si fuera necesario, inyectar un `InMemoryRepository` en lugar del `SupabaseRepository`.

## 5. Protocolo de Observabilidad (Omni-Log)

### A. La Corriente Híbrida
1.  **Logs Técnicos:** `stdout` (JSON en Prod, Pretty en Local).
2.  **Logs de Auditoría:** Base de Datos (`audit_logs`) vía inserción asíncrona.

### B. Privacidad
Sanitización automática de: `password`, `token`, `Authorization`.

## 6. Estrategia de Diagnóstico
Scripts atómicos en `scripts/` (Verde/Rojo) para validar DB, Redis y AI antes de codificar.

## 7. Instrucciones para la IA (DevOps & Generation Rules)

**TÚ (La IA) DEBES:**

1.  **Generación de Libs:** Al crear una librería, usar siempre:
    *   `--bundler=tsc`
    *   `--importPath=@razworks/[nombre]`
2.  **Validar Entorno:** Verificar compatibilidad con Windows CMD.
3.  **Generar Mocks:** Crear `MockFactory` en `libs/testing` para nuevas entidades.
4.  **Diagnóstico Primero:** Ante errores 500, sugerir `pnpm run audit:infra`.

---

