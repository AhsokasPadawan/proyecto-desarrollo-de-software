import { CheckmateState } from './CheckmateState';
import { CheckState } from './CheckState';
import { DrawState } from './DrawState';
import { GameStateContext, IGameState } from './IGameState';
import { NormalPlayState } from './NormalPlayState';
import { StalemateState } from './StalemateState';

const HAS_MOVES = 'hasMoves';
const NO_MOVES = 'noMoves';
const IN_CHECK = 'inCheck';
const SAFE = 'safe';

type MoveAvailability = typeof HAS_MOVES | typeof NO_MOVES;
type CheckStatus = typeof IN_CHECK | typeof SAFE;

const NEXT_STATE_FACTORIES: Record<
  MoveAvailability,
  Record<CheckStatus, () => IGameState>
> = {
  [HAS_MOVES]: {
    [IN_CHECK]: () => new CheckState(),
    [SAFE]: () => new NormalPlayState(),
  },
  [NO_MOVES]: {
    [IN_CHECK]: () => new CheckmateState(),
    [SAFE]: () => new StalemateState(),
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

  const moveKey: MoveAvailability = context.hasLegalMoves ? HAS_MOVES : NO_MOVES;
  const checkKey: CheckStatus = context.isKingInCheck ? IN_CHECK : SAFE;

  return NEXT_STATE_FACTORIES[moveKey][checkKey]();
}
