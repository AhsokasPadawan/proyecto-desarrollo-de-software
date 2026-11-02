import { createBoardFromPlacements } from '../../../core/board/boardSetup';
import { Position } from '../../../core/board/Position';
import { ChessGame } from '../../../core/game/ChessGame';
import { StudyPlayState } from '../../../core/game/StudyPlayState';
import { PieceType } from '../../../core/pieces/types';
import { IGameEngine } from '../../../core/ports/IGameEngine';
import { MoveResult, isTerminalState } from '../../../core/ports/MoveResult';
import { GreedyMaterialAiStrategy } from '../../../core/strategy/GreedyMaterialAiStrategy';
import { MatePuzzleRecord } from '../../storage/IChessLibraryRepository';

export type PuzzleResolutionStatus = 'IN_PROGRESS' | 'SOLVED' | 'FAILED';

export class MatePuzzleController {
  private readonly puzzle: MatePuzzleRecord;
  private engine: IGameEngine;
  private playerMovesUsed: number = 0;
  private status: PuzzleResolutionStatus = 'IN_PROGRESS';
  private turnPlyCounts: number[] = [];

  constructor(puzzle: MatePuzzleRecord) {
    this.puzzle = puzzle;
    this.engine = this.createPuzzleEngine();
  }

  getEngine(): IGameEngine {
    return this.engine;
  }

  getPuzzle(): MatePuzzleRecord {
    return this.puzzle;
  }

  getStatus(): PuzzleResolutionStatus {
    return this.status;
  }

  getRemainingMoves(): number {
    return Math.max(0, this.puzzle.maxMoves - this.playerMovesUsed);
  }

  resetPuzzle(): IGameEngine {
    this.playerMovesUsed = 0;
    this.status = 'IN_PROGRESS';
    this.turnPlyCounts = [];
    this.engine = this.createPuzzleEngine();
    return this.engine;
  }

  undoPlayerMove(): void {
    const lastPlyCount = this.turnPlyCounts.pop();
    if (!lastPlyCount) {
      return;
    }
    for (let i = 0; i < lastPlyCount; i += 1) {
      this.engine.undo();
    }
    this.playerMovesUsed = Math.max(0, this.playerMovesUsed - 1);
    this.status = 'IN_PROGRESS';
  }

  makePlayerMove(from: Position, to: Position, promotionPiece?: PieceType): MoveResult {
    if (this.status !== 'IN_PROGRESS') {
      return { success: false, reason: 'GAME_OVER' };
    }

    const result = this.engine.makeMove(from, to, promotionPiece);
    if (!result.success) {
      return result;
    }

    this.playerMovesUsed += 1;
    const afterPlayerSnap = this.engine.getSnapshot();

    if (
      afterPlayerSnap.stateKind === 'CHECKMATE' &&
      afterPlayerSnap.winner === this.puzzle.initialTurn
    ) {
      this.turnPlyCounts.push(1);
      this.status = 'SOLVED';
      return result;
    }

    if (this.playerMovesUsed >= this.puzzle.maxMoves || isTerminalState(afterPlayerSnap.stateKind)) {
      this.turnPlyCounts.push(1);
      this.status = 'FAILED';
      return result;
    }

    const opponentMoved = this.executeOpponentDefensiveResponse(this.playerMovesUsed - 1);
    this.turnPlyCounts.push(opponentMoved ? 2 : 1);

    const afterOpponentSnap = this.engine.getSnapshot();
    if (isTerminalState(afterOpponentSnap.stateKind)) {
      this.status =
        afterOpponentSnap.stateKind === 'CHECKMATE' &&
        afterOpponentSnap.winner === this.puzzle.initialTurn
          ? 'SOLVED'
          : 'FAILED';
    }

    return result;
  }

  private executeOpponentDefensiveResponse(responseIndex: number): boolean {
    const scriptedStep = this.puzzle.opponentResponses[responseIndex];
    if (scriptedStep) {
      const fromPos = Position.fromAlgebraic(scriptedStep.from);
      const toPos = Position.fromAlgebraic(scriptedStep.to);
      const scriptedOutcome = this.engine.makeMove(fromPos, toPos, scriptedStep.promotionPiece);
      if (scriptedOutcome.success) {
        return true;
      }
    }

    const fallbackStrategy = new GreedyMaterialAiStrategy();
    const fallbackMove = fallbackStrategy.chooseMove(this.engine);
    if (fallbackMove) {
      const fallbackOutcome = this.engine.makeMove(fallbackMove.from, fallbackMove.to);
      return fallbackOutcome.success;
    }
    return false;
  }

  private createPuzzleEngine(): IGameEngine {
    const board = createBoardFromPlacements(this.puzzle.pieces);
    return new ChessGame(
      board,
      this.puzzle.initialTurn,
      undefined,
      undefined,
      new StudyPlayState()
    );
  }
}
