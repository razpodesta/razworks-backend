/**
 * @fileoverview Motor de Gamificación (Refactored & Lint Free)
 * @module Gamification/Engine
 * @description Calcula progreso y dispara eventos de celebración.
 * @author Raz Podestá & LIA Legacy
 */
import { Injectable, Logger } from '@nestjs/common';
import { db, profilesTable } from '@razworks/database';
import { NotificationsService } from '@razworks/notifications';
import { eq } from 'drizzle-orm';
import { getLevelInfo, LevelThreshold } from './constants/xp-table';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly notifications: NotificationsService) {}

  /**
   * Otorga XP a un usuario y verifica si subió de nivel.
   * @param userId ID del usuario
   * @param amount Cantidad de XP a otorgar
   * @param reason Razón (para logs/analytics)
   */
  async awardXp(userId: string, amount: number, reason: string): Promise<void> {
    this.logger.log(`🏆 Awarding ${amount} XP to ${userId} for: ${reason}`);

    // 1. Obtener estado actual
    const userProfile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, userId),
      // ✅ FIX: Usamos 'currentRealm' que es la columna real en DB, no 'currentTier'
      columns: { totalXp: true, currentRealm: true }
    });

    if (!userProfile) {
      this.logger.error(`Usuario no encontrado: ${userId}`);
      return;
    }

    // 2. Calcular nuevo estado
    const currentTotalXp = userProfile.totalXp || 0;
    const newTotalXp = currentTotalXp + amount;

    const oldLevelInfo = getLevelInfo(currentTotalXp);
    const newLevelInfo = getLevelInfo(newTotalXp);

    // 3. Persistir XP
    await db.update(profilesTable)
      .set({ totalXp: newTotalXp, updatedAt: new Date() })
      .where(eq(profilesTable.id, userId));

    // 4. Verificar Level Up (Evento Crítico)
    if (newLevelInfo.level > oldLevelInfo.level) {
      await this.handleLevelUp(userId, newLevelInfo, oldLevelInfo);
    }
  }

  // ✅ FIX: Eliminado 'any'. Usamos la interfaz LevelThreshold explícita.
  private async handleLevelUp(userId: string, newLvl: LevelThreshold, oldLvl: LevelThreshold) {
    this.logger.log(`🚀 LEVEL UP! ${userId} is now Level ${newLvl.level} (${newLvl.title})`);

    // A. Notificación Interna (Dashboard)
    await this.notifications.dispatch({
      userId,
      actionCode: 'GAMIFICATION_LEVEL_UP',
      metadata: {
        newLevel: newLvl.level,
        newTitle: newLvl.title,
        realm: newLvl.realm
      }
    });

    // B. Check de Cambio de Reino (Realm Shift)
    if (newLvl.realm !== oldLvl.realm) {
      await this.notifications.dispatch({
        userId,
        actionCode: 'GAMIFICATION_REALM_UNLOCK',
        metadata: {
          newRealm: newLvl.realm
        }
      });
    }
  }
}
