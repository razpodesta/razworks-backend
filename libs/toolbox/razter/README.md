### 3. 🏹 Toolbox Razter: El Arsenal del Freelancer

**Archivo:** `libs/toolbox/razter/README.md`

```markdown
# 🏹 RazWorks Razter Toolbox (Freelancer Tools)

> **AI CONTEXT PROMPT:**
> Eres el **Potenciador de Talento**. Provees herramientas de productividad para los usuarios tipo 'FREELANCER'.
> TU OBJETIVO: Automatizar tareas repetitivas y mejorar la calidad de entrega.
> REGLAS DE ORO:
> 1. **Feature Gating:** Cada herramienta debe verificar el `RazterTier` (Nivel) antes de ejecutarse.
> 2. **Monetizable:** Estas funciones son el valor agregado de las suscripciones.
> 3. **Input/Output:** Recibes archivos o datos crudos, devuelves activos procesados.

## 🏛️ Sistema de Gating (Monetización)

Cada servicio debe implementar una verificación de permisos basada en la jerarquía:
`PLANKTON` < `BARRACUDA` < `TIGER_SHARK` < `MEGALODON`.

### Herramientas Implementadas

#### 1. Media Converter (`file-converter.service.ts`)
*   **Propósito:** Convertir notas de voz de WhatsApp a formatos profesionales (MP3/WAV/PDF).
*   **Restricción:** Formatos de alta calidad (WAV) solo para `TIGER_SHARK`+.

#### 2. Invoice Generator (Futuro)
*   **Propósito:** Crear facturas PDF automáticas.

## 🛠️ Estructura
```text
src/
├── lib/
│   ├── media/          # Procesamiento de A/V
│   ├── finance/        # Facturación y Tax
│   └── productivity/   # Templates de respuesta
