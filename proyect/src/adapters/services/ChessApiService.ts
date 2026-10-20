import { EngineEvaluation, IChessEngine } from './IChessEngine';

export type ChessApiEvaluation = EngineEvaluation;

export class ChessApiService implements IChessEngine {
  private readonly endpointUrl: string;

  constructor(endpointUrl: string = 'https://chess-api.com/v1') {
    this.endpointUrl = endpointUrl;
  }

  async evaluatePosition(fen: string, depth: number = 10): Promise<EngineEvaluation> {
    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, depth, maxThinkingTime: 50 }),
    });

    if (!response.ok) {
      throw new Error(`Chess API request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();

    return {
      from: payload.from ?? '',
      to: payload.to ?? '',
      san: payload.san ?? '',
      eval: typeof payload.eval === 'number' ? payload.eval : 0,
      mate: typeof payload.mate === 'number' ? payload.mate : null,
      winChance: typeof payload.winChance === 'number' ? payload.winChance : 50,
      continuation: Array.isArray(payload.continuationArr) ? payload.continuationArr : [],
      rawText: payload.text ?? '',
    };
  }

  async evaluateSequence(
    fens: readonly string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<readonly EngineEvaluation[]> {
    const results: EngineEvaluation[] = [];

    for (let index = 0; index < fens.length; index++) {
      const evaluation = await this.evaluatePosition(fens[index]);
      results.push(evaluation);
      onProgress?.(index + 1, fens.length);
    }

    return results;
  }
}
