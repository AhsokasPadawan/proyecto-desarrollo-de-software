import { Color } from '../pieces/types';
import { GameStateKind } from '../ports/MoveResult';

export interface GameStateContext {
  readonly isKingInCheck: boolean;
  readonly hasLegalMoves: boolean;
  readonly isFiftyMoveRuleReached: boolean;
  readonly isInsufficientMaterial: boolean;
  readonly isThreefoldRepetition: boolean;
}

export interface IGameState {
  readonly kind: GameStateKind;
  canAcceptMoves(): boolean;
  getWinner(currentTurn: Color): Color | null;
  evaluateNextState(context: GameStateContext): IGameState;
}
