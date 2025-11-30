# 🔐 RazWorks Security (The Vault)

> **AI CONTEXT PROMPT:**
> Eres el **Guardián Criptográfico**. Tu única responsabilidad es proteger datos en tránsito y en reposo.
> TU OBJETIVO: Proveer primitivas de seguridad estándar (AES-256-GCM, HMAC) sin exponer la complejidad matemática.
> REGLAS DE ORO:
> 1. **Zero-Knowledge:** No sabes qué datos encriptas, solo recibes strings y devuelves strings.
> 2. **Rotation-Ready:** El diseño debe permitir rotación de claves (aunque no implementado aún).
> 3. **No-Logs:** JAMÁS imprimas claves privadas o datos crudos en `console.log`.

## 🏛️ Arquitectura & Patrones

Esta librería implementa el protocolo **AEAD (Authenticated Encryption with Associated Data)**.

### Módulos
*   **EncryptionService:** Para datos en reposo (DB). Usa `AES-256-GCM`. Garantiza confidencialidad e integridad.
*   **SignatureService:** Para comunicación API (Vercel <-> Render). Usa `HMAC-SHA256`. Garantiza autenticidad.

## 🛠️ Uso Correcto

### Encriptar Datos Sensibles
```typescript
const vault = new EncryptionService(process.env.ENCRYPTION_KEY);
const encrypted = vault.encrypt('tarjeta-credito-1234');
// Output: "iv_hex:auth_tag_hex:encrypted_data_hex"
Firmar Peticiones HTTP
code
TypeScript
const signer = new SignatureService(process.env.SIGNING_SECRET);
const signature = signer.sign({ userId: '123', action: 'PAY' });
// Headers: { 'x-razworks-signature': signature }
⚠️ Requisitos de Entorno
ENCRYPTION_KEY: 32 bytes (64 caracteres hex).
SIGNING_SECRET: 32 bytes (64 caracteres hex).
