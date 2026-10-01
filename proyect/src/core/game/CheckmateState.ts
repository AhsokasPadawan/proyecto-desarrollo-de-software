import { Color, OPPOSITE_COLOR } from '../pieces/types';
import { GameStateKind } from '../ports/MoveResult';
import { GameStateContext, IGameState } from './IGameState';

export class CheckmateState implements IGameState {
  readonly kind: GameStateKind = 'CHECKMATE';

  canAcceptMoves(): boolean {
    return false;
  }

  getWinner(currentTurn: Color): Color | null {
    return OPPOSITE_COLOR[currentTurn];
  }

  evaluateNextState(_context: GameStateContext): IGameState {
    return this;
  }
}
