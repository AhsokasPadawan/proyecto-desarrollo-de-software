import { IPiece } from '../pieces/IPiece';

export type GameStateKind = 'IN_PROGRESS' | 'CHECK' | 'CHECKMATE' | 'STALEMATE' | 'DRAW' | 'TIMEOUT';

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
