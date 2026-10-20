import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { Color } from '../pieces/types';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from './IMovementRule';

interface CastlingSideConfig {
  readonly rookCol: number;
  readonly direction: 1 | -1;
}

export class CastlingMoveRule implements IMovementRule {
  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    if (!this.canKingAttemptCastling(from, piece, board)) {
      return [];
    }

    const castlingSides: readonly CastlingSideConfig[] = [
      { rookCol: board.cols - 1, direction: 1 },
      { rookCol: 0, direction: -1 },
    ];

    return castlingSides
      .map((side) => this.getCastlingTargetForSide(from, piece.color, board, side))
      .filter((target): target is Position => target !== null);
  }

  private canKingAttemptCastling(from: Position, piece: IPiece, board: IBoardQuery): boolean {
    const initialRowByColor: Record<Color, number> = {
      WHITE: 0,
      BLACK: board.rows - 1,
    };

    return (
      piece.type === 'KING' &&
      from.row === initialRowByColor[piece.color] &&
      !board.hasPieceMoved(piece)
    );
  }

  private getCastlingTargetForSide(
    from: Position,
    color: Color,
    board: IBoardQuery,
    side: CastlingSideConfig
  ): Position | null {
    const destinationSquare = from.offset(0, 2 * side.direction);
    if (!board.isWithinBounds(destinationSquare)) {
      return null;
    }

    const canCastleOnSide =
      this.hasUnmovedRookAtCorner(from.row, side.rookCol, color, board) &&
      this.isPathClearBetween(from.row, from.col, side.rookCol, board);

    return canCastleOnSide ? destinationSquare : null;
  }

  private hasUnmovedRookAtCorner(
    row: number,
    rookCol: number,
    color: Color,
    board: IBoardQuery
  ): boolean {
    const rook = board.getPieceAt(new Position(row, rookCol));
    return (
      rook !== null &&
      rook.type === 'ROOK' &&
      rook.color === color &&
      !board.hasPieceMoved(rook)
    );
  }

  private isPathClearBetween(
    row: number,
    firstCol: number,
    secondCol: number,
    board: IBoardQuery
  ): boolean {
    const minCol = Math.min(firstCol, secondCol) + 1;
    const maxCol = Math.max(firstCol, secondCol);

    for (let col = minCol; col < maxCol; col++) {
      if (!board.isSquareEmpty(new Position(row, col))) {
        return false;
      }
    }

    return true;
  }
}
