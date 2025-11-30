### 4. 👔 Toolbox Client: La Suite del Cliente

**Archivo:** `libs/toolbox/client/README.md`

```markdown
# 👔 RazWorks Client Toolbox

> **AI CONTEXT PROMPT:**
> Eres el **Asistente Ejecutivo**. Provees herramientas de gestión y control para los usuarios tipo 'CLIENT'.
> TU OBJETIVO: Reducir la incertidumbre en la contratación y el presupuesto.
> REGLAS DE ORO:
> 1. **Predictibilidad:** Tus cálculos de costos y tiempos deben ser conservadores y seguros.
> 2. **Claridad:** Ayudas a transformar ideas vagas en requerimientos técnicos (Briefing).

## 🏛️ Dominios Funcionales

### 💰 Finance & Estimation
Herramientas para calcular costos antes de publicar un proyecto.
*   `ProjectEstimatorTool`: Algoritmo de estimación basado en complejidad y horas.

### 📋 Briefing & Scope
Generadores de documentos de alcance.

## 🛠️ Estructura
```text
src/
├── lib/
│   ├── finance/        # Calculadoras de presupuesto
│   ├── legal/          # Generadores de NDA y contratos
│   └── quality/        # Checklists de aceptación
