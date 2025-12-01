/**
 * @fileoverview Descargador de Medios de WhatsApp
 * @module WhatsApp/Services
 * @description Recupera binarios desde Meta Graph API.
 */
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Result } from '@razworks/shared/utils';

@Injectable()
export class WhatsAppMediaService {
  private readonly logger = new Logger(WhatsAppMediaService.name);
  private readonly apiVersion = 'v21.0';

  private get accessToken(): string {
    const token = process.env['WHATSAPP_ACCESS_TOKEN'];
    if (!token) throw new Error('WHATSAPP_ACCESS_TOKEN missing');
    return token;
  }

  /**
   * Descarga un archivo multimedia usando su ID de WhatsApp.
   */
  async downloadMedia(mediaId: string): Promise<Result<{ buffer: Buffer; mimeType: string }, Error>> {
    try {
      this.logger.debug(`⬇️ Downloading Media ID: ${mediaId}`);

      // PASO 1: Obtener la URL de descarga (Lookup)
      const lookupUrl = `https://graph.facebook.com/${this.apiVersion}/${mediaId}`;

      const lookupRes = await axios.get(lookupUrl, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      const downloadUrl = lookupRes.data.url;
      const mimeType = lookupRes.data.mime_type;

      if (!downloadUrl) {
        return Result.fail(new Error(`No se pudo resolver la URL para el media ID: ${mediaId}`));
      }

      // PASO 2: Descargar el binario (Stream/Buffer)
      const binaryRes = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      const buffer = Buffer.from(binaryRes.data);
      this.logger.debug(`✅ Download complete. ${buffer.length} bytes.`);

      return Result.ok({ buffer, mimeType });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Media Download Failed: ${err.message}`);
      return Result.fail(err);
    }
  }
}
