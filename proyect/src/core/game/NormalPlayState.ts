import { Color } from '../pieces/types';
import { GameStateKind } from '../ports/MoveResult';
import { evaluateActiveStateTransition } from './activeStateTransition';
import { GameStateContext, IGameState } from './IGameState';

export class NormalPlayState implements IGameState {
  readonly kind: GameStateKind = 'IN_PROGRESS';

  canAcceptMoves(): boolean {
    return true;
  }

  getWinner(_currentTurn: Color): Color | null {
    return null;
  }

  evaluateNextState(context: GameStateContext): IGameState {
    return evaluateActiveStateTransition(context);
  }
}
