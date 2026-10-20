import { Position } from './Position';
import { Color, PieceType } from '../pieces/types';
import { GameSnapshot, MoveRecord, PieceSnapshot } from '../ports/GameSnapshot';

const PIECE_FEN_LOOKUP: Record<PieceType, string> = {
  PAWN: 'p',
  ROOK: 'r',
  KNIGHT: 'n',
  BISHOP: 'b',
  QUEEN: 'q',
  KING: 'k',
};

const COLOR_FEN_LOOKUP: Record<Color, string> = {
  WHITE: 'w',
  BLACK: 'b',
};

export class FenSerializer {
  static serializeSnapshot(snapshot: GameSnapshot): string {
    const piecePlacement = this.buildPiecePlacement(snapshot.grid, snapshot.rows, snapshot.cols);
    const activeColor = COLOR_FEN_LOOKUP[snapshot.currentTurn];
    const castlingRights = this.computeCastlingRights(snapshot);
    const enPassantTarget = this.computeEnPassantTarget(snapshot);
    const halfMoveClock = this.computeHalfMoveClock(snapshot);
    const fullMoveNumber = Math.floor(snapshot.currentMoveIndex / 2) + 1;

    return `${piecePlacement} ${activeColor} ${castlingRights} ${enPassantTarget} ${halfMoveClock} ${fullMoveNumber}`;
  }

  private static buildPiecePlacement(
    grid: readonly (readonly (PieceSnapshot | null)[])[],
    rows: number,
    cols: number
  ): string {
    const rankStrings: string[] = [];

    for (let row = rows - 1; row >= 0; row--) {
      let emptyCount = 0;
      let rankString = '';

      for (let col = 0; col < cols; col++) {
        const piece = grid[row][col];
        if (!piece) {
          emptyCount += 1;
          continue;
        }

        if (emptyCount > 0) {
          rankString += emptyCount.toString();
          emptyCount = 0;
        }

        const symbol = PIECE_FEN_LOOKUP[piece.type];
        rankString += piece.color === 'WHITE' ? symbol.toUpperCase() : symbol.toLowerCase();
      }

      if (emptyCount > 0) {
        rankString += emptyCount.toString();
      }

      rankStrings.push(rankString);
    }

    return rankStrings.join('/');
  }

  private static computeCastlingRights(snapshot: GameSnapshot): string {
    if (snapshot.rows !== 8 || snapshot.cols !== 8) {
      return '-';
    }

    const playedMoves = snapshot.moveHistory.slice(0, snapshot.currentMoveIndex);

    const whiteKingOnE1 = snapshot.grid[0][4]?.type === 'KING' && snapshot.grid[0][4]?.color === 'WHITE';
    const whiteKingMoved = this.hasKingMoved(playedMoves, 'WHITE');

    const whiteKingsideRookOnH1 = snapshot.grid[0][7]?.type === 'ROOK' && snapshot.grid[0][7]?.color === 'WHITE';
    const whiteH1RookMoved = this.hasSquareMoved(playedMoves, 'h1');

    const whiteQueensideRookOnA1 = snapshot.grid[0][0]?.type === 'ROOK' && snapshot.grid[0][0]?.color === 'WHITE';
    const whiteA1RookMoved = this.hasSquareMoved(playedMoves, 'a1');

    const blackKingOnE8 = snapshot.grid[7][4]?.type === 'KING' && snapshot.grid[7][4]?.color === 'BLACK';
    const blackKingMoved = this.hasKingMoved(playedMoves, 'BLACK');

    const blackKingsideRookOnH8 = snapshot.grid[7][7]?.type === 'ROOK' && snapshot.grid[7][7]?.color === 'BLACK';
    const blackH8RookMoved = this.hasSquareMoved(playedMoves, 'h8');

    const blackQueensideRookOnA8 = snapshot.grid[7][0]?.type === 'ROOK' && snapshot.grid[7][0]?.color === 'BLACK';
    const blackA8RookMoved = this.hasSquareMoved(playedMoves, 'a8');

    const canWhiteKingside = whiteKingOnE1 && !whiteKingMoved && whiteKingsideRookOnH1 && !whiteH1RookMoved;
    const canWhiteQueenside = whiteKingOnE1 && !whiteKingMoved && whiteQueensideRookOnA1 && !whiteA1RookMoved;
    const canBlackKingside = blackKingOnE8 && !blackKingMoved && blackKingsideRookOnH8 && !blackH8RookMoved;
    const canBlackQueenside = blackKingOnE8 && !blackKingMoved && blackQueensideRookOnA8 && !blackA8RookMoved;

    const rights =
      (canWhiteKingside ? 'K' : '') +
      (canWhiteQueenside ? 'Q' : '') +
      (canBlackKingside ? 'k' : '') +
      (canBlackQueenside ? 'q' : '');

    return rights.length > 0 ? rights : '-';
  }

  private static hasKingMoved(playedMoves: readonly MoveRecord[], color: Color): boolean {
    return playedMoves.some((move) => move.turn === color && move.piece === 'KING');
  }

  private static hasSquareMoved(playedMoves: readonly MoveRecord[], square: string): boolean {
    return playedMoves.some((move) => move.from === square || move.to === square);
  }

  private static computeEnPassantTarget(snapshot: GameSnapshot): string {
    if (snapshot.currentMoveIndex <= 0) {
      return '-';
    }

    const previousMove = snapshot.moveHistory[snapshot.currentMoveIndex - 1];
    if (previousMove.piece !== 'PAWN') {
      return '-';
    }

    const fromPosition = Position.fromAlgebraic(previousMove.from);
    const toPosition = Position.fromAlgebraic(previousMove.to);

    if (Math.abs(toPosition.row - fromPosition.row) !== 2) {
      return '-';
    }

    const targetRow = Math.floor((fromPosition.row + toPosition.row) / 2);
    return new Position(targetRow, fromPosition.col).toAlgebraic();
  }

  private static computeHalfMoveClock(snapshot: GameSnapshot): number {
    let halfMoves = 0;
    const playedMoves = snapshot.moveHistory.slice(0, snapshot.currentMoveIndex);

    for (let index = playedMoves.length - 1; index >= 0; index--) {
      const move = playedMoves[index];
      if (move.piece === 'PAWN' || move.capturedPiece) {
        break;
      }
      halfMoves += 1;
    }

    return halfMoves;
  }
}
