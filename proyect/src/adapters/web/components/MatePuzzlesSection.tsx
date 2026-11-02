import { MatePuzzleRecord } from '../../storage/IChessLibraryRepository';
import { PuzzleResolutionStatus } from '../puzzles/MatePuzzleController';
import { ControlSection } from './ControlSection';

const PUZZLE_STATUS_LOOKUP: Record<
  PuzzleResolutionStatus,
  { readonly label: string; readonly badgeClass: string }
> = {
  IN_PROGRESS: {
    label: 'Ejercicio en Curso',
    badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
  },
  SOLVED: {
    label: '¡Ejercicio Resuelto!',
    badgeClass: 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold',
  },
  FAILED: {
    label: 'No superado · Intentá de nuevo',
    badgeClass: 'bg-rose-950/90 border-rose-500 text-rose-200 font-bold',
  },
};

export interface MatePuzzlesSectionProps {
  readonly puzzles: readonly MatePuzzleRecord[];
  readonly activePuzzle: MatePuzzleRecord | null;
  readonly puzzleStatus: PuzzleResolutionStatus;
  readonly remainingMoves: number;
  readonly onSelectPuzzle: (puzzle: MatePuzzleRecord) => void;
  readonly onRetryPuzzle: () => void;
}

export function MatePuzzlesSection({
  puzzles,
  activePuzzle,
  puzzleStatus,
  remainingMoves,
  onSelectPuzzle,
  onRetryPuzzle,
}: MatePuzzlesSectionProps): JSX.Element {
  const statusInfo = PUZZLE_STATUS_LOOKUP[puzzleStatus];

  return (
    <div className="flex flex-col gap-3">
      {activePuzzle && (
        <ControlSection title={activePuzzle.title} hasDivider>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-300 leading-relaxed">{activePuzzle.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">
                  Movimientos Restantes
                </span>
                <span
                  className="text-sm font-extrabold text-amber-400"
                  data-testid="puzzle-remaining-moves"
                >
                  {remainingMoves} de {activePuzzle.maxMoves}
                </span>
              </div>
              <div
                className={`p-2 rounded-lg border flex items-center justify-center text-xs text-center ${statusInfo.badgeClass}`}
                data-testid="puzzle-status-badge"
              >
                {statusInfo.label}
              </div>
            </div>
            <button
              type="button"
              onClick={onRetryPuzzle}
              data-testid="puzzle-retry-button"
              className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700"
            >
              Reintentar Ejercicio
            </button>
          </div>
        </ControlSection>
      )}

      <ControlSection title={`Catálogo de Ejercicios (${puzzles.length})`} hasDivider>
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          {puzzles.map((puzzle) => {
            const isSelected = activePuzzle?.id === puzzle.id;
            return (
              <div
                key={puzzle.id}
                className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/60'
                    : 'bg-zinc-950/70 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-100 truncate">{puzzle.title}</span>
                  <button
                    type="button"
                    onClick={() => onSelectPuzzle(puzzle)}
                    data-testid={`select-puzzle-${puzzle.id}`}
                    className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold shrink-0"
                  >
                    Resolver (Mate en {puzzle.maxMoves})
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{puzzle.description}</p>
              </div>
            );
          })}
        </div>
      </ControlSection>
    </div>
  );
}
