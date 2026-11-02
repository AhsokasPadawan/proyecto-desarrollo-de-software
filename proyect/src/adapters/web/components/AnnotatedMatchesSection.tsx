import { useState } from 'react';
import { SavedAnnotatedMatchRecord } from '../../storage/IChessLibraryRepository';
import { ControlSection } from './ControlSection';

export interface AnnotatedMatchesSectionProps {
  readonly annotatedMatches: readonly SavedAnnotatedMatchRecord[];
  readonly activeMatchId: string | null;
  readonly canSaveCurrentMatch: boolean;
  readonly onSelectMatch: (match: SavedAnnotatedMatchRecord) => void;
  readonly onSaveCurrentMatch: (title: string, description: string) => Promise<boolean> | void;
  readonly onDeleteMatch?: (matchId: string) => void;
}

export function SaveAnnotatedMatchForm({
  onSaveCurrentMatch,
}: {
  readonly onSaveCurrentMatch: (title: string, description: string) => Promise<boolean> | void;
}): JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    readonly type: 'SUCCESS' | 'ERROR';
    readonly text: string;
  } | null>(null);

  const handleSaveClick = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const resolvedTitle = title.trim() || 'Partida Guardada';
    const resolvedDescription =
      description.trim() || 'Partida guardada con explicaciones paso a paso.';
    try {
      const outcome = await onSaveCurrentMatch(resolvedTitle, resolvedDescription);
      if (outcome === false) {
        setSaveStatus({
          type: 'ERROR',
          text: '✕ Error al guardar la partida en la biblioteca.',
        });
      } else {
        setTitle('');
        setDescription('');
        setSaveStatus({
          type: 'SUCCESS',
          text: `✓ Partida "${resolvedTitle}" guardada con éxito. Podés verla en "Partidas Guardadas".`,
        });
      }
    } catch {
      setSaveStatus({
        type: 'ERROR',
        text: '✕ Error al guardar la partida en la biblioteca.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ControlSection title="Guardar Partida Actual" hasDivider>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la partida"
          data-testid="save-match-title-input"
          className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Resumen o nota de la partida"
          data-testid="save-match-description-input"
          className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
        />
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSaveClick()}
          data-testid="save-annotated-match-button"
          className="w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold"
        >
          {isSaving ? 'Guardando partida...' : 'Guardar en Partidas Guardadas'}
        </button>
        {saveStatus && (
          <div
            data-testid="save-match-status-banner"
            className={`p-2 rounded border text-xs font-medium ${
              saveStatus.type === 'SUCCESS'
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
            }`}
          >
            {saveStatus.text}
          </div>
        )}
      </div>
    </ControlSection>
  );
}

export function AnnotatedMatchesSection({
  annotatedMatches,
  activeMatchId,
  canSaveCurrentMatch,
  onSelectMatch,
  onSaveCurrentMatch,
  onDeleteMatch,
}: AnnotatedMatchesSectionProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <ControlSection title={`Partidas Guardadas (${annotatedMatches.length})`} hasDivider>
        <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
          {annotatedMatches.map((match) => {
            const isSelected = activeMatchId === match.id;
            return (
              <div
                key={match.id}
                className={`relative p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : 'bg-zinc-950/70 border-zinc-800'
                }`}
              >
                {onDeleteMatch && (
                  <button
                    type="button"
                    onClick={() => onDeleteMatch(match.id)}
                    data-testid={`delete-annotated-match-${match.id}`}
                    title="Borrar partida guardada"
                    aria-label={`Borrar ${match.title}`}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-950/80 border border-transparent hover:border-rose-500/40 transition-colors"
                  >
                    ✕
                  </button>
                )}
                <div className="flex items-center justify-between gap-2 pr-5">
                  <span className="text-xs font-bold text-zinc-100 truncate">{match.title}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{match.description}</p>
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectMatch(match)}
                    data-testid={`select-annotated-match-${match.id}`}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shrink-0"
                  >
                    Ver Animación ({match.moves.length} jugadas)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ControlSection>

      {canSaveCurrentMatch && (
        <SaveAnnotatedMatchForm onSaveCurrentMatch={onSaveCurrentMatch} />
      )}
    </div>
  );
}
