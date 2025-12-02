/**
 * @fileoverview CORTEX ORCHESTRATOR WORKER (Agentic Edition v5 - Lint Perfect)
 * @module WhatsApp/Workers
 * @author Raz Podestá & LIA Legacy
 * @description
 * Cerebro Central del sistema.
 *
 * CORRECCIONES LINT:
 * - Eliminación de variables no usadas (userProfile).
 * - Uso estricto de 'const' para variables inmutables.
 */

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  NeuralContextManager,
  AgenticCoordinatorService
} from '@razworks/ai';
import { NotificationsService } from '@razworks/notifications';
import { UserRepositoryPort, RazterRealm } from '@razworks/core';
import { ToolRegistryService } from '@razworks/toolbox-shared';

import { InternalMessagePayload } from '../services/conversation-flow.service';
import { OutboundHumanizerService } from '../services/outbound-humanizer.service';
import { PromptEngineeringService } from '../services/prompt-engineering.service';

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
    private readonly coordinator: AgenticCoordinatorService,
    private readonly notifications: NotificationsService,
    private readonly userRepo: UserRepositoryPort,
    private readonly toolRegistry: ToolRegistryService
  ) {
    super();
  }

  async process(job: Job<InternalMessagePayload>): Promise<void> {
    const { from, traceId, type } = job.data;
    let textInput = job.data.text || '';

    this.logger.log(`🔮 Cortex Active (Agentic) | Trace: ${traceId} | User: ${from}`);

    try {
      // 1. FUSIÓN SENSORIAL
      const children = await job.getChildrenValues();
      const security = children['security-scan'] as SecurityResult | undefined;

      if (security && !security.safe) {
        this.logger.warn(`🛡️ Blocked by Sentinel: ${security.reason} | Trace: ${traceId}`);
        return;
      }
      if (security?.sanitizedText) {
        textInput = security.sanitizedText;
      }

      const audio = children['transcribe-audio'] as AudioResult | undefined;
      const vision = children['analyze-vision'] as VisionResult | undefined;
      let multimodalContext = '';

      if (type === 'audio' && audio?.text) {
        textInput = audio.text;
        multimodalContext += `[AUDIO_TRANSCRIPT]: "${audio.text}" (Confidence: ${audio.meta.confidence})\n`;
      }

      if (type === 'image' && vision?.description) {
        textInput = `${textInput} \n(Contexto Visual: ${vision.description})`;
        multimodalContext += `[VISION_ANALYSIS]: ${vision.description}\n`;
      }

      if (!textInput.trim()) {
        this.logger.warn(`⚠️ Empty input after processing. Aborting. | Trace: ${traceId}`);
        return;
      }

      const sentiment = (children['analyze-sentiment'] as SentimentResult) || { mood: 'Neutral', score: 0 };

      // 2. CONTEXTO DE USUARIO (Clean Code Fix)
      // Usamos const porque en este scope específico no reasignamos.
      const userRealm: RazterRealm = RazterRealm.THE_SCRIPT;
      const userId = from;

      // TODO: Implementar búsqueda real cuando userRepo soporte findByPhone
      // const userResult = await this.userRepo.findByPhone(from); ...

      this.logger.debug(`👤 User Context: ${userId} | Detected Realm: ${userRealm}`);

      // 3. PREPARACIÓN DE HERRAMIENTAS
      const availableTools = this.toolRegistry.getAvailableTools(userRealm);

      if (availableTools.length > 0) {
        this.logger.debug(`🔧 Tools enabled: ${availableTools.map(t => t.metadata.name).join(', ')}`);
      }

      // 4. INGENIERÍA DE PROMPT
      const contextResult = await this.memory.buildContext(from, '');
      const memoryBlock = contextResult.isSuccess ? contextResult.getValue() : '';

      const systemPrompt = this.promptArchitect.buildSystemPrompt(textInput, {
        userId: from,
        mood: sentiment.mood,
        history: [],
        multimodalContext: `${multimodalContext}\n${memoryBlock}`
      });

      // 5. EJECUCIÓN AGÉNTICA
      const agentResult = await this.coordinator.executeAgenticLoop(
        systemPrompt,
        availableTools,
        { userId, realm: userRealm }
      );

      if (agentResult.isFailure) {
        throw new Error(`Agentic Loop Failed: ${agentResult.getError().message}`);
      }

      const aiResponse = agentResult.getValue();

      // 6. PERSISTENCIA
      await this.memory.pushInteraction(from, textInput, aiResponse);

      const delivery = await this.outbound.sendHumanResponse(from, aiResponse);
      if (delivery.isFailure) throw delivery.getError();

      this.logger.log(`✅ Interaction Cycle Complete | Trace: ${traceId}`);

    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.logger.error(`🔥 Cortex Failure: ${error.message}`, error.stack);

      await this.notifications.dispatch({
        userId: 'admin-system',
        actionCode: 'SYS_ERROR',
        metadata: { component: 'OrchestratorWorker', traceId, error: error.message }
      });

      throw error;
    }
  }
}
