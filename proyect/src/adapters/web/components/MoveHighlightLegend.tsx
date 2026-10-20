export interface MoveHighlightLegendProps {
  readonly originAlgebraic?: string;
  readonly destinationAlgebraic?: string;
  readonly hasSuggestion?: boolean;
}

function LegendItem({
  swatchClassName,
  swatchSymbol,
  label,
  labelColorClassName,
  description,
  containerClassName = '',
}: {
  readonly swatchClassName: string;
  readonly swatchSymbol?: string;
  readonly label: string;
  readonly labelColorClassName: string;
  readonly description: string;
  readonly containerClassName?: string;
}): JSX.Element {
  return (
    <div className={`flex items-center justify-between gap-2 ${containerClassName}`.trim()}>
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${swatchClassName}`}>
          {swatchSymbol}
        </span>
        <strong className={`font-semibold text-[11px] ${labelColorClassName}`}>
          {label}
        </strong>
      </div>
      <span className="text-zinc-400 text-[11px]">{description}</span>
    </div>
  );
}

export function MoveHighlightLegend({
  originAlgebraic,
  destinationAlgebraic,
  hasSuggestion = false,
}: MoveHighlightLegendProps = {}): JSX.Element {
  return (
    <div
      className="flex flex-col gap-1.5 text-xs text-zinc-200 bg-zinc-950/60 border border-zinc-800 px-3 py-2 rounded-lg"
      data-testid="move-highlight-legend"
    >
      <LegendItem
        swatchClassName="border border-sky-400 bg-sky-500 ring-1 ring-sky-400/50"
        label={originAlgebraic ? `Origen (From: ${originAlgebraic}):` : 'Origen (From):'}
        labelColorClassName="text-sky-300"
        description="Casilla de salida"
      />
      <LegendItem
        swatchClassName="border border-amber-400 bg-amber-500 ring-1 ring-amber-400/50"
        label={destinationAlgebraic ? `Destino (To: ${destinationAlgebraic}):` : 'Destino (To):'}
        labelColorClassName="text-amber-300"
        description="Casilla de llegada"
      />
      {hasSuggestion && (
        <LegendItem
          swatchClassName="border border-emerald-400 bg-emerald-500 ring-1 ring-emerald-400/50 flex items-center justify-center text-[9px] text-zinc-950 font-bold"
          swatchSymbol="★"
          label="Sugerencia (IA):"
          labelColorClassName="text-emerald-300"
          description="Mejor jugada del motor"
          containerClassName="border-t border-zinc-800/80 pt-1.5 mt-0.5"
        />
      )}
    </div>
  );
}
