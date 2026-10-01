import { Board } from '../board/Board';
import { Position } from '../board/Position';
import { Bishop } from '../pieces/Bishop';
import { Chancellor } from '../pieces/Chancellor';
import { King } from '../pieces/King';
import { Knight } from '../pieces/Knight';
import { Pawn } from '../pieces/Pawn';
import { Queen } from '../pieces/Queen';
import { Rook } from '../pieces/Rook';
import { IPiece } from '../pieces/IPiece';
import { Color, OPPOSITE_COLOR, PieceType } from '../pieces/types';
import { GameSnapshot } from '../ports/GameSnapshot';
import { IGameEngine } from '../ports/IGameEngine';
import { CheckDetector } from '../rules/CheckDetector';
import { MoveCommand } from '../game/MoveCommand';
import { AiMove, collectCandidateMoves, IAiStrategy } from './IAiStrategy';

export const MATERIAL_LOOKUP_TABLE: Record<string, number> = {
  PAWN: 100,
  KNIGHT: 300,
  BISHOP: 300,
  ROOK: 500,
  QUEEN: 900,
};

export const DEFAULT_PIECE_SCORE = 100;
const CHECKMATE_SCORE_BONUS = 100000;
const CHECK_SCORE_BONUS = 50;

const PIECE_SNAPSHOT_FACTORIES: Record<PieceType, (color: Color) => IPiece> = {
  KING: (color) => new King(color),
  QUEEN: (color) => new Queen(color),
  ROOK: (color) => new Rook(color),
  BISHOP: (color) => new Bishop(color),
  KNIGHT: (color) => new Knight(color),
  PAWN: (color) => new Pawn(color),
  CHANCELLOR: (color) => new Chancellor(color),
};

function createBoardFromSnapshot(snapshot: GameSnapshot): Board {
  const board = new Board(snapshot.rows, snapshot.cols);
  for (let row = 0; row < snapshot.rows; row++) {
    for (let col = 0; col < snapshot.cols; col++) {
      const pieceSnapshot = snapshot.grid[row][col];
      if (pieceSnapshot) {
        const factory = PIECE_SNAPSHOT_FACTORIES[pieceSnapshot.type];
        if (factory) {
          board.placePiece(new Position(row, col), factory(pieceSnapshot.color));
        }
      }
    }
  }
  return board;
}

export class GreedyMaterialAiStrategy implements IAiStrategy {
  chooseMove(engine: IGameEngine): AiMove | null {
    const candidateMoves = collectCandidateMoves(engine);
    if (candidateMoves.length === 0) {
      return null;
    }

    const snapshot = engine.getSnapshot();
    const opponentColor = OPPOSITE_COLOR[snapshot.currentTurn];
    const checkDetector = new CheckDetector();

    let bestMove: AiMove = candidateMoves[0];
    let highestScore = -Infinity;

    for (const move of candidateMoves) {
      const simulationBoard = createBoardFromSnapshot(snapshot);
      const simulationCommand = new MoveCommand(simulationBoard, move.from, move.to);
      simulationCommand.execute();

      let score = 0;

      const captured = simulationCommand.getCapturedPiece();
      if (captured) {
        score += MATERIAL_LOOKUP_TABLE[captured.type] ?? DEFAULT_PIECE_SCORE;
      }

      const movedPiece = simulationBoard.getPieceAt(move.to);
      const isPromotingPawn =
        movedPiece?.type === 'QUEEN' &&
        snapshot.grid[move.from.row][move.from.col]?.type === 'PAWN';
      if (isPromotingPawn) {
        score += MATERIAL_LOOKUP_TABLE.QUEEN - MATERIAL_LOOKUP_TABLE.PAWN;
      }

      const putsOpponentInCheck = checkDetector.isKingInCheck(simulationBoard, opponentColor);
      if (putsOpponentInCheck) {
        const opponentHasLegalMoves = this.hasAnyLegalMove(simulationBoard, opponentColor, checkDetector);
        if (!opponentHasLegalMoves) {
          score += CHECKMATE_SCORE_BONUS;
        } else {
          score += CHECK_SCORE_BONUS;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private hasAnyLegalMove(board: Board, color: Color, checkDetector: CheckDetector): boolean {
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
}
