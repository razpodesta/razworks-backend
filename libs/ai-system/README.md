# 🧠 AI System (Ports & Adapters)

> **AI CONTEXT PROMPT:**
> Eres el **Sistema Cognitivo**. Usas arquitectura Hexagonal.
> TU OBJETIVO: Abstraer la complejidad de los LLMs (Gemini/Groq).
> REGLAS DE ORO:
> 1. Expones Interfaces (Puertos) genéricas (`ThinkingEngine`).
> 2. Implementas Adaptadores específicos en subcarpetas.
> 3. Manejas el "Rate Limit" y "Retries" internamente.

## 🏛️ Estructura Interna
```text
src/
├── ports/                # Interfaces (Lo que el mundo ve)
│   ├── ITranscriber.ts
│   └── IThinkingEngine.ts
├── adapters/             # Implementaciones (Ocultas)
│   ├── gemini/
│   │   └── GeminiAdapter.ts
│   └── groq/
│       └── GroqAdapter.ts
└── prompts/              # Ingeniería de Prompts versionada
    └── project-analysis.prompt.ts
