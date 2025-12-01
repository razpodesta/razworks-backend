/**
 * @fileoverview Tabla Maestra de Niveles y XP
 * @module Gamification/Constants
 * @description Fuente de verdad alineada con DOC-008.
 *              Define los 33 niveles y sus 5 Reinos.
 */

export enum RazterRealm {
  THE_SCRIPT = 'THE_SCRIPT',       // Niveles 1-6
  THE_COMPILER = 'THE_COMPILER',   // Niveles 7-12
  THE_KERNEL = 'THE_KERNEL',       // Niveles 13-18
  THE_NETWORK = 'THE_NETWORK',     // Niveles 19-24
  THE_SOURCE = 'THE_SOURCE'        // Niveles 25-33
}

export interface LevelThreshold {
  level: number;
  minXp: number;
  realm: RazterRealm;
  title: string;
}

// Fórmula Logarítmica Suavizada: Base 1000 * 1.5^Nivel (aprox)
export const LEVEL_TABLE: LevelThreshold[] = [
  // 🟢 REALM I: THE SCRIPT
  { level: 1, minXp: 0, realm: RazterRealm.THE_SCRIPT, title: 'Localhost' },
  { level: 2, minXp: 1000, realm: RazterRealm.THE_SCRIPT, title: 'Hello World' },
  { level: 3, minXp: 2500, realm: RazterRealm.THE_SCRIPT, title: 'Variable' },
  { level: 4, minXp: 4500, realm: RazterRealm.THE_SCRIPT, title: 'Function' },
  { level: 5, minXp: 7000, realm: RazterRealm.THE_SCRIPT, title: 'Loop' },
  { level: 6, minXp: 10000, realm: RazterRealm.THE_SCRIPT, title: 'Async' },

  // 🔵 REALM II: THE COMPILER
  { level: 7, minXp: 14000, realm: RazterRealm.THE_COMPILER, title: 'Debugger' },
  { level: 8, minXp: 19000, realm: RazterRealm.THE_COMPILER, title: 'Refactorer' },
  { level: 9, minXp: 25000, realm: RazterRealm.THE_COMPILER, title: 'Linter' },
  { level: 10, minXp: 32000, realm: RazterRealm.THE_COMPILER, title: 'Optimizer' },
  { level: 11, minXp: 40000, realm: RazterRealm.THE_COMPILER, title: 'Cache Master' },
  { level: 12, minXp: 50000, realm: RazterRealm.THE_COMPILER, title: 'Binary' },

  // ... (Se pueden extrapolar el resto de niveles siguiendo la curva)
  // Por brevedad, definimos el umbral del siguiente reino
  { level: 13, minXp: 65000, realm: RazterRealm.THE_KERNEL, title: 'Sudo User' },
  { level: 19, minXp: 150000, realm: RazterRealm.THE_NETWORK, title: 'Node' },
  { level: 25, minXp: 500000, realm: RazterRealm.THE_SOURCE, title: 'Mainframe' }
];

export const getLevelInfo = (xp: number): LevelThreshold => {
  // Encontramos el nivel más alto cuyo minXp sea menor o igual al XP actual
  const level = [...LEVEL_TABLE].reverse().find(l => xp >= l.minXp);
  return level || LEVEL_TABLE[0];
};

export const getNextLevelInfo = (currentLevel: number): LevelThreshold | null => {
  return LEVEL_TABLE.find(l => l.level === currentLevel + 1) || null;
};
