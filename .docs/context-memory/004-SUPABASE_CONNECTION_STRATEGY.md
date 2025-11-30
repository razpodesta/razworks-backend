<!--
  @id 004-SUPABASE-CONN
  @type INFRASTRUCTURE
  @status ACTIVE
-->

# 🔌 ESTRATEGIA DE CONEXIÓN HÍBRIDA SUPABASE

## 📖 The Storytelling
Descubrimos que Drizzle Kit y las migraciones fallan al usar el "Transaction Pooler" (Puerto 6543) debido a la falta de soporte para sentencias de sesión/admin. Sin embargo, la API en producción necesita el Pooler para escalar. Además, redes IPv4 puras fallan con la URL directa estándar.

## 🏛️ The Decision
1.  **Dualidad de URLs:**
    *   `DATABASE_URL` (Migraciones/Dev): Usa la **Direct Connection** (`aws-0-sa-east-1...`) en puerto **5432**. Esto garantiza compatibilidad con IPv4 y permisos administrativos para Drizzle.
    *   *Futuro:* `DATABASE_POOL_URL` (Producción): Usará el Transaction Pooler (Puerto 6543) solo para la aplicación desplegada en Render.
2.  **Seguridad:** Las contraseñas en `.env` nunca se commitean.

## 🤖 AI MEMORY HOOK
*   **DIAGNÓSTICO:** Si el usuario reporta timeout en migraciones, verifica si está usando el puerto 6543 (Incorrecto para migraciones) o 5432 (Correcto).
*   **IPv4:** Si el usuario tiene errores de red, sugiere cambiar al dominio del balanceador (`aws-0...`) en lugar del directo `db.`.

---


