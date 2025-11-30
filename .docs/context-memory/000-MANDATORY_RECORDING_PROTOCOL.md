<!--
  @fileoverview PROTOCOLO DE REGISTRO DE DECISIONES Y MEMORIA DE PROYECTO
  @id 000-PROTOCOL
  @type META-INSTRUCTION
  @status ACTIVE
-->

# 🧠 SISTEMA DE MEMORIA Y CONTINUIDAD (ADR + STORYTELLING)

## 1. Propósito
Este directorio `.docs/context-memory` funciona como el hipocampo del proyecto RazWorks. Su objetivo es proporcionar a la IA un contexto profundo, cronológico y justificado de por qué el sistema es como es.

## 2. Estructura Mandatoria de Archivos
Cada decisión arquitectónica significativa debe registrarse en un archivo `.md` numerado secuencialmente (`001-...`, `002-...`) con las siguientes secciones OBLIGATORIAS:

### A. Metadatos (Frontmatter HTML)
Debe incluir `@id`, `@type` (Architecture, Logic, Policy), y `@status`.

### B. 📖 The Storytelling (El Contexto Narrativo)
Explicación humana de la situación. ¿Qué dolor teníamos? ¿Qué intentamos resolver? Aquí se captura la intención del negocio y la lógica difusa que llevó a la decisión.

### C. 🏛️ The Decision (La Arquitectura Dura)
Especificaciones técnicas concretas. Nombres de tablas, patrones de diseño (SOLID, DDD), librerías elegidas y versiones.

### D. 🤖 AI MEMORY HOOK (La Directiva de Activación)
Un prompt explícito en segunda persona ("Tú debes...") dirigido a la IA futura. Instrucciones claras sobre qué restricciones respetar al generar código relacionado con este tema.

## 3. Reglas de Inmutabilidad
*   Las decisiones pasadas no se borran; se marcan como `@status DEPRECATED` si cambian, y se crea un nuevo registro que referencia al anterior ("Supersedes: 00X").
*   Esto permite a la IA entender la evolución y evitar repetir errores del pasado.

**INSTRUCCIÓN DE ACTIVACIÓN:**
Al analizar el proyecto, la IA debe leer secuencialmente estos archivos para reconstruir el modelo mental del arquitecto antes de proponer cambios.

---


