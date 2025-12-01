<!--
  @title MANIFIESTO DE ARTESANÍA DE CÓDIGO Y LÓGICA DE LUJO
  @id DOC-010-CRAFTSMANSHIP
  @category Engineering/Patterns
  @status LAW (Inmutable)
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 💎 APARATO X: EL MANIFIESTO DE ARTESANÍA DE CÓDIGO

## 1. Filosofía: "Elegancia Computacional"
En RazWorks, el código no solo debe funcionar; debe ser **bello, eficiente y predecible**.
*   **Principio de Complejidad Mínima:** Preferimos código plano sobre anidado. Preferimos lectura lineal sobre saltos lógicos.
*   **Compromiso Big-O:** Todo algoritmo que procese listas debe ser consciente de su complejidad. `O(n^2)` (bucles anidados) es inaceptable para sets de datos > 100 elementos.

## 2. Estándares de Lógica Interna (The Implementation Detail)

### A. Cláusulas de Guarda (Early Returns)
Prohibido el uso de `else` si se puede evitar con un retorno temprano. Reduce la carga cognitiva.

```typescript
// ❌ Sucio
function process(user) {
  if (user) {
    if (user.isActive) {
      // logic...
    }
  }
}

// ✅ Lujo
function process(user) {
  if (!user) return;
  if (!user.isActive) return;
  // logic...
}
B. Idempotencia Mandatoria (Eventos y Pagos)
Dado que usamos BullMQ (Eventos), existe el riesgo de ejecución duplicada.
Regla: Todo Worker o Endpoint de mutación crítica (Pagos, Creación) debe aceptar y verificar una idempotencyKey.
Mecanismo: Verificar en Redis si la clave ya fue procesada en los últimos X minutos. Si es así, retornar el resultado cacheado sin re-ejecutar la lógica.
C. Patrón SAGA (Consistencia Distribuida)
No tenemos transacciones distribuidas (2PC) entre Supabase y servicios externos (Stripe/OpenAI).
Regla: Si una operación toca dos sistemas y el segundo falla, el código debe ejecutar una Compensación (Rollback manual) para revertir el primer cambio.
Ejemplo: Si cobramos en Stripe pero falla el insert en DB -> Reembolsar en Stripe inmediatamente.
3. Higiene Cognitiva y Naming
Variables Explicitas: const t ❌ -> const transactionTimeout ✅.
Funciones Atómicas: Una función debe hacer una sola cosa. Si ocupa más de 30 líneas o tiene más de 3 niveles de indentación, debe refactorizarse.
Números Mágicos: Prohibido if (status === 3). Usar Enums if (status === ProjectStatus.COMPLETED).
4. Instrucciones para la IA (Code Generation Rules)
TÚ (La IA) DEBES:
Evaluar Complejidad: Antes de entregar código, pregúntate: "¿Es esta la forma más legible y eficiente?".
Inyectar Resiliencia: Al escribir un bucle o llamada externa, añade automáticamente manejo de errores y timeouts.
Refactorización Proactiva: Si ves código legado que viola este manifiesto mientras editas un archivo, actualízalo ("Boy Scout Rule": Deja el campamento más limpio de lo que lo encontraste).

---
