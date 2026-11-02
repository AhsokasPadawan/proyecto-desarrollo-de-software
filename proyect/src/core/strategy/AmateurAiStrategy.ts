import { Board } from '../board/Board';
import { Position } from '../board/Position';
import { Bishop } from '../pieces/Bishop';
import { King } from '../pieces/King';
import { Knight } from '../pieces/Knight';
import { Pawn } from '../pieces/Pawn';
import { Queen } from '../pieces/Queen';
import { Rook } from '../pieces/Rook';
import { IPiece } from '../pieces/IPiece';
import { Color, OPPOSITE_COLOR, PieceType } from '../pieces/types';
import { GameSnapshot, MoveRecord } from '../ports/GameSnapshot';
import { IGameEngine } from '../ports/IGameEngine';
import { CheckDetector } from '../rules/CheckDetector';
import { MoveCommand } from '../game/MoveCommand';
import { AiMove, collectCandidateMoves, IAiStrategy } from './IAiStrategy';
import { AmateurAiConfig, DEFAULT_AMATEUR_CONFIG, RandomGenerator } from './AmateurAiConfig';

const PIECE_FACTORIES: Record<PieceType, (color: Color) => IPiece> = {
  KING: (color) => new King(color),
  QUEEN: (color) => new Queen(color),
  ROOK: (color) => new Rook(color),
  BISHOP: (color) => new Bishop(color),
  KNIGHT: (color) => new Knight(color),
  PAWN: (color) => new Pawn(color),
};

const CHECKMATE_SCORE = 100000;

export function createSimulationBoard(snapshot: GameSnapshot): Board {
  const board = new Board(snapshot.rows, snapshot.cols);
  const moves = snapshot.moveHistory;

  const whiteKingMoved = moves.some((m) => m.turn === 'WHITE' && m.piece === 'KING');
  const blackKingMoved = moves.some((m) => m.turn === 'BLACK' && m.piece === 'KING');
  const whiteRookA1Moved = moves.some((m) => m.turn === 'WHITE' && m.from === 'a1');
  const whiteRookH1Moved = moves.some((m) => m.turn === 'WHITE' && m.from === 'h1');
  const blackRookA8Moved = moves.some((m) => m.turn === 'BLACK' && m.from === 'a8');
  const blackRookH8Moved = moves.some((m) => m.turn === 'BLACK' && m.from === 'h8');

  for (let row = 0; row < snapshot.rows; row++) {
    for (let col = 0; col < snapshot.cols; col++) {
      const pieceSnapshot = snapshot.grid[row][col];
      if (pieceSnapshot) {
        const factory = PIECE_FACTORIES[pieceSnapshot.type];
        if (factory) {
          const piece = factory(pieceSnapshot.color);
          const pos = new Position(row, col);
          const algebraic = pos.toAlgebraic();

          let isMoved = false;
          if (piece.type === 'KING') {
            if (piece.color === 'WHITE' && (whiteKingMoved || algebraic !== 'e1')) {
              isMoved = true;
            } else if (piece.color === 'BLACK' && (blackKingMoved || algebraic !== 'e8')) {
              isMoved = true;
            }
          } else if (piece.type === 'ROOK') {
            if (piece.color === 'WHITE') {
              if (algebraic === 'a1' && whiteRookA1Moved) isMoved = true;
              else if (algebraic === 'h1' && whiteRookH1Moved) isMoved = true;
              else if (algebraic !== 'a1' && algebraic !== 'h1') isMoved = true;
            } else {
              if (algebraic === 'a8' && blackRookA8Moved) isMoved = true;
              else if (algebraic === 'h8' && blackRookH8Moved) isMoved = true;
              else if (algebraic !== 'a8' && algebraic !== 'h8') isMoved = true;
            }
          } else if (piece.type === 'PAWN') {
            const initialRow = piece.color === 'WHITE' ? 1 : snapshot.rows - 2;
            if (row !== initialRow) {
              isMoved = true;
            }
          }

          board.placePiece(pos, piece);
          if (isMoved) {
            board.setPieceMoved(piece, true);
          }
        }
      }
    }
  }

  if (moves.length > 0) {
    const lastMove = moves[moves.length - 1];
    if (lastMove.piece === 'PAWN') {
      try {
        const fromPos = Position.fromAlgebraic(lastMove.from);
        const toPos = Position.fromAlgebraic(lastMove.to);
        if (Math.abs(toPos.row - fromPos.row) === 2) {
          const skippedRow = (fromPos.row + toPos.row) / 2;
          board.setEnPassantTarget(new Position(skippedRow, fromPos.col));
        }
      } catch {
        return board;
      }
    }
  }

  return board;
}

export function getLegalMovesForColor(
  board: Board,
  color: Color,
  checkDetector: CheckDetector
): AiMove[] {
  const placements = board.getPiecesByColor(color);
  const legalMoves: AiMove[] = [];

  for (const placement of placements) {
    const pseudoMoves = placement.piece.getPseudoLegalMoves(placement.position, board);
    for (const target of pseudoMoves) {
      const sim = new MoveCommand(board, placement.position, target);
      sim.execute();
      let leavesKingInCheck = false;
      try {
        leavesKingInCheck = checkDetector.isKingInCheck(board, color);
      } finally {
        sim.undo();
      }
      if (!leavesKingInCheck) {
        legalMoves.push({ from: placement.position, to: target });
      }
    }
  }

  return legalMoves;
}

export function orderCandidateMoves(
  moves: AiMove[],
  board: Board,
  pieceValues: Record<string, number>
): AiMove[] {
  return moves.slice().sort((a, b) => {
    const victimA = board.getPieceAt(a.to);
    const attackerA = board.getPieceAt(a.from);
    const scoreA = victimA
      ? (pieceValues[victimA.type] ?? 100) * 10 - (pieceValues[attackerA?.type ?? 'PAWN'] ?? 100)
      : 0;

    const victimB = board.getPieceAt(b.to);
    const attackerB = board.getPieceAt(b.from);
    const scoreB = victimB
      ? (pieceValues[victimB.type] ?? 100) * 10 - (pieceValues[attackerB?.type ?? 'PAWN'] ?? 100)
      : 0;

    return scoreB - scoreA;
  });
}

export function evaluateBoardPosition(
  board: Board,
  aiColor: Color,
  opponentColor: Color,
  checkDetector: CheckDetector,
  config: AmateurAiConfig,
  moveHistory: readonly MoveRecord[]
): number {
  let score = 0;

  const aiPieces = board.getPiecesByColor(aiColor);
  const opponentPieces = board.getPiecesByColor(opponentColor);

  for (const p of aiPieces) {
    score += config.pieceValues[p.piece.type] ?? 100;
  }
  for (const p of opponentPieces) {
    score -= config.pieceValues[p.piece.type] ?? 100;
  }

  const midRow = Math.floor(board.rows / 2);
  const midCol = Math.floor(board.cols / 2);
  const coreCenterRows = [midRow - 1, midRow];
  const coreCenterCols = [midCol - 1, midCol];

  for (const p of aiPieces) {
    const isCoreCenter =
      coreCenterRows.includes(p.position.row) && coreCenterCols.includes(p.position.col);
    if (isCoreCenter) {
      score += config.centerControlScore;
    } else if (
      p.position.row >= midRow - 2 &&
      p.position.row <= midRow + 1 &&
      p.position.col >= midCol - 2 &&
      p.position.col <= midCol + 1
    ) {
      score += Math.round(config.centerControlScore * 0.4);
    }
  }

  for (const p of opponentPieces) {
    const isCoreCenter =
      coreCenterRows.includes(p.position.row) && coreCenterCols.includes(p.position.col);
    if (isCoreCenter) {
      score -= config.centerControlScore;
    } else if (
      p.position.row >= midRow - 2 &&
      p.position.row <= midRow + 1 &&
      p.position.col >= midCol - 2 &&
      p.position.col <= midCol + 1
    ) {
      score -= Math.round(config.centerControlScore * 0.4);
    }
  }

  const isOpeningPhase = moveHistory.length <= 20;
  if (isOpeningPhase) {
    const aiHomeRow = aiColor === 'WHITE' ? 0 : board.rows - 1;
    const oppHomeRow = opponentColor === 'WHITE' ? 0 : board.rows - 1;

    let aiMinorPiecesDeveloped = 0;
    for (const p of aiPieces) {
      if (p.piece.type === 'KNIGHT' || p.piece.type === 'BISHOP') {
        if (p.position.row !== aiHomeRow) {
          score += config.openingDevelopmentScore;
          aiMinorPiecesDeveloped += 1;
        }
      } else if (p.piece.type === 'QUEEN') {
        if (p.position.row !== aiHomeRow && aiMinorPiecesDeveloped < 2) {
          score -= config.earlyQueenPenalty;
        }
      }
    }

    let oppMinorPiecesDeveloped = 0;
    for (const p of opponentPieces) {
      if (p.piece.type === 'KNIGHT' || p.piece.type === 'BISHOP') {
        if (p.position.row !== oppHomeRow) {
          score -= config.openingDevelopmentScore;
          oppMinorPiecesDeveloped += 1;
        }
      } else if (p.piece.type === 'QUEEN') {
        if (p.position.row !== oppHomeRow && oppMinorPiecesDeveloped < 2) {
          score += config.earlyQueenPenalty;
        }
      }
    }
  }

  const aiHasCastled = moveHistory.some((m) => m.turn === aiColor && m.isCastling);
  if (aiHasCastled) {
    score += config.castlingBonus;
  } else {
    const aiKing = board.findKingPosition(aiColor);
    const aiKingPiece = aiKing ? board.getPieceAt(aiKing) : null;
    if (aiKingPiece && board.hasPieceMoved(aiKingPiece)) {
      score -= config.kingMovedWithoutCastlingPenalty;
    }
  }

  const oppHasCastled = moveHistory.some((m) => m.turn === opponentColor && m.isCastling);
  if (oppHasCastled) {
    score -= config.castlingBonus;
  } else {
    const oppKing = board.findKingPosition(opponentColor);
    const oppKingPiece = oppKing ? board.getPieceAt(oppKing) : null;
    if (oppKingPiece && board.hasPieceMoved(oppKingPiece)) {
      score += config.kingMovedWithoutCastlingPenalty;
    }
  }

  if (checkDetector.isKingInCheck(board, opponentColor)) {
    score += config.checkBonus;
  }
  if (checkDetector.isKingInCheck(board, aiColor)) {
    score -= config.checkBonus;
  }

  const aiPawnsPerCol: number[] = Array(board.cols).fill(0);
  for (const p of aiPieces) {
    if (p.piece.type === 'PAWN') {
      aiPawnsPerCol[p.position.col] += 1;
    }
  }
  for (const count of aiPawnsPerCol) {
    if (count > 1) {
      score -= (count - 1) * config.doubledPawnPenalty;
    }
  }

  const oppPawnsPerCol: number[] = Array(board.cols).fill(0);
  for (const p of opponentPieces) {
    if (p.piece.type === 'PAWN') {
      oppPawnsPerCol[p.position.col] += 1;
    }
  }
  for (const count of oppPawnsPerCol) {
    if (count > 1) {
      score += (count - 1) * config.doubledPawnPenalty;
    }
  }

  return score;
}

export function runMinimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  currentTurn: Color,
  aiColor: Color,
  checkDetector: CheckDetector,
  config: AmateurAiConfig,
  moveHistory: readonly MoveRecord[]
): number {
  const opponentColor = OPPOSITE_COLOR[aiColor];
  const inCheck = checkDetector.isKingInCheck(board, currentTurn);
  const legalMoves = getLegalMovesForColor(board, currentTurn, checkDetector);

  if (legalMoves.length === 0) {
    if (inCheck) {
      return currentTurn === aiColor ? -CHECKMATE_SCORE - depth : CHECKMATE_SCORE + depth;
    }
    return 0;
  }

  if (depth === 0) {
    return evaluateBoardPosition(board, aiColor, opponentColor, checkDetector, config, moveHistory);
  }

  const orderedMoves = orderCandidateMoves(legalMoves, board, config.pieceValues);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      const command = new MoveCommand(board, move.from, move.to);
      command.execute();
      const evaluation = runMinimax(
        board,
        depth - 1,
        alpha,
        beta,
        false,
        OPPOSITE_COLOR[currentTurn],
        aiColor,
        checkDetector,
        config,
        moveHistory
      );
      command.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      const command = new MoveCommand(board, move.from, move.to);
      command.execute();
      const evaluation = runMinimax(
        board,
        depth - 1,
        alpha,
        beta,
        true,
        OPPOSITE_COLOR[currentTurn],
        aiColor,
        checkDetector,
        config,
        moveHistory
      );
      command.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

export class AmateurAiStrategy implements IAiStrategy {
  private readonly config: AmateurAiConfig;
  private readonly rng: RandomGenerator;

  constructor(
    config: Partial<AmateurAiConfig> = {},
    rng: RandomGenerator = Math.random
  ) {
    this.config = { ...DEFAULT_AMATEUR_CONFIG, ...config };
    this.rng = rng;
  }

  getConfig(): AmateurAiConfig {
    return this.config;
  }

  chooseMove(engine: IGameEngine): AiMove | null {
    const candidateMoves = collectCandidateMoves(engine);
    if (candidateMoves.length === 0) {
      return null;
    }

    if (candidateMoves.length === 1) {
      return candidateMoves[0];
    }

    const snapshot = engine.getSnapshot();
    const aiColor = snapshot.currentTurn;
    const opponentColor = OPPOSITE_COLOR[aiColor];
    const checkDetector = new CheckDetector();
    const board = createSimulationBoard(snapshot);

    const movesHistory = snapshot.moveHistory;
    const lastAiMoveRecord = movesHistory
      .slice()
      .reverse()
      .find((m) => m.turn === aiColor);

    const scoredMoves: { move: AiMove; score: number }[] = [];

    for (const move of candidateMoves) {
      const movedPiece = board.getPieceAt(move.from);
      if (!movedPiece) continue;

      const isEnPassant =
        movedPiece.type === 'PAWN' &&
        board.getEnPassantTarget()?.equals(move.to) &&
        move.from.col !== move.to.col &&
        board.isSquareEmpty(move.to);

      let isRetreatAfterAdvance = false;
      if (lastAiMoveRecord) {
        try {
          const prevFrom = Position.fromAlgebraic(lastAiMoveRecord.from);
          const prevTo = Position.fromAlgebraic(lastAiMoveRecord.to);
          const isForwardAdvance =
            aiColor === 'WHITE' ? prevTo.row > prevFrom.row : prevTo.row < prevFrom.row;

          if (isForwardAdvance && move.from.equals(prevTo) && move.to.equals(prevFrom)) {
            isRetreatAfterAdvance = true;
          }
        } catch {
          isRetreatAfterAdvance = false;
        }
      }

      const command = new MoveCommand(board, move.from, move.to);
      command.execute();

      let moveScore: number;
      const putsOpponentInCheck = checkDetector.isKingInCheck(board, opponentColor);
      if (putsOpponentInCheck) {
        const oppMoves = getLegalMovesForColor(board, opponentColor, checkDetector);
        if (oppMoves.length === 0) {
          moveScore = CHECKMATE_SCORE;
        } else {
          moveScore = runMinimax(
            board,
            this.config.searchDepth - 1,
            -Infinity,
            Infinity,
            false,
            opponentColor,
            aiColor,
            checkDetector,
            this.config,
            movesHistory
          );
        }
      } else {
        moveScore = runMinimax(
          board,
          this.config.searchDepth - 1,
          -Infinity,
          Infinity,
          false,
          opponentColor,
          aiColor,
          checkDetector,
          this.config,
          movesHistory
        );
      }

      command.undo();

      if (isEnPassant) {
        moveScore += this.config.enPassantBonus;
      }

      if (isRetreatAfterAdvance) {
        moveScore -= this.config.retreatAfterAdvancePenalty;
      }

      if (movedPiece.type !== 'PAWN') {
        moveScore += this.config.preferOtherPiecesBonus;
      }

      scoredMoves.push({ move, score: moveScore });
    }

    if (scoredMoves.length === 0) {
      return candidateMoves[0];
    }

    scoredMoves.sort((a, b) => b.score - a.score);
    const highestScore = scoredMoves[0].score;

    if (highestScore >= CHECKMATE_SCORE - 100) {
      return scoredMoves[0].move;
    }

    const isBlunder = this.rng() < this.config.blunderRate;
    if (isBlunder) {
      let blunderPool = scoredMoves.filter(
        (sm) =>
          sm.score < highestScore - this.config.candidateScoreTolerance &&
          sm.score >= highestScore - this.config.maxBlunderDrop
      );

      if (blunderPool.length === 0) {
        blunderPool = scoredMoves
          .slice(1, 4)
          .filter((sm) => sm.score >= highestScore - this.config.maxBlunderDrop);
      }

      if (blunderPool.length > 0) {
        const selectedIndex = Math.floor(this.rng() * blunderPool.length);
        return blunderPool[selectedIndex].move;
      }
    }

    const effectiveTolerance = Math.min(
      this.config.candidateScoreTolerance,
      this.config.maxBlunderDrop
    );
    const topCandidates = scoredMoves.filter(
      (sm) => sm.score >= highestScore - effectiveTolerance
    );

    const selectedIndex = Math.floor(this.rng() * topCandidates.length);
    return topCandidates[selectedIndex].move;
  }
}
