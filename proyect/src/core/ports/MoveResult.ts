import { IPiece } from '../pieces/IPiece';

export type GameStateType = 'IN_PROGRESS' | 'CHECK' | 'CHECKMATE' | 'STALEMATE' | 'DRAW' | 'TIMEOUT';
export type GameStateKind = GameStateType;

export const TERMINAL_GAME_STATES: ReadonlySet<GameStateType> = new Set([
  'CHECKMATE',
  'STALEMATE',
  'DRAW',
  'TIMEOUT',
]);

export function isTerminalState(stateKind: GameStateKind): boolean {
  return TERMINAL_GAME_STATES.has(stateKind);
}

export type MoveRejectionReason =
  | 'GAME_OVER'
  | 'EMPTY_ORIGIN'
  | 'WRONG_TURN'
  | 'ILLEGAL_MOVE'
  | 'KING_LEFT_IN_CHECK';

export type MoveResult =
  | {
      readonly success: true;
      readonly capturedPiece: IPiece | null;
      readonly nextState: GameStateKind;
    }
  | {
      readonly success: false;
      readonly reason: MoveRejectionReason;
    };
