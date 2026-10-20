import { Color } from '../../core/pieces/types';
import { MoveQuality } from '../web/moveQualityEvaluator';

export interface AiCoachEvaluationContext {
  readonly moveIndex: number;
  readonly turn: Color;
  readonly piece: string;
  readonly playedMove: string;
  readonly bestMove: string;
  readonly quality: MoveQuality;
  readonly evalBefore: number;
  readonly evalAfter: number;
  readonly evalLoss: number;
}

export interface AiCoachLiveHintRequest {
  readonly currentTurn: Color;
  readonly bestMoveFrom: string;
  readonly bestMoveTo: string;
  readonly currentEval: number;
  readonly fen: string;
}

export interface AiCoachBatchReview {
  readonly overallSummary: string;
  readonly moveAdvices: Record<number, string>;
}

export interface IAiCoachEngine {
  hasApiKey(): boolean;
  requestLiveHint(hintRequest: AiCoachLiveHintRequest): Promise<string>;
  requestBatchReview(moves: readonly AiCoachEvaluationContext[]): Promise<AiCoachBatchReview>;
}
