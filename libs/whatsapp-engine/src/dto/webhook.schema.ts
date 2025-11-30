/**
 * @fileoverview Esquemas Zod para Webhooks de WhatsApp Cloud API
 * @module WhatsApp/DTOs
 * @description Definición estricta de la estructura de eventos entrantes.
 */
import { z } from 'zod';

// --- SUB-ESQUEMAS (Componentes Atómicos) ---

const TextObjectSchema = z.object({
  body: z.string(),
});

const AudioObjectSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
});

const ImageObjectSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  caption: z.string().optional(),
});

const InteractiveObjectSchema = z.object({
  type: z.string(),
  button_reply: z.object({ id: z.string(), title: z.string() }).optional(),
  list_reply: z.object({ id: z.string(), title: z.string() }).optional(),
});

// --- ESQUEMA DE MENSAJE (RAW FROM META) ---
export const WhatsAppMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['text', 'image', 'audio', 'interactive', 'button', 'unknown', 'reaction', 'order', 'system']).optional(),
  text: TextObjectSchema.optional(),
  audio: AudioObjectSchema.optional(),
  image: ImageObjectSchema.optional(),
  interactive: InteractiveObjectSchema.optional(),
});

// Estructura de Metadatos
const MetadataSchema = z.object({
  display_phone_number: z.string(),
  phone_number_id: z.string(),
});

// Estructura de Contacto
const ContactSchema = z.object({
  profile: z.object({ name: z.string().optional() }),
  wa_id: z.string(),
});

// Estructura de Cambios (Changes)
const ChangeValueSchema = z.object({
  messaging_product: z.literal('whatsapp'),
  metadata: MetadataSchema,
  contacts: z.array(ContactSchema).optional(),
  messages: z.array(WhatsAppMessageSchema).optional(),
  statuses: z.array(z.any()).optional(), // Agregamos esto para manejar (e ignorar) estados
});

const ChangeSchema = z.object({
  value: ChangeValueSchema,
  field: z.string(), // Usualmente 'messages'
});

// Estructura de Entrada (Entry)
const EntrySchema = z.object({
  id: z.string(),
  changes: z.array(ChangeSchema),
});

// --- SCHEMA ROOT (Payload Completo) ---
export const WhatsAppWebhookSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(EntrySchema),
});

// --- INFERENCIA DE TIPOS (EXPORTS PARA EL GATEWAY) ---
export type WhatsAppWebhookDto = z.infer<typeof WhatsAppWebhookSchema>;
// Exportamos el tipo del mensaje crudo para evitar el 'any' en el servicio
export type RawWhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;
