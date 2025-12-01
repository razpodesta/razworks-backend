<!--
  @title MANIFIESTO DE SOBERANÍA DEL DOMINIO Y ARQUITECTURA HEXAGONAL
  @id DOC-001-CORE-DOMAIN
  @category Architecture/Core
  @status LAW (Inmutable)
  @version 3.1.0 (Rich-Content)
  @author Raz Podestá & LIA Legacy
-->

# 🏛️ APARATO I: EL NÚCLEO SOBERANO (DOMAIN SOVEREIGNTY)

## 1. Visión y Filosofía: "The Sacred Core"
El directorio `libs/core` es el corazón del sistema.
*   **Principio de Ignorancia Tecnológica:** El Dominio **NO SABE** que existe una base de datos, API REST, NestJS o React.
*   **Principio de Inmutabilidad Externa:** Si cambiamos la API por un CLI, el Core no cambia.

## 2. Arquitectura Hexagonal (Ports & Adapters)

### A. Entidades (The Truth)
Objetos con identidad única (`id`) y comportamiento.
*   ❌ **Prohibido:** Modelos anémicos (solo datos).
*   ✅ **Mandatorio:** Constructores privados o factories estáticas para garantizar validez.

### B. Value Objects (The Quantities)
Objetos inmutables definidos por sus atributos (ej: `Email`, `Money`). Deben auto-validarse al instanciarse (usando Zod internamente).

### C. Puertos (The Interfaces)
Contratos que el mundo exterior debe cumplir.
*   *Ubicación:* `libs/core/src/ports/*`
*   *Ejemplo:* `export interface IUserRepository { save(user: User): Promise<void>; }`

### D. Domain Services vs. Use Cases (Distinción Crítica)
*   **Use Cases:** Orquestan la aplicación (Entrada DTO -> Validación -> Repo -> Salida DTO). Pertenecen a la capa de Aplicación (o `use-cases` dentro del módulo).
*   **Domain Services:** Lógica de negocio que involucra múltiples entidades pero no pertenece a ninguna (ej: `CurrencyConverter`, `TaxCalculator`). Viven en `libs/core/src/services`.

## 3. Protocolo de Tipado Estricto (Zero-Any Policy)

1.  **Prohibición Total:** El uso de `any` es motivo de rechazo de PR.
2.  **Sustitución:** Usar `unknown` con Type Guards, Genéricos `<T>` o inferencia de Zod.
3.  **Seguridad:** No "adivinamos" la estructura; la definimos en `libs/shared/dtos`.

## 4. Protocolo de Manejo de Errores (The Result Pattern)

En el Core, **NO SE LANZAN EXCEPCIONES** para flujos de negocio.
Todo método debe retornar un `Result<T, E>`.

```typescript
// ✅ Correcto (Estilo Elite Domain)
if (saldo < monto) return Result.fail(new InsufficientFundsError(monto));

---


