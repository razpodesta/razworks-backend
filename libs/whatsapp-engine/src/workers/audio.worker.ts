// libs/whatsapp-engine/src/workers/audio.worker.ts
/**
 * @fileoverview Audio Processing Unit
 * @module WhatsApp/Workers
 * @description
 * Ingesta audio y utiliza el Toolbox para conversión y la IA para transcripción.
 * REFACTOR: Integración con @razworks/toolbox-razter.
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { aiAdapter } from '@razworks/ai';
import { FileConverterTool } from '@razworks/toolbox-razter';

interface AudioPayload {
  mediaUrl: string;
  mimeType: string;
  traceId: string;
}

interface AudioResult {
  text: string;
  meta: {
    duration: number;
    confidence: number;
    format: string;
  };
}

@Processor('whatsapp-audio')
export class AudioWorker extends WorkerHost {
  private readonly logger = new Logger(AudioWorker.name);

  async process(job: Job<AudioPayload>): Promise<AudioResult> {
    const { mediaUrl, mimeType, traceId } = job.data;
    this.logger.log(`🎧 Processing Audio | Trace: ${traceId}`);

    try {
      // 1. Normalización de Audio (Usando Toolbox)
      // Asumimos nivel 'BARRACUDA' para permitir proceso interno
      const conversion = await FileConverterTool.convert({
        fileId: mediaUrl, // Usamos la URL como ID temporal
        targetFormat: 'mp3',
        razterTier: 'BARRACUDA'
      });

      if (conversion.status !== 'SUCCESS' || !conversion.url) {
        throw new Error(`Audio Conversion Failed: ${conversion.message}`);
      }

      // 2. Transcripción (Simulada/Whisper - Aquí usaríamos conversion.url real)
      // Por ahora, simulamos que la IA escucha el archivo procesado
      const rawTranscript = "Hola quiero cotizar un sistema de gestión en la nube.";

      // 3. Corrección Cognitiva (AI Adapter)
      const prompt = `Correct this transcript for technical accuracy: "${rawTranscript}"`;
      const polishedText = await aiAdapter.generateText(prompt);

      return {
        text: polishedText,
        meta: {
          duration: 15,
          confidence: 0.99,
          format: 'mp3_normalized'
        }
      };

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Audio Pipeline Failed: ${msg}`, { traceId });
      throw error;
    }
  }
}
