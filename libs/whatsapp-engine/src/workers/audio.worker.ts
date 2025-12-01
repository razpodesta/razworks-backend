/**
 * @fileoverview Audio Processing Worker (The Ear)
 * @module WhatsApp/Workers
 * @description
 * Descarga el audio de Meta, y usa el Córtex (Multimodal) para transcribirlo.
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiProviderPort } from '@razworks/ai';
import { WhatsAppMediaService } from '../services/media-downloader.service';

export interface AudioPayload {
  mediaUrl: string; // ID de media de WhatsApp
  mimeType: string;
  traceId: string;
}

export interface AudioResult {
  text: string;
  meta: {
    source: string;
    confidence: number;
  };
}

@Processor('whatsapp-audio')
export class AudioWorker extends WorkerHost {
  private readonly logger = new Logger(AudioWorker.name);

  constructor(
    private readonly mediaService: WhatsAppMediaService,
    private readonly aiProvider: AiProviderPort // ✅ Inyección del Puerto Agnóstico
  ) {
    super();
  }

  async process(job: Job<AudioPayload>): Promise<AudioResult> {
    const { mediaUrl, mimeType, traceId } = job.data;
    this.logger.log(`🎧 Processing Audio | Trace: ${traceId} | Media: ${mediaUrl}`);

    try {
      // 1. Descargar Binario (Buffer)
      const downloadResult = await this.mediaService.downloadMedia(mediaUrl);
      if (downloadResult.isFailure) {
        throw downloadResult.getError();
      }

      const { buffer, mimeType: finalMime } = downloadResult.getValue();

      // 2. Inferencia Multimodal (Audio -> Texto)
      // Usamos el modelo Gemini Flash (via Port) que es nativamente multimodal.
      const transcriptionResult = await this.aiProvider.generateMultimodal(
        'Transcribe exactly what is said in this audio. If it is silent or unintelligible, say [SILENCE].',
        {
          data: buffer,
          mimeType: finalMime || mimeType
        }
      );

      if (transcriptionResult.isFailure) {
        throw transcriptionResult.getError();
      }

      const text = transcriptionResult.getValue();
      this.logger.debug(`🗣️ Transcript: "${text.substring(0, 50)}..."`);

      return {
        text,
        meta: {
          source: 'gemini-multimodal',
          confidence: 0.9 // Estimado
        }
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`❌ Audio Processing Failed: ${err.message}`, err.stack);
      throw err;
    }
  }
}
