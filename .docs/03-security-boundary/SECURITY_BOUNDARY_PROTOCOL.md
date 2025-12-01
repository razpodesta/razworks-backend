<!--
  @title PROTOCOLO DE FRONTERA SEGURA Y DEFENSA ISOMÓRFICA
  @id DOC-003-SEC-BOUNDARY
  @category Architecture/Security
  @status LAW (Inmutable)
  @version 3.0.0 (Consolidated)
  @author Raz Podestá & LIA Legacy
-->

# 🌉 APARATO III: EL PUENTE DE SEGURIDAD (SECURITY BOUNDARY)

## 1. Visión y Filosofía: "Zero-Trust & Iso-morphic Defense"
La seguridad en RazWorks no es un "firewall". Es una arquitectura donde el Frontend y el Backend son entidades soberanas que desconfían mutuamente y se verifican criptográficamente.

*   **Principio de la Frontera Dura:** El navegador del usuario es territorio hostil. Ninguna clave privada, secreto de firma o lógica de encriptación debe existir en el bundle de JavaScript del cliente (`use client`).
*   **Principio de Defensa Isomórfica:** El código de seguridad debe ser consciente de su entorno. Lo que funciona en el Servidor (Node.js/`crypto`) está prohibido en el Cliente.

## 2. Estrategia de Comunicación: El Patrón "Virtual BFF"

Para evitar exponer secretos en el navegador, utilizamos los **Server Actions** de Next.js como un **Backend For Frontend (BFF)** virtual.

### El Flujo Seguro (The Loop)
1.  **Browser (Inseguro):** El usuario hace click en "Guardar". El componente React llama a un Server Action. *No hay tokens ni firmas aquí.*
2.  **Server Action (Seguro - Vercel):** Se ejecuta en el entorno de servidor de Next.js.
    *   Recupera `SIGNING_SECRET` de las variables de entorno (no expuestas al cliente).
    *   Firma el payload con HMAC.
    *   Realiza el `fetch` al API Gateway (Render).
3.  **API Gateway (Blindado - Render):**
    *   Verifica la firma HMAC y el Timestamp (Anti-Replay).
    *   Si es válido, procesa la solicitud.

**REGLA DE ORO:** El Frontend nunca habla directamente con la API Core para operaciones de escritura crítica sin pasar por el BFF.

## 3. Estándares Criptográficos (The AEAD Protocol)

Utilizamos algoritmos estándar NIST/FIPS. No inventamos criptografía.

### A. Nivel 1: Datos en Reposo (Database)
*   **Algoritmo:** `AES-256-GCM` (Authenticated Encryption).
*   **Propósito:** Campos sensibles (PII, Tokens OAuth, Direcciones).
*   **Garantía:** Confidencialidad + Integridad (Si alteran el bit en la DB, falla al desencriptar).

### B. Nivel 2: Identidad & Secretos (Hashing)
*   **Algoritmo:** `Argon2id` (Memory-hard).
*   **Propósito:** Contraseñas, Respuestas de seguridad.
*   **Propiedad:** Irreversible.

### C. Nivel 3: Integridad en Tránsito (S2S)
*   **Algoritmo:** `HMAC-SHA256`.
*   **Propósito:** Firmar comunicación entre Vercel y Render.
*   **Headers Obligatorios:**
    *   `x-razworks-signature`: Hash del payload.
    *   `x-razworks-timestamp`: Momento de la firma (Ventana de validez: 30s).

## 4. Protocolo de Rotación de Claves "Trial-Chain"

La seguridad estática es seguridad muerta. Soportamos la rotación de claves sin downtime.

1.  **Configuración:** `ENCRYPTION_KEY` acepta una lista separada por comas (`key_new,key_old1,key_old2`).
2.  **Escritura (Encryption):** Siempre usa la clave en índice `0` (La más nueva).
3.  **Lectura (Decryption):** Itera sobre la lista. Si el `AuthTag` falla (clave incorrecta), prueba la siguiente. Si todas fallan, lanza `TamperedDataException`.

## 5. Instrucciones para la IA (Generative Security Rules)

**TÚ (La IA) DEBES:**

1.  **Detectar Entorno:** Antes de sugerir código de seguridad, verifica si el archivo es Cliente o Servidor.
    *   *Si es Cliente:* PROHIBIDO importar `node:crypto`, `libs/security` o acceder a `process.env.SECRET`.
2.  **Sanitización de Logs:** Al generar código de logging, siempre inyecta la configuración `redact` para ocultar: `password`, `token`, `authorization`, `credit_card`.
3.  **Implementación HMAC:** Siempre que generes un `fetch` entre servidores, debes incluir la lógica de firma HMAC y timestamp.

## 6. Estructura de Librería (`libs/security`)

```text
libs/security/src/
├── node/               # Implementación Servidor (node:crypto)
│   ├── encryption.service.ts
│   └── signature.service.ts
├── web/                # (Futuro) Implementación Cliente (Web Crypto API)
│   └── hashing.utils.ts
└── index.ts            # Exporta 'node' por defecto, protege imports

---

