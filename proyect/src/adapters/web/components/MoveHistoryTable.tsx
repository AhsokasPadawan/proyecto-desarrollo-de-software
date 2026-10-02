import { MoveRecord } from '../../../core/ports/GameSnapshot';
import { PIECE_NAMES_LOOKUP } from '../transcriptionFormatter';
import { MoveHighlightLegend } from './MoveHighlightLegend';

export interface MoveHistoryTableProps {
  readonly moveHistory: readonly MoveRecord[];
  readonly currentMoveIndex: number;
  readonly onJumpToMove?: (targetIndex: number) => void;
}

export function MoveHistoryTable({
  moveHistory,
  currentMoveIndex,
  onJumpToMove,
}: MoveHistoryTableProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <MoveHighlightLegend />

      <div
        className="max-h-56 overflow-y-auto border border-zinc-800 rounded-lg bg-zinc-950/60 shadow-inner"
        data-testid="replay-move-list"
      >
        {moveHistory.length === 0 ? (
          <div
            className="p-4 text-center text-xs text-zinc-500 italic"
            data-testid="no-moves-message"
          >
            Aún no se realizaron jugadas.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 z-10 shadow-sm">
              <tr>
                <th className="py-1.5 px-2 text-center w-7">#</th>
                <th className="py-1.5 px-1">Bando</th>
                <th className="py-1.5 px-1">Pieza</th>
                <th className="py-1.5 px-1 text-center">
                  <span className="text-sky-300 font-bold">Desde</span>
                </th>
                <th className="py-1.5 px-1 text-center">
                  <span className="text-amber-300 font-bold">Hasta</span>
                </th>
                <th className="py-1.5 px-2 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {moveHistory.map((record, index) => {
                const moveNumber = index + 1;
                const isActive = index === currentMoveIndex - 1;
                const isWhite = record.turn === 'WHITE';
                const teamLabel = isWhite ? 'Blancas' : 'Negras';
                const pieceName = PIECE_NAMES_LOOKUP[record.piece] ?? record.piece;

                return (
                  <tr
                    key={`${record.moveIndex}-${record.turn}-${record.from}-${record.to}`}
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
                    <td className="py-1.5 px-2 text-center text-zinc-400 font-mono">
                      {isActive ? '▶' : moveNumber}
                    </td>
                    <td className="py-1.5 px-1">
                      <span
                        className={`inline-block px-1 py-0.5 rounded text-[10px] font-bold ${
                          isWhite
                            ? 'bg-amber-100/90 text-amber-950'
                            : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        {teamLabel}
                      </span>
                    </td>
                    <td className="py-1.5 px-1 font-medium">{pieceName}</td>
                    <td className="py-1.5 px-1 text-center">
                      <span className="font-mono px-1.5 py-0.5 rounded text-sky-300 bg-sky-950/70 border border-sky-600/40">
                        {record.from}
                      </span>
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <span className="font-mono px-1.5 py-0.5 rounded text-amber-300 bg-amber-950/70 border border-amber-600/40">
                        {record.to}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      {record.isCastling && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950/70 text-purple-300 border border-purple-700/50">
                          Enroque
                        </span>
                      )}
                      {record.isPromotion && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                          Coronación
                        </span>
                      )}
                      {record.capturedPiece && !record.isPromotion && !record.isCastling && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950/70 text-red-300 border border-red-700/50">
                          Captura
                        </span>
                      )}
                      {!record.isCastling && !record.isPromotion && !record.capturedPiece && (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
