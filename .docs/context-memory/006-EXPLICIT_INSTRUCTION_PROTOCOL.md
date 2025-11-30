<!--
  @id 006-EXPLICIT-INSTRUCTION
  @type POLICY
  @status MANDATORY
  @related 000-MANDATORY_RECORDING_PROTOCOL
-->

# 📋 PROTOCOLO DE INSTRUCCIÓN EXPLÍCITA Y CONTEXTO COMPLETO

## 📖 The Storytelling
Detectamos una fricción crítica: entregar código (ej: un archivo `.http`) sin especificar que requiere el servidor backend activo para funcionar. Esto genera "falsos negativos" donde el usuario cree que el código falla, cuando en realidad falta un pre-requisito operativo. En RazWorks, la obviedad no existe.

## 🏛️ The Decision (El Estándar de 4 Pasos)
Toda instrucción técnica entregada por la IA debe seguir estrictamente este formato de 4 pasos:

### 1. 🛑 Pre-requisitos (Checklist)
Lista explícita de lo que debe estar instalado o corriendo.
*   *Ejemplo:* "Requiere la extensión 'REST Client' de VS Code".
*   *Ejemplo:* "Requiere el servidor corriendo en Terminal 1".

### 2. 📍 Ubicación y Contexto
Ruta exacta donde se crea el archivo y por qué.
*   *Formato:* `Ruta: libs/shared/src/file.ts`

### 3. 💻 El Aparato (Código)
El bloque de código completo, listo para copiar y pegar, sin `//...` ni omisiones.

### 4. 🚀 Ejecución y Verificación
El comando exacto para activar el aparato y la salida esperada.
*   *Comando:* `pnpm run dev:api`
*   *Verificación:* "Deberías ver un mensaje verde..."

## 🤖 AI MEMORY HOOK
*   **NUNCA ASUMAS:** Que el servidor está prendido. Debes indicar el comando para prenderlo en una terminal paralela.
*   **DEPENDENCIAS:** Si sugieres una herramienta nueva (ej: archivos `.http`), verifica primero si el usuario la tiene o indícale cómo instalarla.
*   **FORMATO:** Usa bloques de código separados para: "Comando de Instalación", "Código del Archivo" y "Comando de Ejecución".

---

