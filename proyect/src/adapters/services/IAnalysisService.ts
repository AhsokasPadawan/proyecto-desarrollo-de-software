import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { Color, PieceType } from '../../core/pieces/types';
import { MoveQualityDetails } from '../web/moveQualityEvaluator';

export interface AnalyzedMove {
  readonly moveIndex: number;
  readonly turn: Color;
  readonly piece: PieceType;
  readonly from: string;
  readonly to: string;
  readonly bestMoveFrom: string;
  readonly bestMoveTo: string;
  readonly evalBefore: number;
  readonly evalAfter: number;
  readonly evalLoss: number;
  readonly quality: MoveQualityDetails;
  readonly advice: string;
}

export interface FullGameAnalysisResult {
  readonly analyzedMoves: readonly AnalyzedMove[];
  readonly overallSummary: string;
  readonly whiteAccuracy: number;
  readonly blackAccuracy: number;
}

export interface LiveHintResult {
  readonly from: string;
  readonly to: string;
  readonly san: string;
  readonly evaluation: number;
  readonly advice: string;
}

export interface IAnalysisService {
  getLiveHint(snapshot: GameSnapshot): Promise<LiveHintResult>;
  analyzeFullGame(
    snapshot: GameSnapshot,
    onProgress?: (step: number, total: number) => void,
    engineFactory?: () => IGameEngine
  ): Promise<FullGameAnalysisResult>;
}
