import { Color } from '../pieces/types';
import { GameStateType } from '../ports/MoveResult';
import { CheckmateState } from './CheckmateState';
import { CheckState } from './CheckState';
import { GameStateContext, IGameState } from './IGameState';

export class StudyPlayState implements IGameState {
  readonly type: GameStateType = 'STUDY_IN_PROGRESS';

  canAcceptMoves(): boolean {
    return true;
  }

  getWinner(_currentTurn: Color): Color | null {
    return null;
  }

  retainsTurnWhenSingleColor(): boolean {
    return true;
  }

  evaluateNextState(context: GameStateContext): IGameState {
    if (!context.hasLegalMoves && context.isKingInCheck) {
      return new CheckmateState();
    }
    if (context.hasLegalMoves && context.isKingInCheck) {
      return new CheckState(this);
    }
    return new StudyPlayState();
  }
}
