import {
  PresentationSlidePage,
  SlideModalSpec,
  TEAM_MEMBERS_ALPHABETICAL,
} from '../types';
import { ThemeStyleConfig } from '../themeConfig';

const MINI_CHESSBOARD_PATTERN: readonly (string | null)[][] = [
  ['♜', '♞', '♝', '♛'],
  ['♟', '♟', null, '♟'],
  [null, null, '♟', null],
  ['♙', '♙', '♘', '♔'],
];

function LandingSlideContent({
  theme,
  onStartPresentation,
}: {
  readonly theme: ThemeStyleConfig;
  readonly onStartPresentation: () => void;
}): JSX.Element {
  return (
    <div className={`p-6 sm:p-8 ${theme.slideCardContainer} flex flex-col gap-6`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${theme.slideBadge}`}>
              Ingeniería de Software / Diseño de Sistemas
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              Trabajo Práctico Final
            </span>
          </div>

          <h1 className={`text-4xl sm:text-5xl font-black tracking-tight leading-tight ${theme.slideTitleText}`}>
            Chess TPO
          </h1>

          <div className="pt-1">
            <button
              type="button"
              onClick={onStartPresentation}
              className={`px-5 py-2.5 rounded-xl text-sm sm:text-base flex items-center gap-2 transition-all ${theme.primaryNavButton}`}
            >
              <span>Comenzar</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-emerald-950 border-4 border-emerald-900 shadow-xl shrink-0">
          <div className="grid grid-cols-4 w-40 h-40 sm:w-44 sm:h-44 rounded-lg overflow-hidden border border-emerald-700">
            {MINI_CHESSBOARD_PATTERN.map((row, rIdx) =>
              row.map((piece, cIdx) => {
                const isDark = (rIdx + cIdx) % 2 === 1;
                const sqBg = isDark ? 'bg-emerald-800 text-emerald-50' : 'bg-emerald-100 text-zinc-900';
                const isHighlight = (rIdx === 3 && cIdx === 2) || (rIdx === 1 && cIdx === 2);
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`flex items-center justify-center text-2xl sm:text-3xl select-none ${sqBg} ${
                      isHighlight ? 'ring-4 ring-amber-400 ring-inset' : ''
                    }`}
                  >
                    <span className="drop-shadow-sm">{piece}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4 flex flex-col gap-2.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
          Integrantes
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {TEAM_MEMBERS_ALPHABETICAL.map((member) => (
            <div
              key={member.fullName}
              className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-800/20 flex items-center gap-2.5 shadow-sm"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-800 text-emerald-50 font-bold text-xs flex items-center justify-center shrink-0">
                {member.orderNumber}
              </span>
              <span className="text-sm font-bold text-zinc-900 leading-snug">
                {member.fullName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SlideProjectionView({
  page,
  activeStepIndex,
  theme,
  onSelectStep,
  onOpenModal,
  onStartFromLanding,
  onRegisterStepCardElement,
}: {
  readonly page: PresentationSlidePage;
  readonly activeStepIndex: number;
  readonly theme: ThemeStyleConfig;
  readonly onSelectStep: (stepIdx: number) => void;
  readonly onOpenModal: (modal: SlideModalSpec, stepIdx: number) => void;
  readonly onStartFromLanding: () => void;
  readonly onRegisterStepCardElement: (stepIdx: number, element: HTMLDivElement | null) => void;
}): JSX.Element {
  if (page.id === 'LANDING') {
    return (
      <LandingSlideContent
        theme={theme}
        onStartPresentation={onStartFromLanding}
      />
    );
  }

  return (
    <div className={`${theme.slideCardContainer} overflow-hidden flex flex-col`}>
      <header className={`px-5 sm:px-7 py-3.5 ${theme.slideHeaderBorder} flex items-center justify-between gap-4`}>
        <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${theme.slideTitleText}`}>
          <span>{page.icon}</span>
          <span>{page.slideTitle}</span>
        </h2>

        <div className="flex items-center gap-1.5 shrink-0">
          {page.focusSteps.map((step) => {
            const isStepActive = step.stepIndex === activeStepIndex;
            return (
              <button
                key={step.stepIndex}
                type="button"
                onClick={() => onSelectStep(step.stepIndex)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isStepActive
                    ? theme.stepNumberActive
                    : `${theme.stepNumberInactive} hover:opacity-90`
                }`}
              >
                {step.stepIndex + 1}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-4 sm:p-5 flex flex-col gap-2.5">
        {page.focusSteps.map((step) => {
          const isFocused = step.stepIndex === activeStepIndex;

          return (
            <div
              key={step.stepIndex}
              ref={(element) => onRegisterStepCardElement(step.stepIndex, element)}
              tabIndex={-1}
              onClick={() => !isFocused && onSelectStep(step.stepIndex)}
              className={`rounded-xl transition-all duration-200 focus:outline-none ${
                isFocused
                  ? `p-4 sm:p-5 ${theme.activeStepCard}`
                  : `px-4 py-2.5 cursor-pointer ${theme.inactiveStepCard}`
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                    isFocused ? theme.stepNumberActive : theme.stepNumberInactive
                  }`}
                >
                  {step.stepIndex + 1}
                </span>
                <h3 className={`font-extrabold ${isFocused ? 'text-lg sm:text-xl text-zinc-900' : 'text-sm sm:text-base text-zinc-700'}`}>
                  {step.headline}
                </h3>
              </div>

              {isFocused && (
                <div className="mt-3 pl-0 sm:pl-9 flex flex-col gap-3">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {step.visualBullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="p-2.5 rounded-xl bg-white border border-emerald-900/15 shadow-sm flex items-start gap-2 text-xs sm:text-sm text-zinc-800 font-medium leading-snug"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-emerald-900/15">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {step.highlightedContracts.map((contract) => (
                        <code
                          key={contract}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${theme.contractPill}`}
                        >
                          {contract}
                        </code>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {step.modals.map((modalSpec) => {
                        const isSimulator = Boolean(modalSpec.simulatorId);
                        return (
                          <button
                            key={modalSpec.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenModal(modalSpec, step.stepIndex);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-transform active:scale-95 ${
                              isSimulator
                                ? theme.simulatorTriggerButton
                                : theme.modalTriggerButton
                            }`}
                          >
                            <span>{modalSpec.buttonLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
