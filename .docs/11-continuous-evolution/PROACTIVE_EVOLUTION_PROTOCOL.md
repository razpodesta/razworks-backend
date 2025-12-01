<!--
  @title PROTOCOLO DE EVOLUCIÓN CONTINUA Y NIVELACIÓN PROGRESIVA
  @id DOC-011-EVOLUTION
  @category Meta-Instruction/AI
  @status LAW (Active Execution)
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 🔄 APARATO XI: EL PROTOCOLO DE EVOLUCIÓN CONTINUA

## 1. Visión: "El Efecto Mariposa Controlado"
El software es un organismo vivo. Un cambio en una célula (DTO) afecta a los órganos (Servicios) y al cuerpo entero (API).
*   **Misión:** La IA no solo "escribe código"; **gestiona la integridad del ecosistema**.
*   **Proactividad:** No esperes a que el usuario detecte la desincronización. Arréglala antes de entregar.

## 2. La Rutina de Nivelación Obligatoria (The Level-Up Loop)

Cada vez que la IA genera o modifica código, debe ejecutar mentalmente este ciclo de dependencias:

### Escenario A: Modifiqué una Entidad o DTO (`libs/core`, `libs/shared/dtos`)
*   ➡️ **Acción Obligatoria 1:** Verificar si el `MockFactory` en `libs/testing` necesita actualización.
*   ➡️ **Acción Obligatoria 2:** Verificar si el esquema de Base de Datos (`libs/database`) requiere migración.
*   ➡️ **Acción Obligatoria 3:** Verificar si el Frontend (`apps/web-admin`) romperá su compilación.

### Escenario B: Modifiqué un Adaptador de IA (`libs/ai-system`)
*   ➡️ **Acción Obligatoria:** Verificar si los Prompts (`prompts/`) siguen siendo compatibles con el nuevo modelo o lógica.

### Escenario C: Modifiqué una Regla de Seguridad (`libs/security`)
*   ➡️ **Acción Obligatoria:** Escanear (mentalmente) los `Server Actions` y `Controllers` para asegurar que implementan la nueva regla.

## 3. El Estándar de "Respuesta Mejorada"

La IA nunca debe entregar una respuesta aislada. Debe entregar una **Solución Sistémica**.

**Formato de Respuesta Esperado:**
1.  **El Cambio Solicitado:** El código que pidió el usuario.
2.  **El Impacto Colateral:** "Al cambiar esto, noté que el Test Factory quedó obsoleto."
3.  **La Nivelación Proactiva:** "Aquí está el código actualizado del Factory para mantener la coherencia."

## 4. Directiva de Deuda Técnica Cero

Si al analizar un archivo para realizar una tarea, la IA detecta violaciones a los Aparatos I-X (ej: un `any` olvidado, un texto hardcodeado):
*   **MANDATO:** Debe corregirlo silenciosamente como parte de la entrega, o señalarlo explícitamente si es un cambio riesgoso.
*   **Nunca perpetuar el error:** Copiar y pegar código malo existente está prohibido. Se refactoriza al estándar actual.

---
