<!--
  @title RAZWORKS MASTER BLUEPRINT: THE ELITE SYSTEM
  @id DOC-MASTER-BLUEPRINT
  @category Architecture/Master
  @status LAW (Inmutable)
  @version 3.0.0 (Code-Aligned)
  @author Raz Podestá & LIA Legacy
-->

# 📘 RAZWORKS: BLUEPRINT MAESTRO DEL PROYECTO (Conceptual & Estratégico)

## 1. 📄 Resumen Ejecutivo y Visión

### 1.1. Definición del Producto
**RazWorks** no es un tablón de anuncios. Es un **Hub de Colaboración Asistida por Inteligencia Artificial**.
*   **Propuesta de Valor (UVP):** "Speak to Hire". Eliminamos la fricción de la contratación remota. El cliente no llena formularios; habla con un "Córtex Digital". La IA estructura el requerimiento, define el stack técnico y encuentra al talento perfecto mediante búsqueda vectorial.
*   **Filosofía:** "Zero-Friction, Zero-Waste".

### 1.2. Objetivos del MVP (Minimum Viable Product)
El alcance funcional crítico se define por la capacidad de completar el ciclo "Voz -> Contrato" sin intervención humana administrativa.
*   **Crítico:** Ingesta omnicanal (WhatsApp/Web), Procesamiento de IA (Audio/Texto), Matching Vectorial, Gestión de Identidad (Roles).
*   **Deseable (Post-MVP):** Generación automática de contratos legales en PDF, Pagos en Crypto.

### 1.3. Modelo de Negocio Técnico (Estrategia Zero-Cost)
Operamos bajo una arquitectura **"Cloud-Native Localhost"**.
*   **Desarrollo:** Sin Docker. El código corre en el host, la infraestructura (DB, Redis, AI) es remota y gestionada (Serverless).
*   **Costos:** Optimizados para Free Tiers de élite (Supabase, Vercel, Render, Upstash, Google AI Studio) hasta alcanzar tracción de mercado.

---

## 2. 🏗 Arquitectura y Stack Tecnológico (Deep Dive)

La arquitectura se divide en **7 Aparatos Soberanos** que garantizan desacoplamiento y escalabilidad.

### 2.1. Diagrama de Alto Nivel
Interacción basada en el patrón **BFF Virtual (Backend For Frontend)** y **Event-Driven Architecture**.

1.  **Usuario:** Interactúa con `apps/web-admin` (Next.js en Vercel).
2.  **Frontera Segura:** Las peticiones de escritura pasan por *Server Actions*, se firman con HMAC (Aparato III) y viajan al Backend.
3.  **API Gateway:** `apps/api` (NestJS en Render) recibe la petición, valida la firma y despacha un evento.
4.  **Sistema Nervioso:** `Upstash Redis` (BullMQ) encola el trabajo (Aparato V).
5.  **Córtex Cognitivo:** Workers especializados (Audio, Visión, Seguridad) procesan la información usando `libs/ai-system` (Aparato II).
6.  **Persistencia:** Los resultados se guardan en `Supabase` (PostgreSQL + pgvector) (Aparato IV).

### 2.2. Selección de Tecnologías (Justificación)

#### 2.2.1. Monorepo: Nx (Gestión de Workspace)
*   **Rol:** Orquestador de construcción.
*   **Política:** Uso estricto de `pnpm` y límites de módulo (`@nx/enforce-module-boundaries`) para evitar dependencias circulares.

#### 2.2.2. Backend: NestJS + Fastify
*   **Rol:** API Gateway y Worker Host.
*   **Justificación:** Arquitectura modular, inyección de dependencias robusta y performance superior a Express.

#### 2.2.3. Frontend: Next.js (App Router)
*   **Rol:** Interfaz Soberana (`apps/web-admin`).
*   **Tecnología:** React Server Components (RSC), Tailwind CSS v4, Shadcn/UI (`libs/ui-kit`).
*   **Justificación:** SEO nativo, seguridad en el lado del servidor y despliegue atómico en Vercel.

#### 2.2.4. Base de Datos: Supabase (Infraestructura Híbrida)
*   **Rol:** Bóveda de Datos (Aparato IV).
*   **Estrategia:** Conexión dual.
    *   Puerto `5432`: Migraciones directas (Drizzle Kit).
    *   Puerto `6543`: Transaction Pooler para la Aplicación (Serverless friendly).

#### 2.2.5. Eventos y Caché: Upstash Redis + BullMQ
*   **Rol:** Sistema Nervioso (Aparato V).
*   **Estrategia:** Topología de colas con "Smart Polling" y "Exponential Backoff" para respetar límites de cuota.

#### 2.2.6. Inteligencia Artificial: Google Gemini (Córtex)
*   **Rol:** Motor de Razonamiento (Aparato II).
*   **Estrategia:** Cadena de Responsabilidad.
    *   *Architect:* `gemini-1.5-pro` (Razonamiento complejo).
    *   *Clerk:* `gemini-1.5-flash` (Velocidad/Backup).

### 2.3. Diseño de Solución Desacoplada
Implementamos una **Defensa Isomórfica**. El código de seguridad (`libs/security`) detecta si corre en Node.js o en el Navegador y bloquea el uso de primitivas criptográficas inseguras en el cliente.

---

## 3. 📏 Convenciones de Ingeniería y Estándares de Código

### 3.1. Principios de Diseño
*   **SOLID:** Aplicado rigurosamente en `libs/core`.
*   **Arquitectura Hexagonal:** El dominio (`libs/core`) desconoce la existencia de HTTP o bases de datos. Define `Puertos` (Interfaces) que la infraestructura implementa.
*   **DRY (Don't Repeat Yourself):** Toda lógica compartida vive en `libs/shared/utils` o `libs/shared/dtos`.

### 3.2. Estilo de Código y Linter
*   **Soberanía de Tipos (Zero-Any Policy):** Prohibición total del tipo `any`. Uso obligatorio de genéricos `<T>`, `unknown` con guardas, o inferencia Zod.
*   **Configuración:** ESLint Flat Config (`eslint.config.mjs`) en la raíz.

### 3.3. Performance First
*   **Split-Table Pattern:** Separación de datos "ligeros" (títulos, estados) de datos "pesados" (embeddings vectoriales, descripciones largas) en la base de datos.
*   **Optimización de Payload:** DTOs serializados para minimizar el tráfico de red.

### 3.4. Seguridad (Aparato III)
*   **Sanitización:** Todos los inputs pasan por `ZodValidationPipe`.
*   **Logs Blindados:** El logger (`libs/logging`) redacta automáticamente `password`, `token` y `credit_card`.
*   **Cifrado:** Protocolo AEAD (AES-256-GCM) para datos en reposo y HMAC-SHA256 para integridad en tránsito.

---

## 4. 🧪 Estrategia de Testing y QA (Ruta Espejo)

### 4.1. Filosofía de Pruebas
Pirámide de Testing invertida para Serverless: Énfasis en Pruebas Unitarias de Dominio y E2E de Flujo Crítico.

### 4.2. Estructura de Directorios Espejo
Los tests no ensucian el código fuente. Viven en una raíz paralela `tests/`.
*   Fuente: `apps/api/src/modules/auth/auth.service.ts`
*   Test: `tests/apps/api/modules/auth/auth.service.spec.ts`

### 4.3. Fábrica de Mocks Centralizada
*   **Ubicación:** `libs/testing/src/factories`.
*   **Herramienta:** `@faker-js/faker` con locale `pt_BR` (Mandatorio para alineación regional).
*   **Regla:** Prohibido crear objetos literales "hardcoded" en los tests. Usar `UserFactory.create()`.

---

## 5. 📦 Estructura del Monorepo (Nx Workspace)

La estructura física refleja los 7 Aparatos Conceptuales.

### 5.1. Apps (Aplicaciones Desplegables)
*   `apps/api`: Backend Gateway (NestJS).
*   `apps/web-admin`: Panel de Control y CMS (Next.js).
*   `apps/webapp` (Futuro): PWA Principal para usuarios finales.

### 5.2. Libs (Librerías Compartidas)
*   `libs/core`: **Aparato I**. Entidades, Value Objects y Casos de Uso puros.
*   `libs/ai-system`: **Aparato II**. Adaptadores de IA y Prompts.
*   `libs/security`: **Aparato III**. Servicios de Encriptación y Firma.
*   `libs/database`: **Aparato IV**. Esquemas Drizzle y Clientes de Conexión.
*   `libs/whatsapp-engine`: **Aparato V**. Motor de eventos y flujos de mensajería.
*   `libs/ui-kit`: **Aparato VI**. Componentes de UI atómicos.
*   `libs/logging`: Observabilidad y métricas.
*   `libs/shared/dtos`: Contratos de datos Zod compartidos.
*   `libs/toolbox`: Herramientas de negocio (Calculadoras, Conversores).

---

## 6. 🚀 Definición del MVP (Alcance Funcional)

### 6.1. Módulo de Autenticación
*   **Identidad:** Supabase Auth (Provider) + `profiles` table (Dominio).
*   **Roles:** RBAC estricto (`CLIENT`, `FREELANCER`, `ADMIN`).

### 6.2. Módulo de IA Conversacional (Córtex)
*   **Fan-Out:** Recepción de mensaje -> Activación de Workers (Audio/Visión/Seguridad).
*   **Fan-In:** El Orquestador sintetiza los resultados y genera una respuesta estratégica.
*   **Modo:** Thinking Mode (`gemini-1.5-pro`) para análisis de requerimientos.

### 6.3. Módulo de Proyectos
*   **Gestión:** CRUD completo con patrón Split-Table.
*   **Inteligencia:** Generación automática de Embeddings (`pgvector`) al publicar.

### 6.4. Módulo de Marketplace
*   **Búsqueda:** Búsqueda híbrida (Keyword + Semántica) usando `textSearch` y `cosineDistance`.

### 6.5. Gamificación (Razters Ecosystem)
*   **Lógica:** Sistema de niveles (`Plankton` -> `Megalodon`) basado en XP.
*   **Implementación:** Eventos de dominio (`ProjectCompleted`) disparan cálculo de reputación asíncrono.

---

## 7. 📅 Roadmap de Ejecución (Sprints Tácticos)

### Sprint 0: "The Foundation" (Completado)
*   Configuración de Nx, TypeScript Strict, ESLint Flat Config.
*   Infraestructura Cloud (Supabase, Upstash, Google AI) provisionada.
*   Diagnósticos de conexión (`scripts/audit-infra`) operativos.

### Sprint 1: "Identity & Core Backend" (En Progreso)
*   Implementación de `AuthModule` y `SecurityModule` (HMAC).
*   Diseño de base de datos DDD (`libs/database`).
*   Frontend Base (`apps/web-admin`) con UI Kit.

### Sprint 2: "The AI Brain" (Siguiente)
*   Refinamiento del `whatsapp-engine` con BullMQ Flows.
*   Implementación de la estrategia de Fallback en `libs/ai-system`.
*   Pruebas de estrés del Córtex con audios reales.

### Sprint 3: "Conversational UI & Project Genesis"
*   Interfaz de Chat en `web-admin` para simulaciones.
*   Lógica de conversión "Conversación -> JSON Estructurado".
*   Persistencia de Proyectos y generación de vectores.

### Sprint 4: "The Marketplace & Launch"
*   Buscador semántico en Backend.
*   Dashboard de métricas en Frontend.
*   Despliegue a Producción (Render + Vercel).
*   Auditoría de seguridad final.

---
ACTUALIZACION DE L CONTEXTO ANTERIOR

### 2.1. Diagrama de Alto Nivel (Updated v2)
Interacción basada en el patrón **BFF Virtual** y **Agencia Cognitiva**.

1.  **Usuario:** Interactúa (WhatsApp/Web).
2.  **Gateway:** Recibe, audita (`ConversationLogger`) y encola.
3.  **Sistema Nervioso:** `OrchestratorWorker` toma el trabajo.
4.  **Córtex Cognitivo (V2):**
    *   Verifica `SemanticCache`.
    *   Si es nuevo, consulta `ToolRegistry` para ver qué herramientas tiene el usuario.
    *   Ejecuta `AgenticLoop` (Gemini + Tools).
    *   Registra costos en `TokenMeter`.
5.  **Acción:** El sistema ejecuta la herramienta (ej: `BudgetEstimator`) y responde.

...

#### 2.2.7. Toolbox & Agencia (Nuevo Aparato)
*   **Rol:** Ejecución de Tareas de Negocio.
*   **Estrategia:** Protocolo `RazTool`. Las herramientas son "Plugins" que la IA puede invocar de forma segura y tipada.

---



