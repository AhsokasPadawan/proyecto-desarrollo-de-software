import { Color } from '../pieces/types';
import { GameStateType } from '../ports/MoveResult';
import { evaluateActiveStateTransition } from './activeStateTransition';
import { GameStateContext, IGameState } from './IGameState';

export class CheckState implements IGameState {
  readonly type: GameStateType = 'CHECK';
  private readonly originState?: IGameState;

  constructor(originState?: IGameState) {
    this.originState = originState;
  }

  canAcceptMoves(): boolean {
    return true;
  }

  getWinner(_currentTurn: Color): Color | null {
    return null;
  }

  retainsTurnWhenSingleColor(): boolean {
    return this.originState?.retainsTurnWhenSingleColor?.() === true;
  }

  evaluateNextState(context: GameStateContext): IGameState {
    if (this.originState) {
      return this.originState.evaluateNextState(context);
    }
    return evaluateActiveStateTransition(context);
  }
}
