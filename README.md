<div align="center">

# 🦈 RazWorks
### The AI-First Freelance Ecosystem

![Status](https://img.shields.io/badge/Status-In__Development-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)
![Maintainer](https://img.shields.io/badge/Maintainer-MetaShark__Tech-00d1b2?style=for-the-badge)

<p align="center">
  <b>"Speak to Hire."</b><br>
  La primera plataforma de freelancing impulsada por Modelos de Pensamiento (Thinking AI),
  internacionalización nativa y una arquitectura orientada a eventos.
</p>

[Explorar Docs](./docs) • [Reportar Bug](https://github.com/metashark-tech/razworks/issues) • [Solicitar Feature](https://github.com/metashark-tech/razworks/issues)

</div>

---

## 🚀 Visión del Proyecto
**RazWorks** elimina la fricción en la contratación remota. A diferencia de las plataformas tradicionales basadas en formularios interminables, RazWorks utiliza **Inteligencia Artificial Generativa** para entrevistar al cliente, estructurar requerimientos técnicos y realizar un emparejamiento semántico (Vector Match) con freelancers.

> **Zero-Friction Philosophy:** El cliente habla, la IA estructura, el trabajo se realiza.

## 🛠️ Tech Stack & Arquitectura (Cloud-Native)

Nuestra arquitectura sigue el **ADR 001**: Desarrollo "Cloud-Native Localhost" sin contenedores locales, apoyándose en servicios serverless gestionados.

| Dominio | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Monorepo** | ![Nx](https://img.shields.io/badge/Nx-143055?style=flat-square&logo=nx&logoColor=white) | Orquestación de Workspaces y Build System. |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white) | SSR, App Router y UI Reactiva. |
| **Backend** | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white) | API Gateway, Microservicios y Lógica de Negocio. |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | PostgreSQL, Auth, y Vector DB (`pgvector`). |
| **Eventos** | ![Redis](https://img.shields.io/badge/Upstash_Redis-00E599?style=flat-square&logo=redis&logoColor=white) | Colas (BullMQ), Caché y Pub/Sub Serverless. |
| **AI Core** | ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white) | Motor de Pensamiento, Transcripción y NLP. |
| **Paquetería** | ![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white) | Gestión eficiente de dependencias y workspaces. |

### 🧬 Flujo de Datos (Arquitectura de Eventos)

```mermaid
graph LR
    A[Usuario (Voz)] -->|Upload| B(Next.js Client)
    B -->|Mutation| C{NestJS API}
    C -->|Job: AudioUploaded| D[Upstash Redis]
    D -->|Consume| E[AI Worker Service]
    E -->|Transcribe & Think| F[Gemini / Groq]
    F -->|JSON Draft| E
    E -->|Event: DraftReady| G((Supabase DB))
    G -->|Realtime| B
💎 Funcionalidades Clave

🧠 AI Concierge "LIA Legacy"
Multimodal Input: Acepta voz, texto o imágenes de bocetos.
Proactive Refinement: Si el requerimiento es vago, la IA genera preguntas de clarificación inteligentes.
Auto-Translation: Chat en tiempo real con traducción técnica contextual.
🎮 Gamificación "MetaShark Ecosystem"
Sistema de retención basado en la cadena alimenticia oceánica:
Freelancers (The Hunter Path):
🦠 Plankton: Nivel inicial.
🦈 Barracuda: Desbloquea "Ofertas Express".
🐅 Tiger Shark: Fee de plataforma reducido.
🦖 Megalodon: Acceso a clientes Enterprise y Soporte VIP.
Clientes (The Provider Path):
Badges por claridad en requerimientos y velocidad de pago.
📂 Estructura del Monorepo (Package-Based)

razworks/
├── apps/
│   ├── api/            # Backend (NestJS + Fastify)
│   └── web-client/     # Frontend (Next.js + Tailwind)
├── libs/
│   ├── core/           # Lógica de Negocio Pura (Entities)
│   ├── shared-dtos/    # Contratos Zod compartidos (Backend <-> Frontend)
│   ├── ui-kit/         # Componentes React (Shadcn/UI)
│   └── testing/        # Factories y Mocks centralizados
└── tests/              # Estrategia de "Ruta Espejo" (QA)

🧪 Manifiesto de Calidad (QA)
Implementamos una estrategia de pruebas estricta definida en TESTING_MANIFESTO.md.
Idioma: Todas las pruebas (describe, it) se redactan en Português do Brasil 🇧🇷.
Estrategia: Ruta Espejo (tests/ vs src/).
Tecnología: Jest (Unit/Integration) + Playwright (E2E).
Zero-Docker: Las pruebas utilizan Mocks en memoria o servicios remotos dedicados.
🏁 Roadmap de Fases

Sprint 0: Setup de Monorepo, Nx, Linting y Conexión Cloud (Supabase/Upstash).

Sprint 1: Identidad Digital (Auth) y Base de Datos.

Sprint 2: The AI Brain (Integración Gemini + Colas de Trabajo).

Sprint 3: Interfaz Conversacional (Voice UI).

Sprint 4: Gestión de Proyectos y Vectores.

Sprint 5: Marketplace y Buscador Semántico.

Sprint 6: Lanzamiento MVP.
⚡ Quick Start (Windows CMD)
Requisito: Node.js v20+ y pnpm instalado globalmente.
code
Cmd
REM 1. Clonar el repositorio
git clone https://github.com/metashark-tech/razworks.git
cd razworks

REM 2. Instalar dependencias (pnpm es mandatorio)
pnpm install

REM 3. Configurar variables de entorno
copy .env.example .env
REM (Editar .env con tus credenciales de Supabase/Google/Upstash)

REM 4. Iniciar entorno de desarrollo
pnpm nx run-many -t serve
<div align="center">
Developed with 💙 by MetaShark Tech
<br>
Author: Raz Podestá • AI Co-Pilot: LIA Legacy
<br>
Florianópolis, Santa Catarina 🇧🇷
</div>
```
