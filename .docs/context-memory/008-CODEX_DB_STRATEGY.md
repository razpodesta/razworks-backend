<!--
  @id 008-CODEX-DB-STRATEGY
  @type ARCHITECTURE
  @status ACTIVE
  @version 1.0.0
-->

# 🛡️ ESTRATEGIA DE PERSISTENCIA DEL CÓDICE (GAMIFICACIÓN)

## 📖 The Storytelling
El sistema de gamificación "Razters" no es solo un contador de puntos; es un sistema de control de acceso basado en meritocracia. Un usuario en el reino "THE KERNEL" tiene acceso a herramientas que un "THE SCRIPT" no. Necesitamos que la base de datos refleje estos reinos como estados inmutables y auditables, no solo como un string derivado.

## 🏛️ The Decision (Arquitectura de Datos)

### 1. Jerarquía de Tablas
1.  **`dic_tiers` (Catálogo):** Define los umbrales de XP y metadatos de cada Nivel y Reino.
    *   *Clave:* `slug` (ej: 'THE_COMPILER').
    *   *Datos:* `min_xp`, `permissions_json`.
2.  **`profiles` (Extensión):**
    *   Columna `current_realm` (ENUM): Acceso O(1) para Guards.
    *   Columna `total_xp` (INT): Acumulador transaccional.
    *   Columna `reputation_score` (INT): Puntuación flotante basada en calidad.

### 2. Trigger de Evolución (Logic in Code, Not DB)
Contrario a la vieja escuela, **NO usaremos Triggers de SQL** para subir de nivel.
*   **Por qué:** La lógica de "Subir de Nivel" dispara notificaciones, emails y eventos de WebSocket. SQL no puede hacer esto limpiamente.
*   **Mecanismo:** El servicio `GamificationService` (NestJS) es la autoridad única que calcula el cambio, actualiza la DB en una transacción y emite el evento de dominio.

### 3. Integridad de Reinos
El `realm` en la tabla `profiles` debe estar sincronizado matemáticamente con `total_xp`.
*   *Auditoría:* Un script nocturno (`cron`) verificará que `xp >= min_xp` del reino actual para todos los usuarios, alertando anomalías.

## 🤖 AI MEMORY HOOK
*   **GATING:** Al crear un endpoint en `Toolbox`, verifica siempre el `current_realm` del usuario antes de ejecutar.
*   **XP ATÓMICO:** Toda modificación de XP debe ser atómica (`total_xp = total_xp + :delta`).

---


