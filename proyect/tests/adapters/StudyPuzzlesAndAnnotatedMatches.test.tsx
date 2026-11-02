import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import seedLibraryData from '../../src/adapters/storage/chess-library.json';
import {
  IChessLibraryRepository,
  MatePuzzleRecord,
  SavedAnnotatedMatchRecord,
  StudyPositionRecord,
} from '../../src/adapters/storage/IChessLibraryRepository';
import { ChessApp } from '../../src/adapters/web/ChessApp';

function createInMemoryLibraryRepository(): IChessLibraryRepository {
  let studies: StudyPositionRecord[] = [
    ...(seedLibraryData.studyPositions as unknown as StudyPositionRecord[]),
  ];
  let puzzles: MatePuzzleRecord[] = [
    ...(seedLibraryData.matePuzzles as unknown as MatePuzzleRecord[]),
  ];
  let matches: SavedAnnotatedMatchRecord[] = [
    ...(seedLibraryData.annotatedMatches as unknown as SavedAnnotatedMatchRecord[]),
  ];

  return {
    getStudyPositions: vi.fn(async () => studies),
    saveStudyPosition: vi.fn(async (record: StudyPositionRecord) => {
      studies = [...studies.filter((item) => item.id !== record.id), record];
    }),
    getMatePuzzles: vi.fn(async () => puzzles),
    saveMatePuzzle: vi.fn(async (record: MatePuzzleRecord) => {
      puzzles = [...puzzles.filter((item) => item.id !== record.id), record];
    }),
    getAnnotatedMatches: vi.fn(async () => matches),
    saveAnnotatedMatch: vi.fn(async (record: SavedAnnotatedMatchRecord) => {
      matches = [...matches.filter((item) => item.id !== record.id), record];
    }),
    deleteAnnotatedMatch: vi.fn(async (matchId: string) => {
      matches = matches.filter((item) => item.id !== matchId);
    }),
  };
}

describe('Epics 10, 11, and 12 UI Integration (Study Editor, Mate in X Puzzles, Annotated Matches)', () => {
  afterEach(() => {
    cleanup();
  });

  it('allows setting up a custom board in the visual editor, starting a study match, and saving/loading study positions and puzzles', async () => {
    const repository = createInMemoryLibraryRepository();
    render(<ChessApp libraryRepositoryFactory={() => repository} />);

    fireEvent.click(screen.getByTestId('activity-selector-study_editor'));

    await waitFor(() => {
      expect(screen.getByText('El Caballo Centralizado (Octopus Knight)')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('editor-clear-board-button'));
    fireEvent.click(screen.getByTestId('palette-tool-WHITE-KNIGHT'));
    fireEvent.click(screen.getByTestId('square-3-3'));

    fireEvent.change(screen.getByTestId('editor-title-input'), {
      target: { value: 'Mi Estudio de Caballo' },
    });
    fireEvent.change(screen.getByTestId('editor-description-input'), {
      target: { value: 'Caballo en d4 para enseñar saltos.' },
    });

    fireEvent.click(screen.getByTestId('save-study-position-button'));

    await waitFor(() => {
      expect(repository.saveStudyPosition).toHaveBeenCalled();
      expect(screen.getByText('Mi Estudio de Caballo')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('save-mate-puzzle-button'));
    await waitFor(() => {
      expect(repository.saveMatePuzzle).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('start-study-match-button'));

    expect(screen.getByTestId('game-state-banner').textContent).toContain('Partida de Estudio');

    fireEvent.click(screen.getByTestId('square-3-3'));
    fireEvent.click(screen.getByTestId('square-4-5'));

    expect(screen.getByTestId('turn-indicator').textContent).toContain('Blancas');
  });

  it('loads a Mate in X puzzle from the catalog and transitions to SOLVED upon delivering checkmate', async () => {
    const repository = createInMemoryLibraryRepository();
    render(<ChessApp libraryRepositoryFactory={() => repository} />);

    fireEvent.click(screen.getByTestId('activity-selector-mate_puzzles'));

    await waitFor(() => {
      expect(screen.getByTestId('select-puzzle-puzzle-kiss-of-death-mate-1')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('select-puzzle-puzzle-kiss-of-death-mate-1'));

    expect(screen.getByTestId('puzzle-remaining-moves').textContent).toContain('1');

    fireEvent.click(screen.getByTestId('square-5-7'));
    fireEvent.click(screen.getByTestId('square-6-6'));

    expect(screen.getByTestId('puzzle-status-badge').textContent).toContain('¡Ejercicio Resuelto!');
  });

  it('plays pre-saved annotated matches with step-by-step Gemini explanations and saves newly analyzed matches', async () => {
    const repository = createInMemoryLibraryRepository();
    render(<ChessApp libraryRepositoryFactory={() => repository} />);

    fireEvent.click(screen.getByTestId('activity-selector-annotated_matches'));

    await waitFor(() => {
      expect(screen.getByTestId('select-annotated-match-match-scholars-mate')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('select-annotated-match-match-scholars-mate'));

    expect(screen.getByTestId('replay-control-bar')).toBeDefined();

    fireEvent.click(screen.getByTestId('replay-next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('coach-analyzed-move-card').textContent).toContain(
        'Controla el centro de inmediato'
      );
    });

    fireEvent.change(screen.getByTestId('save-match-title-input'), {
      target: { value: 'Mi Partida Guardada' },
    });
    fireEvent.click(screen.getByTestId('save-annotated-match-button'));

    await waitFor(() => {
      expect(repository.saveAnnotatedMatch).toHaveBeenCalled();
      expect(screen.getByText('Mi Partida Guardada')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('delete-annotated-match-match-fools-mate'));
    await waitFor(() => {
      expect(repository.deleteAnnotatedMatch).toHaveBeenCalledWith('match-fools-mate');
    });
  });
});
