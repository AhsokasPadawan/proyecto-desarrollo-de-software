import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IChessLibraryRepository,
  MatePuzzleRecord,
  SavedAnnotatedMatchRecord,
  StudyPositionRecord,
} from '../../src/adapters/storage/IChessLibraryRepository';
import { JsonFileLibraryAdapter } from '../../src/adapters/storage/JsonFileLibraryAdapter';

describe('JsonFileLibraryAdapter (IChessLibraryRepository seam)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads preloaded study positions, mate puzzles, and annotated matches from the JSON library', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network unavailable in unit test'));
    const repository: IChessLibraryRepository = new JsonFileLibraryAdapter();

    const studies = await repository.getStudyPositions();
    const puzzles = await repository.getMatePuzzles();
    const matches = await repository.getAnnotatedMatches();

    expect(studies.length).toBeGreaterThanOrEqual(3);
    expect(puzzles.length).toBeGreaterThanOrEqual(3);
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(matches[0].analysisResult.analyzedMoves.length).toBe(matches[0].moves.length);
  });

  it('saves a new study position and retrieves it via getStudyPositions', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
    } as Response);
    const repository: IChessLibraryRepository = new JsonFileLibraryAdapter();

    const newStudy: StudyPositionRecord = {
      id: 'study-custom-knight',
      title: 'Salto del Caballo en Solitario',
      description: 'Caballo blanco en e4 para practicar las 8 casillas de salto.',
      initialTurn: 'WHITE',
      pieces: [{ square: 'e4', type: 'KNIGHT', color: 'WHITE' }],
    };

    await repository.saveStudyPosition(newStudy);
    const studies = await repository.getStudyPositions();

    expect(studies.some((item) => item.id === 'study-custom-knight')).toBe(true);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('saves a new mate puzzle and a new annotated match through the repository contract', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
    } as Response);
    const repository: IChessLibraryRepository = new JsonFileLibraryAdapter();

    const newPuzzle: MatePuzzleRecord = {
      id: 'puzzle-custom-mate-1',
      title: 'Mate del Pasillo Simple',
      description: 'Blancas dan mate en 1 con la torre en la octava fila.',
      initialTurn: 'WHITE',
      maxMoves: 1,
      pieces: [
        { square: 'g1', type: 'KING', color: 'WHITE' },
        { square: 'a1', type: 'ROOK', color: 'WHITE' },
        { square: 'g8', type: 'KING', color: 'BLACK' },
        { square: 'f7', type: 'PAWN', color: 'BLACK' },
        { square: 'g7', type: 'PAWN', color: 'BLACK' },
        { square: 'h7', type: 'PAWN', color: 'BLACK' },
      ],
      opponentResponses: [],
    };

    const newMatch: SavedAnnotatedMatchRecord = {
      id: 'match-custom-saved',
      title: 'Apertura Italiana Comentada',
      description: 'Primeros pasos explicados por Gemini.',
      moves: [
        {
          moveIndex: 0,
          turn: 'WHITE',
          piece: 'PAWN',
          from: 'e2',
          to: 'e4',
          isCastling: false,
          isPromotion: false,
        },
      ],
      analysisResult: {
        overallSummary: 'Buen control central.',
        whiteAccuracy: 100,
        blackAccuracy: 100,
        analyzedMoves: [
          {
            moveIndex: 0,
            turn: 'WHITE',
            piece: 'PAWN',
            from: 'e2',
            to: 'e4',
            bestMoveFrom: 'e2',
            bestMoveTo: 'e4',
            evalBefore: 0.2,
            evalAfter: 0.2,
            evalLoss: 0,
            quality: {
              quality: 'BEST',
              label: 'Mejor jugada',
              symbol: '★',
              badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            },
            advice: 'Ocupa el centro inmediatamente y libera al alfil y la dama.',
          },
        ],
      },
    };

    await repository.saveMatePuzzle(newPuzzle);
    await repository.saveAnnotatedMatch(newMatch);

    const puzzles = await repository.getMatePuzzles();
    const matches = await repository.getAnnotatedMatches();

    expect(puzzles.some((item) => item.id === 'puzzle-custom-mate-1')).toBe(true);
    expect(matches.some((item) => item.id === 'match-custom-saved')).toBe(true);
  });
});
