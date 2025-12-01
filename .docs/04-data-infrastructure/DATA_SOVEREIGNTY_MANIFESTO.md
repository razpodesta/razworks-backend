<!--
  @title MANIFIESTO DE SOBERANÍA DE DATOS E INFRAESTRUCTURA HÍBRIDA
  @id DOC-004-DATA-INFRA
  @category Architecture/Data
  @status LAW (Inmutable)
  @version 3.0.0 (Consolidated)
  @author Raz Podestá & LIA Legacy
-->

# 🗄️ APARATO IV: LA BÓVEDA DE DATOS (DATA SOVEREIGNTY)

## 1. Visión y Filosofía: "Persistencia Políglota & Híbrida"
En RazWorks, no existe una única "Base de Datos". Existe un ecosistema de persistencia optimizado por caso de uso.

*   **Hot Data (Redis/Upstash):** Estado efímero, colas de trabajos (BullMQ), caché de sesiones y rate limiting. Velocidad <10ms.
*   **Warm Data (Postgres/Supabase):** Tablas relacionales operativas (Usuarios, Proyectos). Consistencia ACID estricta.
*   **Cold/Heavy Data (Postgres + pgvector):** Embeddings vectoriales de IA, logs de auditoría antiguos y cuerpos de texto masivos.

## 2. Estrategia de Conexión: La Regla de los Dos Puertos
(Absorbido de Protocolo 004)

Debido a la naturaleza Serverless (Function-as-a-Service), la gestión de conexiones es crítica.

### A. Puerto 6543 (Transaction Pooler)
*   **Uso:** APLICACIÓN EN PRODUCCIÓN (API, Webhooks).
*   **Tecnología:** Supavisor.
*   **Comportamiento:** Soporta miles de conexiones simultáneas efímeras. No soporta sentencias de sesión (`PREPARE`, `LISTEN/NOTIFY`).
*   **Variable:** `DATABASE_POOL_URL`.

### B. Puerto 5432 (Direct Connection)
*   **Uso:** MIGRACIONES (Drizzle Kit), SEEDING y DEV LOCAL.
*   **Comportamiento:** Conexión TCP directa a la instancia. Soporta cambios de esquema.
*   **Variable:** `DATABASE_URL`.

**MANDATO:** El sistema de despliegue debe inyectar la URL correcta según el contexto (Build vs Runtime).

## 3. Arquitectura de Esquema DDD (Domain-Driven Design)
(Absorbido de Protocolo 003)

### A. Jerarquía de Niveles
Para respetar la integridad referencial, las tablas se crean en orden estricto:
1.  **Nivel 0 (Cimientos):** Extensiones (`vector`, `pgcrypto`) y Enums.
2.  **Nivel 1 (Diccionarios):** Catálogos estáticos (`categories`, `skills`, `tiers`).
3.  **Nivel 2 (Identidad):** `profiles` (Vinculada 1:1 con `auth.users`).
4.  **Nivel 3 (Core):** `projects`, `proposals`, `contracts`.

### B. Nomenclatura Soberana
*   **Tablas:** Inglés, Plural, `snake_case` (ej: `audit_logs`).
*   **Primary Keys:** Siempre `uuid` (v4) generado por la DB (`defaultRandom`).
*   **Foreign Keys:** Formato `singular_id` (ej: `owner_id`, `project_id`).

### C. Integridad de Datos
*   **Soft Delete:** Nunca borrar filas maestras (`profiles`, `projects`). Usar columna `deleted_at` o status `ARCHIVED`.
*   **Zero-Fat Audit:** En tablas de alto volumen (`audit_logs`), no guardar strings repetitivos ("LOGIN_SUCCESS"). Referenciar IDs de diccionarios (`action_id`) para ahorrar espacio en disco.

## 4. Patrones de Rendimiento (Elite Patterns)

### El Patrón "Split-Table"
Para optimizar las consultas de UI (listados), separamos los datos pesados de los metadatos.

*   **Tabla Ligera (`projects`):** Contiene `title`, `status`, `budget`, `owner_id`. Se consulta en cada render de UI.
*   **Tabla Pesada (`project_embeddings`):** Contiene `full_description`, `embedding` (vector 1536 dim). Se consulta **SOLO** al hacer click en "Detalle" o búsquedas de IA.
*   **Relación:** 1:1 con `ON DELETE CASCADE`.

## 5. Instrucciones para la IA (Generative Data Rules)

**TÚ (La IA) DEBES:**

1.  **Respetar Drizzle:** Generar esquemas usando `drizzle-orm/pg-core`.
2.  **Índices Inteligentes:** Al crear una tabla, siempre definir índices en columnas usadas para `WHERE`, `JOIN` o `ORDER BY`.
3.  **No Logic in DB:** Evitar Stored Procedures complejos (PL/pgSQL). La lógica de negocio vive en el `Core` (Typescript), la DB solo guarda estado.

## 6. Estructura Canónica (`libs/database`)

```text
libs/database/src/
├── schema/             # Definiciones de Tablas (Single Source of Truth)
│   ├── profiles.table.ts
│   ├── projects.table.ts
│   └── schema-index.ts # Barrel file
├── migrations/         # Archivos .sql inmutables (Generados por Drizzle)
├── seed/               # Scripts de población inicial (Diccionarios)
└── client.ts           # Factory de conexión (Detecta Pooler vs Direct)

---

