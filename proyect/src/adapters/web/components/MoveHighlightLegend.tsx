export interface MoveHighlightLegendProps {
  readonly originAlgebraic?: string;
  readonly destinationAlgebraic?: string;
}

export function MoveHighlightLegend({
  originAlgebraic,
  destinationAlgebraic,
}: MoveHighlightLegendProps): JSX.Element {
  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-lg shadow-md"
      data-testid="move-highlight-legend"
    >
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded border border-sky-400 bg-sky-500 ring-2 ring-sky-400/50 flex-shrink-0" />
        <span>
          <strong className="text-sky-300 font-bold">
            Origen (From{originAlgebraic ? `: ${originAlgebraic}` : ''}):
          </strong>
          <span className="text-zinc-400 ml-1">Casilla de salida</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-amber-500 ring-2 ring-amber-400/50 flex-shrink-0" />
        <span>
          <strong className="text-amber-300 font-bold">
            Destino (To{destinationAlgebraic ? `: ${destinationAlgebraic}` : ''}):
          </strong>
          <span className="text-zinc-400 ml-1">Casilla de llegada</span>
        </span>
      </div>
    </div>
  );
}
