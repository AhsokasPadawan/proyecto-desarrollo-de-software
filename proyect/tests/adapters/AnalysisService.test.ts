import { describe, expect, it, vi } from 'vitest';
import { AnalysisService } from '../../src/adapters/services/AnalysisService';
import { IChessEngine } from '../../src/adapters/services/IChessEngine';
import { IAiCoachEngine } from '../../src/adapters/services/IAiCoachEngine';
import { ChessGame } from '../../src/core/game/ChessGame';
import { Position } from '../../src/core/board/Position';

describe('AnalysisService', () => {
  it('analyzes empty game gracefully', async () => {
    const game = new ChessGame();
    const service = new AnalysisService();
    const result = await service.analyzeFullGame(game.getSnapshot());

    expect(result.analyzedMoves).toHaveLength(0);
    expect(result.whiteAccuracy).toBe(100);
    expect(result.blackAccuracy).toBe(100);
  });

  it('evaluates game moves and assigns qualities with mock engine', async () => {
    const game = new ChessGame();
    game.makeMove(Position.fromAlgebraic('e2'), Position.fromAlgebraic('e4'));
    game.makeMove(Position.fromAlgebraic('e7'), Position.fromAlgebraic('e5'));

    const mockChessEngine: IChessEngine = {
      evaluatePosition: vi.fn().mockResolvedValue({
        from: 'e2',
        to: 'e4',
        san: 'e4',
        eval: 0.2,
        mate: null,
        winChance: 52,
        continuation: [],
        rawText: '',
      }),
      evaluateSequence: vi.fn().mockResolvedValue([
        { from: 'e2', to: 'e4', eval: 0.2, san: '', mate: null, winChance: 50, continuation: [], rawText: '' },
        { from: 'e7', to: 'e5', eval: 0.15, san: '', mate: null, winChance: 50, continuation: [], rawText: '' },
        { from: 'g1', to: 'f3', eval: 0.2, san: '', mate: null, winChance: 50, continuation: [], rawText: '' },
      ]),
    };

    const mockAiCoachEngine: IAiCoachEngine = {
      hasApiKey: vi.fn().mockReturnValue(true),
      requestBatchReview: vi.fn().mockResolvedValue({
        overallSummary: 'Partida equilibrada.',
        moveAdvices: {
          0: 'Excelente ocupación del centro con el peón de rey.',
          1: 'Buena respuesta simétrica para disputar el centro.',
        },
      }),
      requestLiveHint: vi.fn(),
    };

    const service = new AnalysisService(mockChessEngine, mockAiCoachEngine);
    const result = await service.analyzeFullGame(game.getSnapshot());

    expect(result.analyzedMoves).toHaveLength(2);
    expect(result.analyzedMoves[0].quality.quality).toBe('BEST');
    expect(result.analyzedMoves[0].advice).toContain('ocupación del centro');
    expect(result.overallSummary).toBe('Partida equilibrada.');
    expect(result.whiteAccuracy).toBeGreaterThan(90);
  });

  it('requests live hint with engine and gemini', async () => {
    const game = new ChessGame();
    const mockChessEngine: IChessEngine = {
      evaluatePosition: vi.fn().mockResolvedValue({
        from: 'e2',
        to: 'e4',
        san: 'e4',
        eval: 0.3,
        mate: null,
        winChance: 53,
        continuation: [],
        rawText: '',
      }),
      evaluateSequence: vi.fn(),
    };

    const mockAiCoachEngine: IAiCoachEngine = {
      hasApiKey: vi.fn().mockReturnValue(true),
      requestLiveHint: vi.fn().mockResolvedValue('Abre camino a la dama y al alfil.'),
      requestBatchReview: vi.fn(),
    };

    const service = new AnalysisService(mockChessEngine, mockAiCoachEngine);
    const hint = await service.getLiveHint(game.getSnapshot());

    expect(hint.from).toBe('e2');
    expect(hint.to).toBe('e4');
    expect(hint.advice).toBe('Abre camino a la dama y al alfil.');
  });
});
