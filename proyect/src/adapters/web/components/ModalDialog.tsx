import { ReactNode } from 'react';

export interface ModalDialogProps {
  readonly isOpen: boolean;
  readonly children: ReactNode;
  readonly ariaLabelledBy?: string;
  readonly testId?: string;
  readonly panelClassName?: string;
}

export function ModalDialog({
  isOpen,
  children,
  ariaLabelledBy,
  testId,
  panelClassName = 'max-w-md flex flex-col gap-4',
}: ModalDialogProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      data-testid={testId}
    >
      <div
        className={`w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl text-zinc-100 ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
