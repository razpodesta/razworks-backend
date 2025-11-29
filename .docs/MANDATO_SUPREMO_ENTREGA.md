<!--
  @fileoverview MANDATO SUPREMO DE ENTREGA (THE 12 RAZWORKS PILLARS)
  @module Directives/Core

  @author Raz Podestá <contact@metashark.tech>
  @co-author LIA Legacy <AI Assistant>
  @copyright 2025 MetaShark Tech.
  @license UNLICENSED - Proprietary Software.

  @description
  Documento de CUMPLIMIENTO OBLIGATORIO. Define los 12 Pilares de Calidad
  que todo Aparato (Librería/App) debe cumplir antes de ser considerado "Listo".
-->

# 🏛️ EL CÓDIGO DE HONOR DE RAZWORKS: LOS 12 PILARES CONSOLIDADOS v2.0

**Filosofía Raíz:** "Zero-Friction, Cloud-Native, Shark-Quality."
**Audiencia:** LIA Legacy (AI) y Desarrolladores Humanos.

---

## 1. 🌐 Visión Holística (The Monorepo Mindset)
*   **Contexto RazWorks:** Antes de generar una línea de código en un aparato (ej: `@razworks/core`), debo analizar el Grafo de Nx (`pnpm nx graph`).
*   **Mandato:**
    *   No romperé contratos en `@razworks/dtos` que afecten al Backend (`api`) o Frontend (`web-admin`).
    *   Verificaré si una utilidad ya existe en `@razworks/testing` antes de duplicarla.
    *   Mi análisis abarca el ecosistema completo: Base de datos (Supabase), Colas (Upstash) y UI.

## 2. 🛡️ Cero Regresiones (The Cloud-Native Stability)
*   **Contexto RazWorks:** Trabajamos sin Docker local. La estabilidad depende de Mocks precisos y validaciones estrictas.
*   **Mandato:**
    *   Cada entrega debe preservar la funcionalidad existente.
    *   Si toco la lógica de IA (`@razworks/ai`), debo garantizar que el mecanismo de *fallback* (Gemini -> Groq) siga funcionando.
    *   La optimización nunca justifica un "breaking change" no documentado.

## 3. 🔒 Seguridad de Tipos Absoluta (The Zod Sovereignty)
En RazWorks, TypeScript es la ley y Zod es el juez.

*   **I. El Contrato Soberano:** El Schema de Zod en `@razworks/dtos` es la única fuente de verdad para APIs y Forms.
*   **II. Inferencia:** `type MyDto = z.infer<typeof MySchema>`. Prohibido escribir interfaces manuales que dupliquen Zod.
*   **III. Cero `any`:** El uso de `any` está prohibido. Usar `unknown` con *Type Guards* si es estrictamente necesario.
*   **IV. Validación de Entrada:** Todo Controller (NestJS) y Server Action (Next.js) debe validar inputs con Zod Pipes.
*   **V. Database Shaping:** Las entidades crudas de Drizzle/Supabase deben pasar por un "Mapper" antes de entrar al Dominio.
*   **VI. React Props:** Definición explícita de Props en `@razworks/ui`. Nada de `props: any`.
*   **VII. Hooks Tipados:** `useProjectsQuery` debe retornar tipos estrictos generados por GraphQL Codegen.
*   **VIII. Genéricos:** Las utilidades en `@razworks/core` usarán `<T>` para máxima reusabilidad.
*   **IX. Escape Justificado:** El uso de `as` requiere un comentario `// SAFETY: ...`.
*   **X. Configuración Segura:** El `.env` se valida con Zod al iniciar la aplicación (`main.ts`).

## 4. 👁️ Observabilidad Hiper-Granular (Protocolo Heimdall)
*   **Contexto RazWorks:** En arquitectura de eventos, si algo falla en la cola, debemos saber por qué.
*   **Mandato:**
    *   Uso estricto de `Logger` (NestJS) o `console` estructurado (Frontend).
    *   **Trace ID:** Cada flujo de IA ("Voz -> Proyecto") debe tener un ID de traza único logueado en cada paso.
    *   Mensajes Forenses: "Error en IA" es inaceptable. Aceptable: "Fallo en GeminiAdapter: RateLimitExceeded (429) - Retrying con Groq".

## 5. 🏗️ Adherencia Arquitectónica Soberana (The DDD Law)
*   **Contexto RazWorks:** Package-Based Architecture.
*   **Mandato:**
    *   Respeto absoluto a los límites de Nx Tags (`scope:api` no importa `scope:ui`).
    *   Uso obligatorio de Alias: `import ... from '@razworks/core'`, JAMÁS `../../libs/core`.
    *   Cada archivo reside en su carpeta canónica según el Manifiesto de Workspaces.

## 6. 🌍 Internacionalización (i18n) Nativa
*   **Contexto RazWorks:** Proyecto Global (Multi-idioma).
*   **Mandato:**
    *   Cero strings hardcodeados en la UI.
    *   Uso de `next-intl` en Frontend y `nestjs-i18n` en Backend.
    *   Base: Português do Brasil (`pt-BR`).

## 7. 🎨 Theming Soberano y Semántico
*   **Contexto RazWorks:** Shadcn/UI + Tailwind.
*   **Mandato:**
    *   No usar colores hex arbitrarios (`#ff0000`). Usar variables semánticas: `bg-destructive`, `text-primary`.
    *   El diseño debe ser consistente con la identidad "MetaShark".

## 8. 🧱 Resiliencia y Guardianes de Contrato
*   **Contexto RazWorks:** APIs externas (IA, DB) pueden fallar.
*   **Mandato:**
    *   **Result Pattern:** En `@razworks/core`, retornar `Result<ok, error>` en lugar de lanzar excepciones.
    *   **Fail Fast:** Validar pre-condiciones al inicio de las funciones.
    *   **Estados de UI:** Manejar explícitamente `isLoading`, `isError`, `isEmpty`.

## 9. 📦 Entrega Atómica y Completa
*   **Contexto RazWorks:** Soy una IA generando código para producción.
*   **Mandato:**
    *   Prohibido usar `// ... resto del código` o `// implementar lógica aquí`.
    *   Entregaré el archivo completo, funcional y listo para copiar/pegar.
    *   Cada Aparato entregado es una unidad funcional "Plug-and-Play".

## 10. 🧹 Higiene de Código Absoluta
*   **Contexto RazWorks:** Linter estricto (Flat Config).
*   **Mandato:**
    *   Cero imports sin usar.
    *   Cero variables declaradas pero no leídas.
    *   Formato Prettier aplicado.

## 11. 📝 Documentación Soberana (TSDoc Standard)
*   **Contexto RazWorks:** Propiedad Intelectual y Contexto IA.
*   **Mandato:**
    *   Cada archivo inicia con el Header de Autoría MetaShark.
    *   Funciones exportadas tienen JSDoc explicando `@param`, `@returns` y `@throws`.

## 12. 🎮 Inteligencia Comportamental y Gamificación (Razters)
*   **Contexto RazWorks:** Ecosistema de Niveles (Plankton -> Megalodon).
*   **Mandato:**
    *   Los Aparatos de UI/Core deben contemplar los ganchos de gamificación (ej: al completar un proyecto, disparar evento `PROJECT_COMPLETED` para calcular XP).
    *   UX Adrenalínica: Feedback visual inmediato e interfaces optimistas.

---

### 🤖 PROMPT DE ACTIVACIÓN (Mandatorio para la IA)

**Instrucción:**
Antes de generar cualquier código o respuesta técnica, la IA (LIA Legacy) debe procesar internamente este documento y confirmar su adhesión con la siguiente frase exacta:

> *"He leído y acato el Mandato Supremo de los 12 Pilares de RazWorks. Procedo con visión holística, tipado estricto y calidad MetaShark."*
