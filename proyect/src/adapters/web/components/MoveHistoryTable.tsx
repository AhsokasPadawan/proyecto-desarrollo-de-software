import { MoveRecord } from '../../../core/ports/GameSnapshot';
import { AnalyzedMove } from '../../services/AnalysisService';
import { PIECE_NAMES_LOOKUP, PLAYER_DISPLAY_CONFIG } from '../pieceDisplay';
import { MoveHighlightLegend } from './MoveHighlightLegend';

export interface MoveHistoryTableProps {
  readonly moveHistory: readonly MoveRecord[];
  readonly currentMoveIndex: number;
  readonly onJumpToMove?: (targetIndex: number) => void;
  readonly analyzedMoves?: readonly AnalyzedMove[];
}

function EmptyMoveHistoryMessage(): JSX.Element {
  return (
    <div
      className="p-4 text-center text-xs text-zinc-500 italic"
      data-testid="no-moves-message"
    >
      Aún no se realizaron jugadas.
    </div>
  );
}

function MoveHistoryTableHeader({ hasAnalysis }: { readonly hasAnalysis: boolean }): JSX.Element {
  return (
    <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 z-10 shadow-sm">
      <tr>
        <th className="py-1.5 px-2 text-center w-8">#</th>
        <th className="py-1.5 px-2 text-left">Bando</th>
        <th className="py-1.5 px-2 text-left">Pieza</th>
        <th className="py-1.5 px-2 text-center">
          <span className="text-sky-300 font-bold">Desde</span>
        </th>
        <th className="py-1.5 px-2 text-center">
          <span className="text-amber-300 font-bold">Hasta</span>
        </th>
        <th className="py-1.5 px-2 text-right">Detalle</th>
        {hasAnalysis && (
          <th className="py-1.5 px-2 text-center">
            <span className="text-emerald-400 font-bold">IA</span>
          </th>
        )}
      </tr>
    </thead>
  );
}

function MoveSpecialDetailBadge({ record }: { readonly record: MoveRecord }): JSX.Element {
  if (record.isCastling) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950/70 text-purple-300 border border-purple-700/50">
        Enroque
      </span>
    );
  }

  if (record.isPromotion) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
        Coronación
      </span>
    );
  }

  if (record.capturedPiece) {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950/70 text-red-300 border border-red-700/50">
        Captura
      </span>
    );
  }

  return <span className="text-zinc-600">-</span>;
}

function MoveHistoryRow({
  record,
  index,
  isActive,
  hasAnalysis,
  analysisItem,
  onJumpToMove,
}: {
  readonly record: MoveRecord;
  readonly index: number;
  readonly isActive: boolean;
  readonly hasAnalysis: boolean;
  readonly analysisItem?: AnalyzedMove;
  readonly onJumpToMove?: (targetIndex: number) => void;
}): JSX.Element {
  const moveNumber = index + 1;
  const { tag: teamLabel, badgeStyle } = PLAYER_DISPLAY_CONFIG[record.turn];
  const pieceName = PIECE_NAMES_LOOKUP[record.piece] ?? record.piece;

  return (
    <tr
      onClick={() => onJumpToMove?.(moveNumber)}
      data-testid={`replay-move-item-${index}`}
      tabIndex={0}
      role="button"
      aria-label={`Jugada ${moveNumber}, ${teamLabel}, ${pieceName} de ${record.from} a ${record.to}`}
      className={`cursor-pointer transition-colors ${
        isActive
          ? 'bg-amber-500/20 text-amber-200 border-l-4 border-amber-400 font-semibold'
          : 'text-zinc-300 hover:bg-zinc-800/60'
      }`}
    >
      <td className="py-1.5 px-2 text-center text-zinc-400 font-mono w-8">
        {isActive ? '▶' : moveNumber}
      </td>
      <td className="py-1.5 px-2 text-left">
        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${badgeStyle}`}>
          {teamLabel}
        </span>
      </td>
      <td className="py-1.5 px-2 text-left font-medium">{pieceName}</td>
      <td className="py-1.5 px-2 text-center">
        <span className="font-mono px-1.5 py-0.5 rounded text-sky-300 bg-sky-950/70 border border-sky-600/40">
          {record.from}
        </span>
      </td>
      <td className="py-1.5 px-2 text-center">
        <span className="font-mono px-1.5 py-0.5 rounded text-amber-300 bg-amber-950/70 border border-amber-600/40">
          {record.to}
        </span>
      </td>
      <td className="py-1.5 px-2 text-right">
        <MoveSpecialDetailBadge record={record} />
      </td>
      {hasAnalysis && (
        <td className="py-1.5 px-2 text-center">
          {analysisItem ? (
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${analysisItem.quality.badgeClass}`}
              title={`${analysisItem.quality.label} - Pérdida: ${analysisItem.evalLoss.toFixed(2)}`}
            >
              {analysisItem.quality.symbol}
            </span>
          ) : (
            <span className="text-zinc-600">-</span>
          )}
        </td>
      )}
    </tr>
  );
}

export function MoveHistoryTable({
  moveHistory,
  currentMoveIndex,
  onJumpToMove,
  analyzedMoves,
}: MoveHistoryTableProps): JSX.Element {
  const hasAnalysis = Boolean(analyzedMoves && analyzedMoves.length > 0);

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <MoveHighlightLegend hasSuggestion={hasAnalysis} />

      <div
        className="flex-1 min-h-[110px] overflow-y-auto border border-zinc-800 rounded-lg bg-zinc-950/60 shadow-inner"
        data-testid="replay-move-list"
      >
        {moveHistory.length === 0 ? (
          <EmptyMoveHistoryMessage />
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <MoveHistoryTableHeader hasAnalysis={hasAnalysis} />
            <tbody className="divide-y divide-zinc-800/60">
              {moveHistory.map((record, index) => (
                <MoveHistoryRow
                  key={`${record.moveIndex}-${record.turn}-${record.from}-${record.to}`}
                  record={record}
                  index={index}
                  isActive={index === currentMoveIndex - 1}
                  hasAnalysis={hasAnalysis}
                  analysisItem={analyzedMoves?.[index]}
                  onJumpToMove={onJumpToMove}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
