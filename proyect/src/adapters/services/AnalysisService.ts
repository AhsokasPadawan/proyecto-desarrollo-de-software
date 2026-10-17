import { Position } from '../../core/board/Position';
import { ChessGame } from '../../core/game/ChessGame';
import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { FenSerializer } from '../../core/board/FenSerializer';
import { ChessApiService } from './ChessApiService';
import { GeminiCoachService } from './GeminiCoachService';
import { IChessEngine } from './IChessEngine';
import { AiCoachEvaluationContext, IAiCoachEngine } from './IAiCoachEngine';
import {
  AnalyzedMove,
  FullGameAnalysisResult,
  IAnalysisService,
  LiveHintResult,
} from './IAnalysisService';
import { classifyMoveQuality } from '../web/moveQualityEvaluator';

export type { AnalyzedMove, FullGameAnalysisResult, LiveHintResult, IAnalysisService };

export class AnalysisService implements IAnalysisService {
  private readonly chessEngine: IChessEngine;
  private readonly aiCoachEngine: IAiCoachEngine;

  constructor(
    chessEngine: IChessEngine = new ChessApiService(),
    aiCoachEngine: IAiCoachEngine = new GeminiCoachService()
  ) {
    this.chessEngine = chessEngine;
    this.aiCoachEngine = aiCoachEngine;
  }

  async getLiveHint(snapshot: GameSnapshot): Promise<LiveHintResult> {
    const fen = FenSerializer.serializeSnapshot(snapshot);
    const evaluation = await this.chessEngine.evaluatePosition(fen);

    let advice = 'No se pudo generar una explicación en este momento.';
    if (this.aiCoachEngine.hasApiKey()) {
      try {
        advice = await this.aiCoachEngine.requestLiveHint({
          currentTurn: snapshot.currentTurn,
          bestMoveFrom: evaluation.from,
          bestMoveTo: evaluation.to,
          currentEval: evaluation.eval,
          fen,
        });
      } catch {
        advice = 'No se pudo generar la explicación con el Coach de IA en este momento.';
      }
    } else {
      advice = 'Configura tu API Key de Gemini en el menú superior para recibir explicaciones didácticas del movimiento.';
    }

    return {
      from: evaluation.from,
      to: evaluation.to,
      san: evaluation.san,
      evaluation: evaluation.eval,
      advice,
    };
  }

  async analyzeFullGame(
    snapshot: GameSnapshot,
    onProgress?: (step: number, total: number) => void,
    engineFactory: () => IGameEngine = () => new ChessGame()
  ): Promise<FullGameAnalysisResult> {
    const movesToAnalyze = snapshot.moveHistory;
    if (movesToAnalyze.length === 0) {
      return {
        analyzedMoves: [],
        overallSummary: 'No hay jugadas registradas en la partida para analizar.',
        whiteAccuracy: 100,
        blackAccuracy: 100,
      };
    }

    const replayEngine = engineFactory();
    const fens: string[] = [FenSerializer.serializeSnapshot(replayEngine.getSnapshot())];

    for (const record of movesToAnalyze) {
      const fromPos = Position.fromAlgebraic(record.from);
      const toPos = Position.fromAlgebraic(record.to);
      replayEngine.makeMove(fromPos, toPos, record.promotionPiece);
      fens.push(FenSerializer.serializeSnapshot(replayEngine.getSnapshot()));
    }

    const totalSteps = fens.length + (this.aiCoachEngine.hasApiKey() ? 1 : 0);
    let completedSteps = 0;

    const evaluations = await this.chessEngine.evaluateSequence(fens, (completed) => {
      completedSteps = completed;
      onProgress?.(completedSteps, totalSteps);
    });

    const evaluatedMoveContexts: AiCoachEvaluationContext[] = [];
    const analyzedMovesDraft: Array<Omit<AnalyzedMove, 'advice'>> = [];

    for (let index = 0; index < movesToAnalyze.length; index++) {
      const record = movesToAnalyze[index];
      const evalBeforeObj = evaluations[index];
      const evalAfterObj = evaluations[index + 1];

      const evalBefore = evalBeforeObj ? evalBeforeObj.eval : 0;
      const evalAfter = evalAfterObj ? evalAfterObj.eval : 0;

      const bestMoveFrom = evalBeforeObj?.from ?? '';
      const bestMoveTo = evalBeforeObj?.to ?? '';

      const wasBestMove =
        bestMoveFrom.toLowerCase() === record.from.toLowerCase() &&
        bestMoveTo.toLowerCase() === record.to.toLowerCase();

      const rawLoss =
        record.turn === 'WHITE' ? evalBefore - evalAfter : evalAfter - evalBefore;
      const evalLoss = wasBestMove ? 0 : Math.max(0, rawLoss);

      const quality = classifyMoveQuality(evalLoss, wasBestMove);

      evaluatedMoveContexts.push({
        moveIndex: index,
        turn: record.turn,
        piece: record.piece,
        playedMove: `${record.from} -> ${record.to}`,
        bestMove: `${bestMoveFrom} -> ${bestMoveTo}`,
        quality: quality.quality,
        evalBefore,
        evalAfter,
        evalLoss,
      });

      analyzedMovesDraft.push({
        moveIndex: index,
        turn: record.turn,
        piece: record.piece,
        from: record.from,
        to: record.to,
        bestMoveFrom,
        bestMoveTo,
        evalBefore,
        evalAfter,
        evalLoss,
        quality,
      });
    }

    let batchReview = {
      overallSummary: 'Partida analizada con motor táctico. Añade tu API Key de Gemini para comentarios didácticos.',
      moveAdvices: {} as Record<number, string>,
    };

    if (this.aiCoachEngine.hasApiKey()) {
      try {
        batchReview = await this.aiCoachEngine.requestBatchReview(evaluatedMoveContexts);
      } catch {
        batchReview = {
          overallSummary: 'Partida analizada con éxito mediante motor táctico.',
          moveAdvices: {},
        };
      }
      completedSteps += 1;
      onProgress?.(completedSteps, totalSteps);
    }

    const analyzedMoves: AnalyzedMove[] = analyzedMovesDraft.map((draft, idx) => ({
      ...draft,
      advice:
        batchReview.moveAdvices[idx] ??
        (draft.evalLoss === 0
          ? `${draft.quality.label} (${draft.quality.symbol}). Jugada óptima según el motor táctico.`
          : `${draft.quality.label} (${draft.quality.symbol}). Pérdida de ventaja: ${draft.evalLoss.toFixed(2)} peones.`),
    }));

    const whiteAcc = this.calculateAccuracy(
      analyzedMoves.filter((m) => m.turn === 'WHITE')
    );
    const blackAcc = this.calculateAccuracy(
      analyzedMoves.filter((m) => m.turn === 'BLACK')
    );

    return {
      analyzedMoves,
      overallSummary: batchReview.overallSummary,
      whiteAccuracy: whiteAcc,
      blackAccuracy: blackAcc,
    };
  }

  private calculateAccuracy(moves: readonly AnalyzedMove[]): number {
    if (moves.length === 0) {
      return 100;
    }

    const accuracyLookup: Record<string, number> = {
      BEST: 100,
      EXCELLENT: 95,
      GOOD: 85,
      INACCURACY: 65,
      MISTAKE: 40,
      BLUNDER: 10,
    };

    const totalScore = moves.reduce(
      (sum, move) => sum + (accuracyLookup[move.quality.quality] ?? 70),
      0
    );

    return Math.round(totalScore / moves.length);
  }
}
