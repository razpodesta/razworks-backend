/**
 * @fileoverview Servicio de Control de Acceso por Reinos (Gatekeeper)
 * @module Gamification/Services
 * @author Raz Podestá & LIA Legacy
 * @description
 * Autoridad central para determinar si un usuario tiene acceso a funcionalidades
 * basadas en su Reino (Nivel de evolución).
 */

import { Injectable } from '@nestjs/common';
import { RazterRealm } from '../constants/xp-table';

@Injectable()
export class RealmGatekeeperService {

  // Jerarquía de poder (Mayor número = Mayor acceso)
  private readonly REALM_HIERARCHY: Record<RazterRealm, number> = {
    [RazterRealm.THE_SCRIPT]: 1,
    [RazterRealm.THE_COMPILER]: 2,
    [RazterRealm.THE_KERNEL]: 3,
    [RazterRealm.THE_NETWORK]: 4,
    [RazterRealm.THE_SOURCE]: 5,
  };

  /**
   * Verifica si un reino posee acceso suficiente comparado con un reino requerido.
   * @param userRealm El reino actual del usuario.
   * @param requiredRealm El reino mínimo necesario para la acción.
   */
  public hasAccess(userRealm: RazterRealm, requiredRealm: RazterRealm): boolean {
    const userPower = this.REALM_HIERARCHY[userRealm] || 0;
    const requiredPower = this.REALM_HIERARCHY[requiredRealm] || 999;

    return userPower >= requiredPower;
  }

  /**
   * Obtiene el siguiente reino a alcanzar.
   */
  public getNextRealm(currentRealm: RazterRealm): RazterRealm | null {
    const currentPower = this.REALM_HIERARCHY[currentRealm];
    // Buscamos el reino con poder +1
    const nextEntry = Object.entries(this.REALM_HIERARCHY).find(
      ([_, power]) => power === currentPower + 1
    );

    return nextEntry ? (nextEntry[0] as RazterRealm) : null;
  }
}
