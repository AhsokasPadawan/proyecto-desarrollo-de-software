import { Color } from '../pieces/types';
import { GameStateType } from '../ports/MoveResult';

export interface GameStateContext {
  readonly isKingInCheck: boolean;
  readonly hasLegalMoves: boolean;
  readonly isFiftyMoveRuleReached: boolean;
  readonly isInsufficientMaterial: boolean;
  readonly isThreefoldRepetition: boolean;
}

export interface IGameState {
  readonly type: GameStateType;
  canAcceptMoves(): boolean;
  getWinner(currentTurn: Color): Color | null;
  evaluateNextState(context: GameStateContext): IGameState;
}
