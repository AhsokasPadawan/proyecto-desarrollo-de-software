import { Board } from '../board/Board';
import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { PromotionFactory } from '../pieces/PromotionFactory';
import { PieceType } from '../pieces/types';
import { ICommand } from './ICommand';

export class MoveCommand implements ICommand {
  private readonly board: Board;
  private readonly from: Position;
  private readonly to: Position;
  private readonly promotionType?: PieceType;

  private movedPiece: IPiece | null = null;
  private capturedPiece: IPiece | null = null;
  private capturedPiecePosition: Position | null = null;

  private wasPieceMovedBefore: boolean = false;
  private previousEnPassantTarget: Position | null = null;

  private isCastling: boolean = false;
  private castlingRook: IPiece | null = null;
  private castlingRookFrom: Position | null = null;
  private castlingRookTo: Position | null = null;
  private wasRookMovedBefore: boolean = false;

  private isPromotion: boolean = false;
  private promotedPiece: IPiece | null = null;

  constructor(board: Board, from: Position, to: Position, promotionType?: PieceType) {
    this.board = board;
    this.from = from;
    this.to = to;
    this.promotionType = promotionType;
  }

  getCapturedPiece(): IPiece | null {
    return this.capturedPiece;
  }

  execute(): void {
    this.movedPiece = this.board.getPieceAt(this.from);
    if (!this.movedPiece) {
      return;
    }

    this.wasPieceMovedBefore = Boolean(this.movedPiece.hasMoved);
    this.previousEnPassantTarget = this.board.getEnPassantTarget();

    let nextEnPassantTarget: Position | null = null;

    if (this.movedPiece.type === 'KING' && Math.abs(this.to.col - this.from.col) === 2) {
      this.executeCastling();
    } else if (
      this.movedPiece.type === 'PAWN' &&
      this.previousEnPassantTarget &&
      this.to.equals(this.previousEnPassantTarget) &&
      this.from.col !== this.to.col &&
      this.board.isEmpty(this.to)
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
    this.movedPiece.setHasMoved?.(true);

    const promotionRow = this.movedPiece.color === 'WHITE' ? this.board.rows - 1 : 0;
    if (this.movedPiece.type === 'PAWN' && this.to.row === promotionRow) {
      this.isPromotion = true;
      this.promotedPiece = PromotionFactory.createPromotedPiece(
        this.promotionType,
        this.movedPiece.color
      );
      this.promotedPiece.setHasMoved?.(true);
      this.board.placePiece(this.to, this.promotedPiece);
    }
  }

  undo(): void {
    if (!this.movedPiece) {
      return;
    }

    if (this.isPromotion) {
      this.board.removePiece(this.to);
      this.board.placePiece(this.from, this.movedPiece);
      if (this.capturedPiece && this.capturedPiecePosition) {
        this.board.placePiece(this.capturedPiecePosition, this.capturedPiece);
      }
    } else if (this.isCastling) {
      this.board.movePiece(this.to, this.from);
      if (this.castlingRook && this.castlingRookFrom && this.castlingRookTo) {
        this.board.movePiece(this.castlingRookTo, this.castlingRookFrom);
        this.castlingRook.setHasMoved?.(this.wasRookMovedBefore);
      }
    } else {
      this.board.movePiece(this.to, this.from);
      if (this.capturedPiece && this.capturedPiecePosition) {
        this.board.placePiece(this.capturedPiecePosition, this.capturedPiece);
      }
    }

    this.movedPiece.setHasMoved?.(this.wasPieceMovedBefore);
    this.board.setEnPassantTarget(this.previousEnPassantTarget);
  }

  private executeStandardMove(): void {
    this.capturedPiece = this.board.movePiece(this.from, this.to);
    this.capturedPiecePosition = this.to;
  }

  private executeEnPassantCapture(): void {
    const enemyPawnPosition = new Position(this.from.row, this.to.col);
    this.capturedPiece = this.board.removePiece(enemyPawnPosition);
    this.capturedPiecePosition = enemyPawnPosition;
    this.board.movePiece(this.from, this.to);
  }

  private executeCastling(): void {
    this.isCastling = true;
    const isKingside = this.to.col > this.from.col;

    const rookOriginCol = isKingside ? this.board.cols - 1 : 0;
    const rookTargetCol = isKingside ? this.from.col + 1 : this.from.col - 1;

    this.castlingRookFrom = new Position(this.from.row, rookOriginCol);
    this.castlingRookTo = new Position(this.from.row, rookTargetCol);

    this.castlingRook = this.board.getPieceAt(this.castlingRookFrom);
    this.wasRookMovedBefore = Boolean(this.castlingRook?.hasMoved);

    this.board.movePiece(this.from, this.to);
    this.board.movePiece(this.castlingRookFrom, this.castlingRookTo);
    this.castlingRook?.setHasMoved?.(true);
  }
}
