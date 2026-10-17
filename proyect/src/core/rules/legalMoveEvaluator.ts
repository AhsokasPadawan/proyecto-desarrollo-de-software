import { Board } from '../board/Board';
import { MoveCommand } from '../game/MoveCommand';
import { Color } from '../pieces/types';
import { CheckDetector } from './CheckDetector';

export function hasAnyLegalMove(
  board: Board,
  color: Color,
  checkDetector: CheckDetector = new CheckDetector()
): boolean {
  const placements = board.getPiecesByColor(color);
  for (const placement of placements) {
    const pseudoLegalMoves = placement.piece.getPseudoLegalMoves(placement.position, board);
    for (const target of pseudoLegalMoves) {
      const testCommand = new MoveCommand(board, placement.position, target);
      testCommand.execute();
      let leavesKingInCheck = false;
      try {
        leavesKingInCheck = checkDetector.isKingInCheck(board, color);
      } finally {
        testCommand.undo();
      }
      if (!leavesKingInCheck) {
        return true;
      }
    }
  }
  return false;
}
