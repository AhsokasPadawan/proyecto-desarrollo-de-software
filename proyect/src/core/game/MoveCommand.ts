import { Board } from '../board/Board';
import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { createPiece } from '../pieces/pieceFactory';
import { Color, PieceType } from '../pieces/types';
import { ICommand } from './ICommand';

interface CapturedPieceRecord {
  readonly piece: IPiece;
  readonly position: Position;
}

interface CastlingRecord {
  readonly rook: IPiece;
  readonly from: Position;
  readonly to: Position;
  readonly wasMovedBefore: boolean;
}

export class MoveCommand implements ICommand {
  private readonly board: Board;
  private readonly from: Position;
  private readonly to: Position;
  private readonly promotionType?: PieceType;

  private movedPiece: IPiece | null = null;
  private wasPieceMovedBefore: boolean = false;
  private previousEnPassantTarget: Position | null = null;

  private captureRecord: CapturedPieceRecord | null = null;
  private castlingRecord: CastlingRecord | null = null;
  private promotedPiece: IPiece | null = null;

  constructor(board: Board, from: Position, to: Position, promotionType?: PieceType) {
    this.board = board;
    this.from = from;
    this.to = to;
    this.promotionType = promotionType;
  }

  getCapturedPiece(): IPiece | null {
    return this.captureRecord?.piece ?? null;
  }

  execute(): void {
    this.movedPiece = this.board.getPieceAt(this.from);
    if (!this.movedPiece) {
      return;
    }

    this.wasPieceMovedBefore = this.board.hasPieceMoved(this.movedPiece);
    this.previousEnPassantTarget = this.board.getEnPassantTarget();

    let nextEnPassantTarget: Position | null = null;

    if (this.movedPiece.type === 'KING' && Math.abs(this.to.col - this.from.col) === 2) {
      this.executeCastling();
    } else if (
      this.movedPiece.type === 'PAWN' &&
      this.previousEnPassantTarget &&
      this.to.equals(this.previousEnPassantTarget) &&
      this.from.col !== this.to.col &&
      this.board.isSquareEmpty(this.to)
    ) {
      this.executeEnPassantCapture();
    } else {
      this.executeStandardMove();
    }

    if (this.movedPiece.type === 'PAWN' && Math.abs(this.to.row - this.from.row) === 2) {
      const skippedRow = (this.from.row + this.to.row) / 2;
      nextEnPassantTarget = new Position(skippedRow, this.from.col);
    }

    this.board.setEnPassantTarget(nextEnPassantTarget);
    this.board.setPieceMoved(this.movedPiece, true);

    const promotionRow = this.movedPiece.color === 'WHITE' ? this.board.rows - 1 : 0;
    if (this.movedPiece.type === 'PAWN' && this.to.row === promotionRow) {
      this.promotedPiece = this.createPromotedPiece(this.movedPiece.color);
      this.board.setPieceMoved(this.promotedPiece, true);
      this.board.placePiece(this.to, this.promotedPiece);
    }
  }

  undo(): void {
    if (!this.movedPiece) {
      return;
    }

    if (this.promotedPiece) {
      this.board.setPieceMoved(this.promotedPiece, false);
      this.board.removePiece(this.to);
      this.board.placePiece(this.from, this.movedPiece);
      if (this.captureRecord) {
        this.board.placePiece(this.captureRecord.position, this.captureRecord.piece);
      }
    } else if (this.castlingRecord) {
      this.board.movePiece(this.to, this.from);
      this.board.movePiece(this.castlingRecord.to, this.castlingRecord.from);
      this.board.setPieceMoved(this.castlingRecord.rook, this.castlingRecord.wasMovedBefore);
    } else {
      this.board.movePiece(this.to, this.from);
      if (this.captureRecord) {
        this.board.placePiece(this.captureRecord.position, this.captureRecord.piece);
      }
    }

    this.board.setPieceMoved(this.movedPiece, this.wasPieceMovedBefore);
    this.board.setEnPassantTarget(this.previousEnPassantTarget);
  }

  private createPromotedPiece(color: Color): IPiece {
    return createPiece(this.promotionType ?? 'QUEEN', color);
  }

  private executeStandardMove(): void {
    const capturedPiece = this.board.movePiece(this.from, this.to);
    if (capturedPiece) {
      this.captureRecord = {
        piece: capturedPiece,
        position: this.to,
      };
    }
  }

  private executeEnPassantCapture(): void {
    const enemyPawnPosition = new Position(this.from.row, this.to.col);
    const capturedPiece = this.board.removePiece(enemyPawnPosition);
    if (capturedPiece) {
      this.captureRecord = {
        piece: capturedPiece,
        position: enemyPawnPosition,
      };
    }
    this.board.movePiece(this.from, this.to);
  }

  private executeCastling(): void {
    const isKingside = this.to.col > this.from.col;

    const rookOriginCol = isKingside ? this.board.cols - 1 : 0;
    const rookTargetCol = isKingside ? this.from.col + 1 : this.from.col - 1;

    const castlingRookFrom = new Position(this.from.row, rookOriginCol);
    const castlingRookTo = new Position(this.from.row, rookTargetCol);

    const rook = this.board.getPieceAt(castlingRookFrom);
    if (rook) {
      this.castlingRecord = {
        rook,
        from: castlingRookFrom,
        to: castlingRookTo,
        wasMovedBefore: this.board.hasPieceMoved(rook),
      };
    }

    this.board.movePiece(this.from, this.to);
    this.board.movePiece(castlingRookFrom, castlingRookTo);
    if (rook) {
      this.board.setPieceMoved(rook, true);
    }
  }
}
