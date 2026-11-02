import { SlideModalSpec } from '../types';
import { InteractiveSimulatorRenderer } from './InteractiveSimulators';
import { IdeCodeBlock } from './IdeCodeBlock';

export function SlideModalDialog({
  modal,
  onClose,
}: {
  readonly modal: SlideModalSpec | null;
  readonly onClose: () => void;
}): JSX.Element | null {
  if (!modal) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        if (node && !node.contains(document.activeElement)) {
          node.focus();
        }
      }}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 focus:outline-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slide-modal-title"
    >
      <div
        className="w-full max-w-3xl bg-zinc-950 border-2 border-emerald-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-4">
          <h3 id="slide-modal-title" className="text-lg sm:text-xl font-extrabold text-white">
            {modal.modalTitle}
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-bold border border-zinc-700 flex items-center justify-center shrink-0 transition-colors"
          >
            ✕
          </button>
        </header>

        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {modal.codeSnippet && <IdeCodeBlock code={modal.codeSnippet} />}

          {modal.simulatorId && (
            <InteractiveSimulatorRenderer simulatorId={modal.simulatorId} />
          )}
        </div>
      </div>
    </div>
  );
}
