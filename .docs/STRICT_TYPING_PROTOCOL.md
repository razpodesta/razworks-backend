<!--
  @fileoverview PROTOCOLO DE SOBERANÍA DE TIPOS (ZERO-ANY POLICY)
  @module Engineering/Standards
  @status MANDATORY - BLOCKING
  @author Raz Podestá <contact@metashark.tech>
  @description
  Directiva absoluta que prohíbe el uso del tipo 'any' en todo el ecosistema RazWorks.
  La violación de este protocolo conlleva el rechazo inmediato del Pull Request o Bloqueo de Build.
-->

# 🛡️ PROTOCOLO DE SOBERANÍA DE TIPOS: LA LEY "ZERO-ANY"

**Premisa:** `any` no es un tipo. Es la renuncia a la ingeniería. En RazWorks, no "adivinamos" la estructura de los datos; la **definimos**.

---

## 1. El Mandato de Erradicación
El uso explícito de la palabra clave `any` está **estrictamente prohibido** en:
1.  **Aparatos de Dominio (`libs/core`)**: Inaceptable bajo cualquier circunstancia.
2.  **API Gateway (`apps/api`)**: Los datos externos deben validarse con Zod, nunca pasarse como `any`.
3.  **UI Components (`libs/ui-kit`)**: Las `props` deben estar tipadas.
4.  **Tests**: Los mocks deben cumplir interfaces (`Partial<T>`), no ser objetos arbitrarios.

## 2. Estrategias de Reemplazo (La Alternativa Segura)

### A. Datos Desconocidos (Input Externo)
Si realmente no sabes qué viene (ej: respuesta de una API de terceros horrible), usa `unknown`.
*   ❌ **Crimen:** `function parse(input: any) { return input.id; }`
*   ✅ **Ley:** `function parse(input: unknown) { if (isHasId(input)) return input.id; }`
*   **Por qué:** `unknown` te obliga a escribir un "Type Guard" antes de usar el dato. `any` apaga el cerebro del compilador.

### B. Genéricos (Reutilización)
No uses `any` para hacer funciones flexibles. Usa `<T>`.
*   ❌ **Crimen:** `const items: any[] = []`
*   ✅ **Ley:** `const items: T[] = []`

### C. Zod Inference (La Verdad)
No escribas tipos manuales para DTOs.
*   ✅ **Ley:** `type UserDto = z.infer<typeof UserSchema>;`

## 3. Excepciones de Seguridad (Protocolo de Contención)
En casos extremos (librerías legacy mal tipadas), se permite el casting (`as`) **SOLO SI** se acompaña de un comentario de seguridad.

```typescript
// SAFETY: La librería 'legacy-lib' retorna any, pero garantizamos por contrato que es un string.
const val = externalLib.getData() as string;
4. Configuración del Sheriff (Linter)
El sistema de CI/CD está configurado para fallar el build (error, no warn) si detecta:
@typescript-eslint/no-explicit-any
@typescript-eslint/explicit-module-boundary-types
🤖 INSTRUCCIÓN PARA LA IA (LIA Legacy)
Si el usuario solicita código y la solución "fácil" implica usar any, la IA debe:
Detenerse.
Analizar la estructura real del dato.
Definir una Interface o Type auxiliar.
Generar el código usando ese tipo estricto.
Respuesta pre-grabada ante solicitud de 'any':
"Mi protocolo de seguridad prohíbe el uso de any. He inferido la interfaz correcta basada en el contexto para garantizar la estabilidad del sistema."
