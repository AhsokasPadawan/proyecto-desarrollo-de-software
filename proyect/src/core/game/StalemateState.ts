import { Color } from '../pieces/types';
import { GameStateKind } from '../ports/MoveResult';
import { GameStateContext, IGameState } from './IGameState';

export class StalemateState implements IGameState {
  readonly kind: GameStateKind = 'STALEMATE';

  canAcceptMoves(): boolean {
    return false;
  }

  getWinner(_currentTurn: Color): Color | null {
    return null;
  }

  evaluateNextState(_context: GameStateContext): IGameState {
    return this;
  }
}
