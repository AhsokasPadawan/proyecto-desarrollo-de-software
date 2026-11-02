import { describe, expect, it } from 'vitest';
import seedLibraryData from '../../src/adapters/storage/chess-library.json';
import { SavedAnnotatedMatchRecord } from '../../src/adapters/storage/IChessLibraryRepository';
import { hydrateSavedAnnotatedMatch } from '../../src/adapters/web/matches/savedMatchHydrator';

describe('hydrateSavedAnnotatedMatch (Ticket 44)', () => {
  it('hydrates preloaded Scholars Mate match into ChessGame and supports full undo/redo replay', () => {
    const scholarsMate = seedLibraryData.annotatedMatches.find(
      (item) => item.id === 'match-scholars-mate'
    ) as unknown as SavedAnnotatedMatchRecord;
    const engine = hydrateSavedAnnotatedMatch(scholarsMate);

    const finalSnapshot = engine.getSnapshot();
    expect(finalSnapshot.moveHistory).toHaveLength(7);
    expect(finalSnapshot.stateKind).toBe('CHECKMATE');
    expect(finalSnapshot.winner).toBe('WHITE');

    while (engine.undo()) {}
    expect(engine.getSnapshot().currentMoveIndex).toBe(0);

    expect(engine.redo()).toBe(true);
    expect(engine.getSnapshot().currentMoveIndex).toBe(1);
    expect(engine.getSnapshot().moveHistory[0].from).toBe('e2');
    expect(engine.getSnapshot().moveHistory[0].to).toBe('e4');
  });
});
