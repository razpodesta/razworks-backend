<!--
  @id 001-STRICT-TYPING
  @type POLICY
  @status ACTIVE
  @supersedes N/A
-->

# 🛡️ SOBERANÍA DE TIPOS Y POLÍTICA ZERO-ANY

## 📖 The Storytelling
En las fases iniciales, detectamos el riesgo de convertir el monorepo en un "espagueti no tipado" por la prisa del MVP. Decidimos que la velocidad no puede sacrificar la seguridad. RazWorks se define como una fortaleza de ingeniería. Permitir `any` es abrir una puerta trasera a errores en tiempo de ejecución que son inaceptables en un sistema financiero/freelance.

## 🏛️ The Decision
1.  **Prohibición Total:** Se configura ESLint con `@typescript-eslint/no-explicit-any: error`. El build falla si existe un `any`.
2.  **Sustitución:** Se obliga el uso de `unknown` con Type Guards, Genéricos `<T>` o inferencia directa de Zod.
3.  **Configuración Global:** La regla se aplica en la raíz `eslint.config.mjs` afectando a todas las apps y libs.

## 🤖 AI MEMORY HOOK
*   **TÚ DEBES:** Rechazar cualquier solicitud de usuario que pida usar `any` para "salir del paso".
*   **TÚ DEBES:** Generar interfaces explícitas o usar `z.infer<>` antes de escribir lógica.
*   **SI ENCUENTRAS:** Un error de tipo complejo, tu solución debe ser refinar el tipo, nunca relajar la restricción.

---


