import { PieceType } from '../../../core/pieces/types';

export interface PromotionOptionButtonProps {
  readonly pieceType: PieceType;
  readonly label: string;
  readonly symbol: string;
  readonly onClick: (type: PieceType) => void;
  readonly testId: string;
}

export function PromotionOptionButton({
  pieceType,
  label,
  symbol,
  onClick,
  testId,
}: PromotionOptionButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onClick(pieceType)}
      className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 hover:border-amber-400 transition-all text-zinc-100 group"
      data-testid={testId}
    >
      <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">
        {symbol}
      </span>
      <span className="text-xs font-medium text-zinc-300 group-hover:text-amber-300">
        {label}
      </span>
    </button>
  );
}
