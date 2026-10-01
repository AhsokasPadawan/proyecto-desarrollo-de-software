import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { Color, OPPOSITE_COLOR } from '../pieces/types';
import { IBoardQuery } from '../ports/IBoardQuery';
import { CheckDetector } from './CheckDetector';
import { IMovementRule } from './IMovementRule';

export interface ISquareAttackDetector {
  isSquareAttacked(board: IBoardQuery, target: Position, byColor: Color): boolean;
}

export class CastlingMoveRule implements IMovementRule {
  private readonly attackDetector: ISquareAttackDetector;
  private isEvaluating: boolean = false;

  constructor(attackDetector: ISquareAttackDetector = new CheckDetector()) {
    this.attackDetector = attackDetector;
  }

  getPseudoLegalMoves(from: Position, piece: IPiece, board: IBoardQuery): Position[] {
    if (this.isEvaluating || piece.type !== 'KING' || piece.hasMoved) {
      return [];
    }

    const expectedRow = piece.color === 'WHITE' ? 0 : board.rows - 1;
    if (from.row !== expectedRow) {
      return [];
    }

    this.isEvaluating = true;
    try {
      const opponentColor = OPPOSITE_COLOR[piece.color];
      if (this.attackDetector.isSquareAttacked(board, from, opponentColor)) {
        return [];
      }

      const targets: Position[] = [];

      const kingsideTarget = this.evaluateCastlingSide(
        from,
        piece,
        board,
        opponentColor,
        board.cols - 1,
        1
      );
      if (kingsideTarget) {
        targets.push(kingsideTarget);
      }

      const queensideTarget = this.evaluateCastlingSide(
        from,
        piece,
        board,
        opponentColor,
        0,
        -1
      );
      if (queensideTarget) {
        targets.push(queensideTarget);
      }

      return targets;
    } finally {
      this.isEvaluating = false;
    }
  }

  private evaluateCastlingSide(
    from: Position,
    piece: IPiece,
    board: IBoardQuery,
    opponentColor: Color,
    rookCol: number,
    direction: 1 | -1
  ): Position | null {
    const destinationCol = from.col + 2 * direction;
    const transitCol = from.col + direction;

    if (destinationCol < 0 || destinationCol >= board.cols) {
      return null;
    }

    const rookPos = new Position(from.row, rookCol);
    const rook = board.getPieceAt(rookPos);

    if (!rook || rook.type !== 'ROOK' || rook.color !== piece.color || rook.hasMoved) {
      return null;
    }

    const minCol = Math.min(from.col, rookCol) + 1;
    const maxCol = Math.max(from.col, rookCol);
    for (let col = minCol; col < maxCol; col++) {
      if (!board.isEmpty(new Position(from.row, col))) {
        return null;
      }
    }

    const transitSquare = new Position(from.row, transitCol);
    const destinationSquare = new Position(from.row, destinationCol);

    const isTransitAttacked = this.attackDetector.isSquareAttacked(board, transitSquare, opponentColor);
    const isDestinationAttacked = this.attackDetector.isSquareAttacked(board, destinationSquare, opponentColor);

    if (isTransitAttacked || isDestinationAttacked) {
      return null;
    }

    return destinationSquare;
  }
}
