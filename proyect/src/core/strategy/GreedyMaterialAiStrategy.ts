import { createBoardFromSnapshot } from '../board/boardSetup';
import { MoveCommand } from '../game/MoveCommand';
import { OPPOSITE_COLOR, PieceType } from '../pieces/types';
import { IGameEngine } from '../ports/IGameEngine';
import { CheckDetector } from '../rules/CheckDetector';
import { hasAnyLegalMove } from '../rules/legalMoveEvaluator';
import { AiMove, collectCandidateMoves, IAiStrategy } from './IAiStrategy';

export const MATERIAL_LOOKUP_TABLE: Partial<Record<PieceType, number>> = {
  PAWN: 100,
  KNIGHT: 300,
  BISHOP: 300,
  ROOK: 500,
  QUEEN: 900,
};

export const DEFAULT_PIECE_SCORE = 100;
const CHECKMATE_SCORE_BONUS = 100000;
const CHECK_SCORE_BONUS = 50;

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
        score += (MATERIAL_LOOKUP_TABLE.QUEEN ?? 900) - (MATERIAL_LOOKUP_TABLE.PAWN ?? 100);
      }

      const putsOpponentInCheck = checkDetector.isKingInCheck(simulationBoard, opponentColor);
      if (putsOpponentInCheck) {
        const opponentHasLegalMoves = hasAnyLegalMove(simulationBoard, opponentColor, checkDetector);
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
}
