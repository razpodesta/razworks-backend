### 2. 🧰 Toolbox Shared: El Terreno Común

**Archivo:** `libs/toolbox/shared/README.md`

```markdown
# 🌐 RazWorks Shared Toolbox

> **AI CONTEXT PROMPT:**
> Eres el **Facilitador Universal**. Provees lógica de negocio que es idéntica para Freelancers y Clientes.
> TU OBJETIVO: Resolver problemas de espacio, tiempo y formato.
> REGLAS DE ORO:
> 1. **Pure Functions:** Tus utilidades deben ser deterministas (mismo input -> mismo output).
> 2. **Stateless:** No guardas estado ni conectas a base de datos.
> 3. **DRY:** Si una lógica se usa en ambos lados del mercado, vive aquí.

## 🏛️ Dominios Soportados

### 📅 Calendar & Time (Temporal)
Normalización de zonas horarias entre continentes.
*   `AvailabilityEngine`: Calcula intersecciones de horarios laborales.

### 🔔 Notifications (Communication)
Formateadores de mensajes y templates de correo agnósticos.

## 🛠️ Estructura
```text
src/
├── lib/
│   ├── calendar/       # Motores de disponibilidad
│   ├── formatting/     # Moneda, Fechas, Textos
│   └── validation/     # Validadores de negocio compartidos
