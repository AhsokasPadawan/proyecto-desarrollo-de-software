import { CheckmateState } from './CheckmateState';
import { CheckState } from './CheckState';
import { DrawState } from './DrawState';
import { GameStateContext, IGameState } from './IGameState';
import { NormalPlayState } from './NormalPlayState';
import { StalemateState } from './StalemateState';

type MoveAvailability = 'hasMoves' | 'noMoves';
type CheckStatus = 'inCheck' | 'safe';

const NEXT_STATE_FACTORIES: Record<
  MoveAvailability,
  Record<CheckStatus, () => IGameState>
> = {
  hasMoves: {
    inCheck: () => new CheckState(),
    safe: () => new NormalPlayState(),
  },
  noMoves: {
    inCheck: () => new CheckmateState(),
    safe: () => new StalemateState(),
  },
};

export function evaluateActiveStateTransition(context: GameStateContext): IGameState {
  if (!context.hasLegalMoves && context.isKingInCheck) {
    return new CheckmateState();
  }

  const isDraw =
    context.isFiftyMoveRuleReached ||
    context.isInsufficientMaterial ||
    context.isThreefoldRepetition;

  if (isDraw) {
    return new DrawState();
  }

  const moveKey: MoveAvailability = context.hasLegalMoves ? 'hasMoves' : 'noMoves';
  const checkKey: CheckStatus = context.isKingInCheck ? 'inCheck' : 'safe';

  return NEXT_STATE_FACTORIES[moveKey][checkKey]();
}
