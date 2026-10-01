import { Position } from '../board/Position';
import { IGameEngine } from '../ports/IGameEngine';

export interface AiMove {
  readonly from: Position;
  readonly to: Position;
}

export interface IAiStrategy {
  chooseMove(engine: IGameEngine): AiMove | null;
}

export function collectCandidateMoves(engine: IGameEngine): AiMove[] {
  const snapshot = engine.getSnapshot();
  const isTerminal =
    snapshot.stateKind === 'CHECKMATE' ||
    snapshot.stateKind === 'STALEMATE' ||
    snapshot.stateKind === 'DRAW';

  if (isTerminal) {
    return [];
  }

  const candidateMoves: AiMove[] = [];

  for (let row = 0; row < snapshot.rows; row++) {
    for (let col = 0; col < snapshot.cols; col++) {
      const piece = snapshot.grid[row][col];
      if (piece && piece.color === snapshot.currentTurn) {
        const from = new Position(row, col);
        const legalTargets = engine.getLegalMoves(from);
        for (const to of legalTargets) {
          candidateMoves.push({ from, to });
        }
      }
    }
  }

  return candidateMoves;
}
