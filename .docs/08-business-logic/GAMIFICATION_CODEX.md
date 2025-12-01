<!--
  @title CÓDICE DE GAMIFICACIÓN "RAZTER OVERDRIVE"
  @id DOC-008-GAMIFICATION
  @category Business/Logic
  @status LAW (Inmutable)
  @version 1.0.0
  @author Raz Podestá & LIA Legacy
-->

# 🎮 APARATO VIII: EL CÓDICE DE GAMIFICACIÓN (RAZTER OVERDRIVE)

## 1. Psicología & Propósito
El sistema de niveles no es decorativo. Representa la **Capacidad de Procesamiento** del usuario.
*   **Concepto:** Empiezas como un proceso simple (`Localhost`) y evolucionas hasta ser la red misma (`The Mainframe`).

## 2. Los 5 Reinos (Dimensiones)

1.  **🟢 THE SCRIPT (Iniciación - Niveles 1-6):** Ejecución básica.
    *   *Niveles:* Localhost, Hello World, Variable, Function, Loop, Async.
2.  **🔵 THE COMPILER (Eficiencia - Niveles 7-12):** Calidad y limpieza.
    *   *Niveles:* Debugger, Refactorer, Linter, Optimizer, Cache Master, Binary.
3.  **🟣 THE KERNEL (Autoridad - Niveles 13-18):** Privilegios y seguridad.
    *   *Niveles:* Sudo User, Root Access, Daemon, Firewall, Encryptor, Kernel Panic.
4.  **🟠 THE NETWORK (Influencia - Niveles 19-24):** Escalabilidad.
    *   *Niveles:* Node, Hub, Load Balancer, Protocol, Backbone, Global Ping.
5.  **⚪ THE SOURCE (Leyenda - Niveles 25-33):** Omnipotencia.
    *   *Niveles:* Mainframe, Oracle, Architect, Visionary, Technomancer, Singularity, The Code, The Zero, The One.

## 3. Sistema de Badges (Insignias de Acción)

Las medallas son contratos de comportamiento verificables por código.

### ⚡ Velocidad (Speed)
*   **Zero Latency:** Responder al 100% de mensajes en < 5 min durante 1 semana.
*   **Deploy on Fridays:** Entrega exitosa un viernes sin bugs reportados.

### 💎 Calidad (Quality)
*   **Clean Sheet:** 10 proyectos seguidos con 5 estrellas.
*   **Bug Exterminator:** Resolver un proyecto abandonado por otro freelancer.

### 🧠 Sabiduría (Knowledge)
*   **Stack Overflow:** Ayudar a la IA a refinar un prompt de cliente.
*   **Open Source Soul:** Convencer a un cliente de liberar código.

## 4. Implementación Técnica (Shared DTO)

El Core debe exportar estos Enums para uso transversal:

```typescript
export enum RazterRealm {
  SCRIPT = 'THE_SCRIPT',
  COMPILER = 'THE_COMPILER',
  KERNEL = 'THE_KERNEL',
  NETWORK = 'THE_NETWORK',
  SOURCE = 'THE_SOURCE'
}

---


