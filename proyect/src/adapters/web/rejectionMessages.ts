import { MoveRejectionReason } from '../../core/ports/MoveResult';

export const REJECTION_MESSAGES: Record<MoveRejectionReason, string> = {
  GAME_OVER: 'La partida ha finalizado. No se permiten más movimientos.',
  EMPTY_ORIGIN: 'La casilla de origen seleccionada está vacía.',
  WRONG_TURN: 'No es el turno de esta pieza.',
  ILLEGAL_MOVE: 'El movimiento elegido no cumple las reglas de la pieza.',
  KING_LEFT_IN_CHECK: 'No puedes realizar una jugada que deje o mantenga a tu Rey en jaque.',
};

export function getRejectionMessage(reason: MoveRejectionReason): string {
  return REJECTION_MESSAGES[reason] ?? 'Movimiento rechazado.';
}
