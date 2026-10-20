export interface EngineEvaluation {
  readonly from: string;
  readonly to: string;
  readonly san: string;
  readonly eval: number;
  readonly mate: number | null;
  readonly winChance: number;
  readonly continuation: readonly string[];
  readonly rawText: string;
}

export interface IChessEngine {
  evaluatePosition(fen: string, depth?: number): Promise<EngineEvaluation>;
  evaluateSequence(
    fens: readonly string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<readonly EngineEvaluation[]>;
}
