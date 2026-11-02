import { KeyboardEvent, ReactNode, useRef, useState } from 'react';
import {
  PresentationPageId,
  PresentationViewMode,
  SlideModalSpec,
} from './types';
import { PRESENTATION_SLIDE_PAGES } from './data/slidesData';
import { BOARD_EMERALD_THEME } from './themeConfig';
import { SlideProjectionView } from './components/SlideProjectionView';
import { TeamStudyGuideView } from './components/TeamStudyGuideView';
import { SlideModalDialog } from './components/SlideModalDialog';

export function App(): JSX.Element {
  const [activePageId, setActivePageId] = useState<PresentationPageId>('LANDING');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<PresentationViewMode>('SLIDES_PROJECTION');
  const [activeModal, setActiveModal] = useState<SlideModalSpec | null>(null);

  const rootContainerRef = useRef<HTMLDivElement | null>(null);
  const stepCardElementsRef = useRef<Record<number, HTMLDivElement | null>>({});
  const lastModalStepIndexRef = useRef<number>(0);

  const theme = BOARD_EMERALD_THEME;
  const currentPageIndex = PRESENTATION_SLIDE_PAGES.findIndex((p) => p.id === activePageId);
  const currentPage = PRESENTATION_SLIDE_PAGES[currentPageIndex];
  const totalStepsInCurrentPage = currentPage.focusSteps.length;

  const focusStepCardOrContainer = (targetStepIndex: number) => {
    requestAnimationFrame(() => {
      const cardEl = stepCardElementsRef.current[targetStepIndex];
      if (cardEl) {
        cardEl.focus({ preventScroll: true });
        if (window.innerWidth < 1024) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        rootContainerRef.current?.focus({ preventScroll: true });
      }
    });
  };

  const handleOpenModal = (modalSpec: SlideModalSpec, stepIdx: number = activeStepIndex) => {
    lastModalStepIndexRef.current = stepIdx;
    setActiveModal(modalSpec);
  };

  const handleCloseModal = () => {
    const stepToFocus = lastModalStepIndexRef.current;
    setActiveModal(null);
    focusStepCardOrContainer(stepToFocus);
  };

  const handleSelectPage = (targetPageId: PresentationPageId, initialStep = 0) => {
    setActiveModal(null);
    setActivePageId(targetPageId);
    setActiveStepIndex(initialStep);
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    focusStepCardOrContainer(initialStep);
  };

  const handleAdvanceForward = () => {
    setActiveModal(null);
    if (
      viewMode === 'SLIDES_PROJECTION' &&
      totalStepsInCurrentPage > 0 &&
      activeStepIndex < totalStepsInCurrentPage - 1
    ) {
      const nextStep = activeStepIndex + 1;
      setActiveStepIndex(nextStep);
      focusStepCardOrContainer(nextStep);
      return;
    }

    if (currentPageIndex < PRESENTATION_SLIDE_PAGES.length - 1) {
      const nextPage = PRESENTATION_SLIDE_PAGES[currentPageIndex + 1];
      handleSelectPage(nextPage.id, 0);
    } else {
      handleSelectPage('LANDING', 0);
    }
  };

  const handleStepBackward = () => {
    setActiveModal(null);
    if (
      viewMode === 'SLIDES_PROJECTION' &&
      totalStepsInCurrentPage > 0 &&
      activeStepIndex > 0
    ) {
      const prevStep = activeStepIndex - 1;
      setActiveStepIndex(prevStep);
      focusStepCardOrContainer(prevStep);
      return;
    }

    if (currentPageIndex > 0) {
      const prevPage = PRESENTATION_SLIDE_PAGES[currentPageIndex - 1];
      const lastStepOfPrev = Math.max(0, prevPage.focusSteps.length - 1);
      handleSelectPage(prevPage.id, viewMode === 'SLIDES_PROJECTION' ? lastStepOfPrev : 0);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && activeModal) {
      event.preventDefault();
      handleCloseModal();
      return;
    }

    if (activeModal) {
      return;
    }

    const keyActionLookup: Record<string, (() => void) | undefined> = {
      ArrowRight: handleAdvanceForward,
      ArrowLeft: handleStepBackward,
    };

    const action = keyActionLookup[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const registerStepCardElement = (stepIdx: number, element: HTMLDivElement | null) => {
    stepCardElementsRef.current[stepIdx] = element;
  };

  const viewRendererLookup: Record<PresentationViewMode, () => ReactNode> = {
    SLIDES_PROJECTION: () => (
      <SlideProjectionView
        page={currentPage}
        activeStepIndex={activeStepIndex}
        theme={theme}
        onSelectStep={(stepIdx) => {
          setActiveStepIndex(stepIdx);
          focusStepCardOrContainer(stepIdx);
        }}
        onOpenModal={handleOpenModal}
        onStartFromLanding={() => handleSelectPage('INTRODUCTION', 0)}
        onRegisterStepCardElement={registerStepCardElement}
      />
    ),
    TEAM_STUDY_GUIDE: () => (
      <TeamStudyGuideView
        page={currentPage}
        theme={theme}
        onOpenModal={(modalSpec) => handleOpenModal(modalSpec, activeStepIndex)}
        onSwitchToSlides={() => {
          setViewMode('SLIDES_PROJECTION');
          focusStepCardOrContainer(activeStepIndex);
        }}
      />
    ),
  };

  const canGoBackward = currentPageIndex > 0 || activeStepIndex > 0;
  const isProjectionMode = viewMode === 'SLIDES_PROJECTION';

  return (
    <div
      ref={rootContainerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`${
        isProjectionMode ? 'min-h-dvh overflow-y-auto lg:h-dvh lg:overflow-hidden' : 'min-h-screen'
      } w-full ${theme.appBackground} flex flex-col justify-between transition-colors duration-200 focus:outline-none`}
    >
      <header className={`sticky top-0 z-30 w-full px-4 sm:px-6 py-2 ${theme.topBarContainer}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-sm">
              ♟
            </span>
            <span className={`text-sm sm:text-base font-black tracking-tight ${theme.topBarBrandText}`}>
              Chess TPO
            </span>

            <div className={`ml-1 p-0.5 rounded-lg flex items-center gap-0.5 ${theme.modeSwitchContainer}`}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('SLIDES_PROJECTION');
                  focusStepCardOrContainer(activeStepIndex);
                }}
                title="Modo Slides"
                aria-label="Modo Slides"
                className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all ${
                  viewMode === 'SLIDES_PROJECTION'
                    ? theme.modeSwitchActive
                    : theme.modeSwitchInactive
                }`}
              >
                📽️
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TEAM_STUDY_GUIDE')}
                title="Guía del Equipo"
                aria-label="Guía del Equipo"
                className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all ${
                  viewMode === 'TEAM_STUDY_GUIDE'
                    ? theme.modeSwitchActive
                    : theme.modeSwitchInactive
                }`}
              >
                📖
              </button>
              <a
                href="./juego/"
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir Juego en Vivo"
                aria-label="Abrir Juego en Vivo"
                className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all ${theme.modeSwitchInactive}`}
              >
                🎮
              </a>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 overflow-x-auto" aria-label="Diapositivas">
            {PRESENTATION_SLIDE_PAGES.map((slide) => {
              const isSelected = slide.id === activePageId;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectPage(slide.id, 0)}
                  className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected ? theme.tabActive : theme.tabInactive
                  }`}
                >
                  <span>{slide.icon}</span>
                  <span>{slide.shortTabLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex-1 min-h-0 flex flex-col justify-center">
        {viewRendererLookup[viewMode]()}
      </main>

      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-3">
        <div className={`px-4 py-2 ${theme.footerBar} flex items-center justify-between gap-3`}>
          <button
            type="button"
            disabled={!canGoBackward}
            onClick={handleStepBackward}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm disabled:opacity-35 disabled:pointer-events-none transition-all ${theme.secondaryNavButton}`}
          >
            ← Anterior
          </button>

          <button
            type="button"
            onClick={handleAdvanceForward}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm transition-all ${theme.primaryNavButton}`}
          >
            Siguiente →
          </button>
        </div>
      </footer>

      <SlideModalDialog modal={activeModal} onClose={handleCloseModal} />
    </div>
  );
}
