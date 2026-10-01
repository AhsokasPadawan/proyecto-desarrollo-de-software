import { Position } from './Position';
import { IBoardQuery, PiecePlacement } from '../ports/IBoardQuery';
import { IPiece } from '../pieces/IPiece';
import { Color, PIECE_TYPES } from '../pieces/types';

export class Board implements IBoardQuery {
  readonly rows: number;
  readonly cols: number;
  private readonly grid: (IPiece | null)[][];
  private enPassantTarget: Position | null = null;

  constructor(rows: number = 8, cols: number = 8) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
      throw new Error(`Board dimensions must be positive integers. Received rows=${rows}, cols=${cols}`);
    }

    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  }

  isWithinBounds(position: Position): boolean {
    return (
      position.row >= 0 &&
      position.row < this.rows &&
      position.col >= 0 &&
      position.col < this.cols
    );
  }

  getPieceAt(position: Position): IPiece | null {
    if (!this.isWithinBounds(position)) {
      return null;
    }

    return this.grid[position.row][position.col];
  }

  isEmpty(position: Position): boolean {
    return this.isWithinBounds(position) && this.grid[position.row][position.col] === null;
  }

  placePiece(position: Position, piece: IPiece): IPiece | null {
    if (!this.isWithinBounds(position)) {
      throw new Error(`Cannot place piece outside board bounds: (${position.row}, ${position.col})`);
    }

    const displacedPiece = this.grid[position.row][position.col];
    this.grid[position.row][position.col] = piece;
    return displacedPiece;
  }

  removePiece(position: Position): IPiece | null {
    if (!this.isWithinBounds(position)) {
      return null;
    }

    const piece = this.grid[position.row][position.col];
    this.grid[position.row][position.col] = null;
    return piece;
  }

  movePiece(from: Position, to: Position): IPiece | null {
    if (!this.isWithinBounds(from)) {
      throw new Error(`Source position is out of bounds: (${from.row}, ${from.col})`);
    }
    if (!this.isWithinBounds(to)) {
      throw new Error(`Target position is out of bounds: (${to.row}, ${to.col})`);
    }

    const pieceToMove = this.grid[from.row][from.col];
    if (!pieceToMove) {
      throw new Error(`No piece at source position: (${from.row}, ${from.col})`);
    }

    const capturedPiece = this.grid[to.row][to.col];
    this.grid[to.row][to.col] = pieceToMove;
    this.grid[from.row][from.col] = null;

    return capturedPiece;
  }

  findKingPosition(color: Color): Position | null {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const piece = this.grid[row][col];
        if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
          return new Position(row, col);
        }
      }
    }

    return null;
  }

  getPiecesByColor(color: Color): readonly PiecePlacement[] {
    const placements: PiecePlacement[] = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const piece = this.grid[row][col];
        if (piece && piece.color === color) {
          placements.push({
            position: new Position(row, col),
            piece,
          });
        }
      }
    }

    return placements;
  }

  getEnPassantTarget(): Position | null {
    return this.enPassantTarget;
  }

  setEnPassantTarget(target: Position | null): void {
    this.enPassantTarget = target;
  }
}
