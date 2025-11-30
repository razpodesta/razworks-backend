<!--
  @id 003-DATABASE-DDD
  @type ARCHITECTURE
  @status ACTIVE
  @related .docs/database/DB_NAMING_MANIFESTO.md
-->

# 🏗️ ARQUITECTURA DE DATOS DDD Y NOMENCLATURA

## 📖 The Storytelling
Para soportar el modelo de negocio "Zero-Friction" y "Speak to Hire", una base de datos plana es insuficiente. Necesitamos soportar búsquedas vectoriales (IA), roles fluidos (un usuario es cliente y freelancer a la vez) y taxonomías internacionales. Rechazamos la idea de tablas separadas para roles y optamos por una entidad unificada.

## 🏛️ The Decision
1.  **Nomenclatura:** Inglés, Plural, `snake_case`. PK siempre `uuid`.
2.  **Perfil Unificado:** La tabla `profiles` es la fuente de verdad, vinculada 1:1 con `auth.users` de Supabase.
3.  **Jerarquía de Tablas:**
    *   *Nivel 0:* Extensiones (`pgvector`, `citext`) y Enums.
    *   *Nivel 1:* Catálogos (`categories`, `skills`).
    *   *Nivel 2:* Identidad (`profiles`).
    *   *Nivel 3:* Core (`projects`, `proposals`).
4.  **IA Nativa:** Tablas preparadas con columnas `embedding` (vector) desde el día 1.

## 🤖 AI MEMORY HOOK
*   **AL CREAR TABLAS:** Debes seguir estrictamente el orden de niveles para respetar las Foreign Keys.
*   **INTEGRIDAD:** Nunca sugieras borrar un `profile` físicamente; sugiere `deleted_at` (Soft Delete).
*   **RELACIONES:** Si un usuario tiene múltiples roles, NO crees tablas `clients` y `freelancers`. Usa flags o roles en `profiles`.

---


