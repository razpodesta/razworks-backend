<!--
  @module @razworks/security
  @type MANIFESTO
  @status ACTIVE
  @standard FIPS-197 / NIST SP 800-38D
-->

# 🔐 MANIFIESTO DE SEGURIDAD: PROTOCOLO "AEAD"

## 1. Conceptos Fundamentales
Para evitar confusiones arquitectónicas, definimos tres niveles de protección:

*   **Nivel 1: Cifrado Reversible (AES-256-GCM)**
    *   *Uso:* Datos que necesitamos leer después (Tarjetas de crédito, Emails PII, API Keys externas).
    *   *Tecnología:* Authenticated Encryption (AEAD). Garantiza que el dato es secreto Y que no ha sido manipulado.

*   **Nivel 2: Hashing Irreversible (Argon2id)**
    *   *Uso:* Contraseñas y respuestas de seguridad.
    *   *Tecnología:* Hashing de memoria dura. Nunca se puede recuperar el dato original, solo verificar si coincide.

*   **Nivel 3: Firma Digital (HMAC-SHA256)**
    *   *Uso:* Comunicación entre Servidores (Vercel <-> Render).
    *   *Tecnología:* Firma de payloads. Garantiza que la petición viene de nuestro Frontend y no de un atacante (Man-in-the-Middle).

## 2. Gestión de Secretos (Key Rotation)
*   La `ENCRYPTION_KEY` (32 bytes) nunca debe "quemarse" en el código. Se inyecta en tiempo de ejecución.
*   El Vector de Inicialización (`IV`) debe ser **único y aleatorio** para cada registro. Nunca reutilizar un IV con la misma clave.

## 3. Librerías Aprobadas
*   Node.js nativo: `node:crypto` (Para AES-GCM y HMAC). Rendimiento C++ directo.
*   Supabase Auth: `gotrue` (Para Argon2id).

---

<!--
  @id 007-SECURITY-ROTATION
  @type ARCHITECTURE
  @status ACTIVE
  @related libs/security
-->

# 🔐 PROTOCOLO DE ROTACIÓN DE CLAVES "TRIAL-CHAIN"

## 📖 The Storytelling
La seguridad estática es seguridad muerta. Necesitamos la capacidad de cambiar nuestras claves de cifrado (`ENCRYPTION_KEY`) si sospechamos una filtración, sin dejar ilegibles los millones de registros ya encriptados en la base de datos. Implementar un sistema de "Key ID" en cada fila de la base de datos añadiría complejidad de esquema innecesaria.

## 🏛️ The Decision (Estrategia Trial-Chain)
Optamos por una estrategia de **Fuerza Bruta Controlada** en la desencriptación.

1.  **Configuración:** La variable de entorno `ENCRYPTION_KEY` acepta una lista separada por comas.
    *   `ENCRYPTION_KEY="CLAVE_NUEVA,CLAVE_VIEJA_1,CLAVE_VIEJA_2"`
2.  **Encriptación (Escritura):** Siempre usa el índice `0` (La clave más a la izquierda).
3.  **Desencriptación (Lectura):** Itera sobre el array de claves.
    *   Gracias a **AES-256-GCM**, si la clave es incorrecta, la operación falla matemáticamente (AuthTag Mismatch). Capturamos ese error y probamos la siguiente clave.
    *   Esto garantiza integridad y permite leer datos viejos mientras se escriben nuevos con la clave rotada.

## 🤖 AI MEMORY HOOK
*   **AL CONFIGURAR:** Si ves múltiples claves separadas por comas en `.env`, NO es un error. Es el protocolo de rotación.
*   **AL DEPURAR:** Si `EncryptionService` lanza "Data Tampered", significa que ninguna de las claves en la lista pudo abrir el candado. O las claves cambiaron, o el dato fue corrupto.

---


