export interface MoveHighlightLegendProps {
  readonly originAlgebraic?: string;
  readonly destinationAlgebraic?: string;
}

export function MoveHighlightLegend({
  originAlgebraic,
  destinationAlgebraic,
}: MoveHighlightLegendProps = {}): JSX.Element {
  return (
    <div
      className="flex flex-col gap-1.5 text-xs text-zinc-200 bg-zinc-950/60 border border-zinc-800 px-3 py-2 rounded-lg"
      data-testid="move-highlight-legend"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm border border-sky-400 bg-sky-500 ring-1 ring-sky-400/50 flex-shrink-0" />
          <strong className="text-sky-300 font-semibold text-[11px]">
            {originAlgebraic ? `Origen (From: ${originAlgebraic}):` : 'Origen (From):'}
          </strong>
        </div>
        <span className="text-zinc-400 text-[11px]">Casilla de salida</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm border border-amber-400 bg-amber-500 ring-1 ring-amber-400/50 flex-shrink-0" />
          <strong className="text-amber-300 font-semibold text-[11px]">
            {destinationAlgebraic ? `Destino (To: ${destinationAlgebraic}):` : 'Destino (To):'}
          </strong>
        </div>
        <span className="text-zinc-400 text-[11px]">Casilla de llegada</span>
      </div>
    </div>
  );
}
