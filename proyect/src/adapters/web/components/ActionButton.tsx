import { ReactNode } from 'react';

export type ActionButtonVariant = 'default' | 'danger';

export interface ActionButtonProps {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly variant?: ActionButtonVariant;
  readonly testId: string;
  readonly className?: string;
  readonly children: ReactNode;
}

const ACTION_BUTTON_VARIANTS: Record<ActionButtonVariant, string> = {
  default:
    'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500',
  danger:
    'bg-rose-950/60 border-rose-800/80 text-rose-200 hover:bg-rose-900/80 hover:border-rose-700',
};

export function ActionButton({
  onClick,
  disabled = false,
  variant = 'default',
  testId,
  className = '',
  children,
}: ActionButtonProps): JSX.Element {
  const variantClass = ACTION_BUTTON_VARIANTS[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${variantClass} ${className}`.trim()}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
