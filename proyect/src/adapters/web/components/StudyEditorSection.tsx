import { useState } from 'react';
import { Color, PieceType } from '../../../core/pieces/types';
import { StudyPositionRecord } from '../../storage/IChessLibraryRepository';
import { EditorPaletteTool } from '../types';
import { ControlSection } from './ControlSection';

const PALETTE_PIECE_TYPES: readonly {
  readonly type: PieceType;
  readonly label: string;
  readonly symbol: string;
}[] = [
  { type: 'KING', label: 'Rey', symbol: '♚\uFE0E' },
  { type: 'QUEEN', label: 'Dama', symbol: '♛\uFE0E' },
  { type: 'ROOK', label: 'Torre', symbol: '♜\uFE0E' },
  { type: 'BISHOP', label: 'Alfil', symbol: '♝\uFE0E' },
  { type: 'KNIGHT', label: 'Caballo', symbol: '♞\uFE0E' },
  { type: 'PAWN', label: 'Peón', symbol: '♟\uFE0E' },
];

const PALETTE_COLOR_GROUPS: readonly {
  readonly color: Color;
  readonly groupLabel: string;
  readonly titlePrefix: string;
  readonly activeTextClass: string;
  readonly inactiveTextClass: string;
}[] = [
  {
    color: 'WHITE',
    groupLabel: 'Piezas Blancas',
    titlePrefix: 'Blancas',
    activeTextClass: 'text-white',
    inactiveTextClass: 'text-zinc-100',
  },
  {
    color: 'BLACK',
    groupLabel: 'Piezas Negras',
    titlePrefix: 'Negras',
    activeTextClass: 'text-amber-300',
    inactiveTextClass: 'text-amber-400',
  },
];

export interface StudyEditorSectionProps {
  readonly isEditorActive: boolean;
  readonly selectedTool: EditorPaletteTool | null;
  readonly initialTurn: Color;
  readonly studyPositions: readonly StudyPositionRecord[];
  readonly onSelectTool: (tool: EditorPaletteTool | null) => void;
  readonly onChangeInitialTurn: (turn: Color) => void;
  readonly onClearBoard: () => void;
  readonly onRestoreStandardBoard: () => void;
  readonly onStartStudyMatch: () => void;
  readonly onReturnToEditor: () => void;
  readonly onLoadStudyPosition: (study: StudyPositionRecord) => void;
  readonly onSaveStudyPosition: (title: string, description: string) => void;
  readonly onSaveMatePuzzle: (title: string, description: string, maxMoves: number) => void;
}

export function StudyEditorSection({
  isEditorActive,
  selectedTool,
  initialTurn,
  studyPositions,
  onSelectTool,
  onChangeInitialTurn,
  onClearBoard,
  onRestoreStandardBoard,
  onStartStudyMatch,
  onReturnToEditor,
  onLoadStudyPosition,
  onSaveStudyPosition,
  onSaveMatePuzzle,
}: StudyEditorSectionProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMoves, setMaxMoves] = useState(1);

  const isToolSelected = (candidate: EditorPaletteTool): boolean => {
    if (!selectedTool) {
      return false;
    }
    if (candidate.kind === 'ERASE' && selectedTool.kind === 'ERASE') {
      return true;
    }
    if (candidate.kind === 'PIECE' && selectedTool.kind === 'PIECE') {
      return candidate.color === selectedTool.color && candidate.type === selectedTool.type;
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-3">
      <ControlSection title="Editor Visual de Posición (Libro)" hasDivider>
        {!isEditorActive ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400">
              Estás jugando la posición de estudio en el tablero. Podés volver al editor para agregar o quitar piezas.
            </p>
            <button
              type="button"
              onClick={onReturnToEditor}
              data-testid="return-to-editor-button"
              className="w-full px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Editar Piezas en el Tablero
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {PALETTE_COLOR_GROUPS.map((group) => (
              <div key={group.color} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400">
                  {group.groupLabel}
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {PALETTE_PIECE_TYPES.map((item) => {
                    const tool: EditorPaletteTool = {
                      kind: 'PIECE',
                      color: group.color,
                      type: item.type,
                    };
                    const active = isToolSelected(tool);
                    return (
                      <button
                        key={`${group.color}-${item.type}`}
                        type="button"
                        onClick={() => onSelectTool(tool)}
                        data-testid={`palette-tool-${group.color}-${item.type}`}
                        title={`${group.titlePrefix}: ${item.label}`}
                        className={`py-1.5 rounded border text-sm flex flex-col items-center justify-center transition-colors ${
                          active
                            ? `bg-emerald-900/80 border-emerald-400 ${group.activeTextClass}`
                            : `bg-zinc-950/80 border-zinc-800 ${group.inactiveTextClass} hover:bg-zinc-800`
                        }`}
                      >
                        <span className="font-serif text-base leading-none">{item.symbol}</span>
                        <span className="text-[9px] text-zinc-400">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onSelectTool({ kind: 'ERASE' })}
                data-testid="palette-tool-ERASE"
                className={`px-2 py-1.5 rounded border text-xs font-medium ${
                  isToolSelected({ kind: 'ERASE' })
                    ? 'bg-rose-900/80 border-rose-400 text-rose-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Borrar casilla
              </button>
              <button
                type="button"
                onClick={onClearBoard}
                data-testid="editor-clear-board-button"
                className="px-2 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs text-zinc-300"
              >
                Vaciar tablero
              </button>
              <button
                type="button"
                onClick={onRestoreStandardBoard}
                data-testid="editor-standard-board-button"
                className="px-2 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs text-zinc-300"
              >
                Estándar
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-zinc-400 font-medium">Turno inicial:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeInitialTurn('WHITE')}
                  data-testid="editor-turn-toggle-white"
                  className={`px-2.5 py-1 rounded text-xs border ${
                    initialTurn === 'WHITE'
                      ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Blancas
                </button>
                <button
                  type="button"
                  onClick={() => onChangeInitialTurn('BLACK')}
                  data-testid="editor-turn-toggle-black"
                  className={`px-2.5 py-1 rounded text-xs border ${
                    initialTurn === 'BLACK'
                      ? 'bg-emerald-900/80 border-emerald-400 text-emerald-200 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Negras
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartStudyMatch}
              data-testid="start-study-match-button"
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              Iniciar Partida de Estudio
            </button>
          </div>
        )}
      </ControlSection>

      <ControlSection title="Guardar en Biblioteca JSON" hasDivider>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ej. Final de Lucena o Mate en 2)"
            data-testid="editor-title-input"
            className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explicación o consigna pedagógica"
            data-testid="editor-description-input"
            className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] text-zinc-400">Movimientos para Mate (X):</label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxMoves}
              onChange={(e) => setMaxMoves(Math.max(1, Number(e.target.value) || 1))}
              data-testid="editor-puzzle-moves-input"
              className="w-16 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 text-center"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSaveStudyPosition(
                  title.trim() || 'Posición de Estudio',
                  description.trim() || 'Disposición personalizada de estudio.'
                );
                setTitle('');
                setDescription('');
              }}
              data-testid="save-study-position-button"
              className="px-2 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-semibold"
            >
              Guardar Estudio
            </button>
            <button
              type="button"
              onClick={() => {
                onSaveMatePuzzle(
                  title.trim() || `Ejercicio Mate en ${maxMoves}`,
                  description.trim() || `Resuelve el mate en ${maxMoves} jugadas.`,
                  maxMoves
                );
                setTitle('');
                setDescription('');
              }}
              data-testid="save-mate-puzzle-button"
              className="px-2 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-semibold"
            >
              Guardar Mate en {maxMoves}
            </button>
          </div>
        </div>
      </ControlSection>

      <ControlSection title={`Posiciones de Libro (${studyPositions.length})`} hasDivider>
        <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
          {studyPositions.map((study) => (
            <div
              key={study.id}
              className="p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-200 truncate">{study.title}</span>
                <button
                  type="button"
                  onClick={() => onLoadStudyPosition(study)}
                  data-testid={`load-study-${study.id}`}
                  className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold shrink-0"
                >
                  Cargar
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{study.description}</p>
            </div>
          ))}
        </div>
      </ControlSection>
    </div>
  );
}
