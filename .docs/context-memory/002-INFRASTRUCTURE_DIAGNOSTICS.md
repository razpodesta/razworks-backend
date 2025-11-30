<!--
  @id 002-INFRA-DIAGNOSTICS
  @type ARCHITECTURE
  @status ACTIVE
-->

# 🩺 ESTRATEGIA DE DIAGNÓSTICO Y OBSERVABILIDAD PREVENTIVA

## 📖 The Storytelling
Nos enfrentamos a la "ceguera del despliegue": intentar correr migraciones o lógica de IA sin saber si los cables estaban conectados. Tuvimos fallos con URLs de Supabase incorrectas (Pooler vs Direct) y modelos de Gemini deprecados. Decidimos que no se escribe código de negocio sin antes tener luz verde en la infraestructura subyacente.

## 🏛️ The Decision
1.  **Tríada de Scripts:** Se crean scripts atómicos en `scripts/` para cada servicio crítico:
    *   `supabase/test-connection.mjs`: Valida conexión TCP y credenciales Postgres.
    *   `upstash/test-connection.mjs`: Valida Redis PING y escritura/lectura.
    *   `google-ai/test-connection.mjs`: Valida generación real con el modelo vigente.
2.  **SDKs Oficiales:** Migración obligatoria a `@google/genai` (v1) abandonando el SDK legacy.
3.  **Verbosidad Visual:** Los scripts usan códigos ANSI (Colores) para feedback inmediato (Verde/Rojo) y generan logs persistentes en `reports/`.

## 🤖 AI MEMORY HOOK
*   **ANTES DE:** Sugerir correcciones de código en la API, solicita al usuario ejecutar `pnpm run audit:full`.
*   **CONTEXTO:** Si el error es `Tenant not found`, sabes que es el ID de proyecto en `.env`.
*   **MODELO:** Siempre usa `gemini-2.5-pro` (o superior confirmado) en los scripts de prueba.
