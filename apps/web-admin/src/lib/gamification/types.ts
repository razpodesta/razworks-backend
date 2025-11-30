// RUTA: apps/web-admin/src/lib/gamification/types.ts
// VERSIÓN: 2.0 - Tipos Locales (Desacoplado de Backend)
// DESCRIPCIÓN: Definiciones de tipos para el consumo de la API de Gamificación.
//              Se han internalizado los tipos 'House' y 'Rarity' ya que el paquete
//              'protocol-33' ha sido desacoplado del repositorio frontend.

// --- TIPOS INTERNALIZADOS (Antes importados de @razpodesta/protocol-33) ---
export type House = 'ARCHITECTS' | 'WEAVERS' | 'ANOMALIES';
export type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY' | 'MYTHIC' | 'UNIQUE';
// --------------------------------------------------------------------------

export type Artifact = {
  id: string;
  slug: string;
  name: string;
  description: string;
  house: House;
  rarity: Rarity;
  baseValue: number;
  visualData?: {
    modelUrl?: string;
    thumbnail?: string;
    mainColor?: string;
  };
};

export type InventoryItem = {
  id: string;
  acquiredAt: string; // GraphQL envía fechas como strings ISO
  isEquipped: boolean;
  artifact: Artifact;
  metadata?: Record<string, unknown>;
};

export type UserGamificationProfile = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  inventory: InventoryItem[];
};

export type GamificationProfileResponse = {
  getMyProfile: UserGamificationProfile;
};

export type CodexResponse = {
  getCodex: Artifact[];
};
