export interface ModeSelectorButtonProps {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly testId: string;
}

export function ModeSelectorButton({
  label,
  isSelected,
  onClick,
  testId,
}: ModeSelectorButtonProps): JSX.Element {
  const selectedStyle = isSelected
    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
    : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${selectedStyle}`}
      data-testid={testId}
    >
      {label}
    </button>
  );
}
