<!--
  @title PROTOCOLO DE LINTING GRANULAR Y GOBERNANZA DE CÓDIGO
  @id DOC-007-LINTING
  @category DevOps/Quality
  @status LAW (Inmutable)
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 🧹 PROTOCOLO DE LINTING GRANULAR: LA LEY DEL CÓDIGO LIMPIO

## 1. Filosofía: "Higiene Atómica"
En RazWorks, no confiamos en ejecuciones masivas ciegas. Preferimos la validación atómica por "Aparato" (Workspace) para aislar errores y garantizar que la deuda técnica no se esconda en el ruido de un log gigante.

## 2. El Comando Estándar (The Golden Standard)
El comando base para validar un aparato específico es:

```cmd
pnpm nx lint [nombre-del-proyecto]
3. Catálogo de Comandos Granulares

A. Aplicaciones (Workspaces Principales)
Aparato	Comando de Validación
API Gateway	pnpm nx lint api
Web Admin	pnpm nx lint web-admin
API E2E	pnpm nx lint api-e2e
Web Admin E2E	pnpm nx lint web-admin-e2e

B. Librerías de Infraestructura (The Engine Room)
Aparato	Comando de Validación
Core Domain	pnpm nx lint core
Database	pnpm nx lint database
AI System	pnpm nx lint ai-system
WhatsApp Engine	pnpm nx lint whatsapp-engine
Security	pnpm nx lint security
Logging	pnpm nx lint logging

C. Librerías Compartidas y UI (The Glue)
Aparato	Comando de Validación
Shared DTOs	pnpm nx lint dtos
Shared Utils	pnpm nx lint utils
UI Kit	pnpm nx lint ui-kit
Testing Factory	pnpm nx lint testing

D. Toolbox (Herramientas de Negocio)
Aparato	Comando de Validación
Toolbox Client	pnpm nx lint client
Toolbox Razter	pnpm nx lint razter
Toolbox Shared	pnpm nx lint shared
4. Modos de Ejecución Avanzada
Modo Autocorrección (The Auto-Fixer)
Si el error es estilístico (espacios, comas, imports desordenados), usa este comando para que ESLint lo arregle automáticamente:


pnpm nx lint [nombre-del-proyecto] --fix
Modo Forense (Verbose)
Si el linter falla y no es obvio por qué, usa el flag verbose para ver la regla exacta que se está violando:


pnpm nx lint [nombre-del-proyecto] --verbose
Modo de Impacto (Affected)
Para verificar SOLO lo que has modificado en tu rama actual respecto a master (Ahorra tiempo):


pnpm nx affected -t lint
5. Regla de Oro del Commit
Está estrictamente prohibido realizar un commit si alguno de estos comandos devuelve error. El CI/CD rechazará automáticamente cualquier código sucio.


---

### 🚀 EJECUCIÓN INMEDIATA (Cheat Sheet)

¡Raz! Aquí tienes la secuencia de comandos para copiar y pegar en tu terminal ahora mismo y verificar la salud de cada órgano del sistema, uno por uno:

**1. Validar el Núcleo y la Base:**

pnpm nx lint core --fix
pnpm nx lint database --fix
pnpm nx lint security --fix
pnpm nx lint dtos --fix
pnpm nx lint utils --fix
pnpm nx lint testing --fix
pnpm nx lint logging --fix
pnpm nx lint ai-system --fix
pnpm nx lint whatsapp-engine --fix
pnpm nx lint client --fix
pnpm nx lint razter --fix
pnpm nx lint shared --fix
pnpm nx lint ui-kit --fix
pnpm nx lint web-admin --fix
pnpm nx lint api --fix

---
