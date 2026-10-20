import { Color } from '../pieces/types';
import { GameStateType } from '../ports/MoveResult';
import { evaluateActiveStateTransition } from './activeStateTransition';
import { GameStateContext, IGameState } from './IGameState';

export class CheckState implements IGameState {
  readonly type: GameStateType = 'CHECK';

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
