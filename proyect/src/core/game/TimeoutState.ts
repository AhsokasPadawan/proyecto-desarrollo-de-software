import { Color, OPPOSITE_COLOR } from '../pieces/types';
import { GameStateType } from '../ports/MoveResult';
import { GameStateContext, IGameState } from './IGameState';

export class TimeoutState implements IGameState {
  readonly type: GameStateType = 'TIMEOUT';

  constructor(private readonly timedOutColor: Color) {}

  canAcceptMoves(): boolean {
    return false;
  }

  getWinner(_currentTurn: Color): Color | null {
    return OPPOSITE_COLOR[this.timedOutColor];
  }

  evaluateNextState(_context: GameStateContext): IGameState {
    return this;
  }
}
