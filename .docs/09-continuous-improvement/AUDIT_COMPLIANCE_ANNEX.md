<!--
  @title ANEXO DE CUMPLIMIENTO DE AUDITORÍA Y MEJORA CONTINUA
  @id DOC-009-AUDIT-ANNEX
  @category Governance/Audit
  @status ACTIVE
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 📈 APARATO IX: ANEXO DE CUMPLIMIENTO Y OPTIMIZACIÓN

Este anexo documenta las discrepancias detectadas y las resoluciones aplicadas para garantizar la sincronización total entre la Documentación (La Ley) y el Código (La Ejecución).

## 1. Sincronización del Córtex Cognitivo (Fix AI)

Se detectó una divergencia en las versiones del modelo LLM.
*   **Corrección:** Se estandariza el uso de la serie `1.5` (Estable) hasta la liberación oficial de la serie `2.0/2.5`.

### Matriz de Modelos Vigente
| Rol | Modelo Código | Temperatura | Propósito |
| :--- | :--- | :--- | :--- |
| **Architect** | `gemini-1.5-pro-latest` | 0.7 | Razonamiento, JSON complejo. |
| **Clerk** | `gemini-1.5-flash-latest` | 0.1 | Chat rápido, Traducción. |

## 2. Higiene del Árbol de Directorios (Cleanup Protocol)

Para evitar la entropía, se establecen las siguientes reglas de exclusión:
1.  **Prohibido:** Carpetas `context-memory` fuera de `.docs/legacy-archive`.
2.  **Prohibido:** Archivos `README.md` en `libs/*` que contengan documentación de negocio. Deben apuntar a `.docs/`.

## 3. Mapa de Trazabilidad (Doc -> Code)

Garantía de que cada Aparato Documental tiene su contraparte en código:

*   **01-core-domain** -> `libs/core` (✅ Validado)
*   **02-cognitive-system** -> `libs/ai-system` + `libs/whatsapp-engine` (⚠️ Corregir Config)
*   **03-security-boundary** -> `libs/security` + `hmac.guard.ts` (✅ Validado)
*   **04-data-infrastructure** -> `libs/database` (✅ Validado)
*   **05-event-architecture** -> `libs/whatsapp-engine/workers` (✅ Validado)
*   **06-frontend-experience** -> `apps/web-admin` (✅ Validado)
*   **07-lifecycle-devops** -> `scripts/` + `tests/` (✅ Validado)
*   **08-business-logic** -> *Pendiente implementación de Gamification Service*

## 4. Optimizaciones Futuras (Backlog)
1.  **Shared Types:** Mover `RazterTier` y `UserRole` de `libs/core` a `libs/shared/dtos` para que el Frontend pueda consumirlos sin importar el Core completo.
2.  **Storage:** Implementar `libs/storage` para manejo de archivos en Supabase (actualmente faltante).
3. 🛠️ EJECUCIÓN TÉCNICA (Correcciones y Limpieza)
Realiza estos pasos secuencialmente para sanar el proyecto.
PASO A: Crear el Anexo
Crea manualmente el archivo .docs/09-continuous-improvement/AUDIT_COMPLIANCE_ANNEX.md con el contenido de arriba. Crea la carpeta 09-continuous-improvement primero.
PASO B: Corrección de Código (AI Config)
Sobrescribe el archivo libs/ai-system/src/lib/ai-config.ts con este contenido corregido (versiones reales):
code
TypeScript
/**
 * @fileoverview CONFIGURACIÓN DE MODELOS IA (AUDITED)
 * @module Libs/AiSystem/Config
 * @description Fuente de verdad alineada con AI_COGNITIVE_BLUEPRINT.md
 */

export const AI_MODELS = {
  FAST: 'gemini-1.5-flash',
  THINKING: 'gemini-1.5-pro',
  LEGACY: 'gemini-1.0-pro',
} as const;

export const AI_CONFIG = {
  TEMPERATURE: {
    CREATIVE: 0.7,
    PRECISE: 0.1,
  },
} as const;

---

