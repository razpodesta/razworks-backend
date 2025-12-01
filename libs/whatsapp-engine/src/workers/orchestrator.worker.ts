/**
 * @fileoverview CORTEX ORCHESTRATOR WORKER (Agentic Edition v3)
 * @module WhatsApp/Workers
 * @description
 * El Cerebro Central actualizado con capacidades agénticas.
 *
 * CAMBIOS FASE 7:
 * 1. Inyección de 'AgenticCoordinatorService'.
 * 2. Inyección de 'ToolRegistryService' y 'UserRepositoryPort'.
 * 3. Resolución del Realm del usuario para control de acceso a herramientas.
 * 4. Ejecución del Bucle Agéntico en lugar de generación simple.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  NeuralContextManager,
  AgenticCoordinatorService // ✅ El Coordinador
} from '@razworks/ai';
import { NotificationsService } from '@razworks/notifications';
import { UserRepositoryPort, RazterRealm } from '@razworks/core'; // ✅ Acceso al Perfil
import { ToolRegistryService } from '@razworks/toolbox-shared';   // ✅ Acceso a Herramientas

import { InternalMessagePayload } from '../services/conversation-flow.service';
import { OutboundHumanizerService } from '../services/outbound-humanizer.service';
import { PromptEngineeringService } from '../services/prompt-engineering.service';

// --- Interfaces de Contrato (Inputs de Sentidos) ---
interface SentimentResult { mood: string; score: number; }
interface AudioResult { text: string; meta: { duration: number; confidence: number; source: string; }; }
interface VisionResult { description: string; labels: string[]; }
interface SecurityResult { safe: boolean; reason?: string; sanitizedText?: string; }

@Processor('whatsapp-orchestrator')
export class OrchestratorWorker extends WorkerHost {
  private readonly logger = new Logger(OrchestratorWorker.name);

  constructor(
    private readonly outbound: OutboundHumanizerService,
    private readonly memory: NeuralContextManager,
    private readonly promptArchitect: PromptEngineeringService,
    private readonly coordinator: AgenticCoordinatorService, // ✅ Reemplaza a aiProvider directo
    private readonly notifications: NotificationsService,
    private readonly userRepo: UserRepositoryPort,         // ✅ Para obtener el Realm
    private readonly toolRegistry: ToolRegistryService     // ✅ Para obtener herramientas
  ) {
    super();
  }

  async process(job: Job<InternalMessagePayload>): Promise<void> {
    const { from, traceId, type } = job.data; // 'from' es el número de teléfono (WA ID)
    let textInput = job.data.text || '';

    this.logger.log(`🔮 Cortex Active (Agentic) | Trace: ${traceId} | User: ${from}`);

    try {
      // =================================================================
      // 1. FUSIÓN SENSORIAL (Sentidos)
      // =================================================================
      const children = await job.getChildrenValues();
      const security = children['security-scan'] as SecurityResult | undefined;

      // A. Defensa
      if (security && !security.safe) {
        this.logger.warn(`🛡️ Blocked by Sentinel: ${security.reason}`);
        // Aquí podríamos enviar un mensaje de rechazo genérico si quisiéramos
        return;
      }
      if (security?.sanitizedText) textInput = security.sanitizedText;

      // B. Multimodalidad (Audio/Visión)
      const audio = children['transcribe-audio'] as AudioResult | undefined;
      const vision = children['analyze-vision'] as VisionResult | undefined;
      let multimodalContext = '';

      if (type === 'audio' && audio?.text) {
        textInput = audio.text;
        multimodalContext += `[AUDIO_TRANSCRIPT]: "${audio.text}"\n`;
      }
      if (type === 'image' && vision?.description) {
        textInput = `${textInput} \n(Contexto Visual: ${vision.description})`;
        multimodalContext += `[VISION_ANALYSIS]: ${vision.description}\n`;
      }

      if (!textInput.trim()) return;

      // C. Sentimiento
      const sentiment = (children['analyze-sentiment'] as SentimentResult) || { mood: 'Neutral', score: 0 };

      // =================================================================
      // 2. CONTEXTO DE USUARIO (Identidad & Realm)
      // =================================================================
      // Buscamos al usuario por su identificador (Email o ID mapeado).
      // NOTA: En este MVP, asumimos que 'from' (teléfono) nos permite buscar,
      // o usamos un Realm por defecto si no está registrado.
      // TODO: Implementar búsqueda por teléfono en UserRepositoryPort.
      // Por ahora, simulamos la obtención del Realm.

      let userRealm: RazterRealm = 'THE_SCRIPT';
      let userId = from; // Fallback ID

      // Simulación de resolución de usuario (Idealmente: this.userRepo.findByPhone(from))
      // Si es un usuario nuevo, es THE_SCRIPT.

      // =================================================================
      // 3. PREPARACIÓN DE HERRAMIENTAS (Tool Discovery)
      // =================================================================
      // Filtramos qué herramientas puede usar este usuario según su nivel
      const availableTools = this.toolRegistry.getAvailableTools(userRealm);

      if (availableTools.length > 0) {
        this.logger.debug(`🔧 Tools enabled for ${userRealm}: ${availableTools.map(t => t.metadata.name).join(', ')}`);
      }

      // =================================================================
      // 4. INGENIERÍA DE PROMPT (System Instruction)
      // =================================================================
      // Obtenemos la memoria a través del NeuralManager
      const contextResult = await this.memory.buildContext(from, '');
      const memoryBlock = contextResult.isSuccess ? contextResult.getValue() : '';

      const systemPrompt = this.promptArchitect.buildSystemPrompt(textInput, {
        userId: from,
        mood: sentiment.mood,
        history: [], // La historia ya viene procesada en memoryBlock
        multimodalContext: `${multimodalContext}\n${memoryBlock}`
      });

      // =================================================================
      // 5. EJECUCIÓN DEL BUCLE AGÉNTICO (The Loop)
      // =================================================================
      // Aquí ocurre la magia. Si el usuario pidió "Cotizar", el coordinador
      // llamará a BudgetEstimatorTool y devolverá el resultado final.

      const agentResult = await this.coordinator.executeAgenticLoop(
        systemPrompt, // Enviamos el prompt completo con contexto como instrucción
        availableTools,
        { userId, realm: userRealm } // Contexto para la herramienta
      );

      if (agentResult.isFailure) {
        throw new Error(`Agentic Loop Failed: ${agentResult.getError().message}`);
      }

      const aiResponse = agentResult.getValue();

      // =================================================================
      // 6. PERSISTENCIA & ACTUACIÓN
      // =================================================================
      await this.memory.pushInteraction(from, textInput, aiResponse);

      const delivery = await this.outbound.sendHumanResponse(from, aiResponse);
      if (delivery.isFailure) throw delivery.getError();

      this.logger.log(`✅ Interaction Cycle Complete | Trace: ${traceId}`);

    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.logger.error(`🔥 Cortex Failure: ${error.message}`, error.stack);
      throw error;
    }
  }
}
