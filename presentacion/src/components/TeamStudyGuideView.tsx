import { PresentationSlidePage, SlideModalSpec } from '../types';
import { ThemeStyleConfig } from '../themeConfig';

export function TeamStudyGuideView({
  page,
  theme,
  onOpenModal,
  onSwitchToSlides,
}: {
  readonly page: PresentationSlidePage;
  readonly theme: ThemeStyleConfig;
  readonly onOpenModal: (modal: SlideModalSpec) => void;
  readonly onSwitchToSlides: () => void;
}): JSX.Element {
  const { studyGuide } = page;
  const allModalsInPage = page.focusSteps.flatMap((s) => s.modals);

  return (
    <div className={`${theme.slideCardContainer} overflow-hidden flex flex-col`}>
      <header className="px-6 sm:px-8 py-5 bg-emerald-950 text-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-zinc-950">
              📖 Guía de Preparación para el Equipo · Página {page.pageNumber} de 7
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-100">
              Tiempo sugerido: {studyGuide.estimatedTime}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5 mt-1">
            <span>{page.icon}</span>
            <span>{page.slideTitle}</span>
          </h2>
          <p className="text-sm text-emerald-200/90">
            <strong>Objetivo de esta sección:</strong> {studyGuide.mainGoal}
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToSlides}
          className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs sm:text-sm shrink-0 self-start sm:self-center shadow-md"
        >
          📽️ Volver a la Slide
        </button>
      </header>

      <div className="p-6 sm:p-8 flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-extrabold text-emerald-950 flex items-center gap-2 border-b border-zinc-200 pb-2">
            <span>🎙️</span>
            <span>1. Guion Hablado Sugerido (Qué decir paso por paso)</span>
          </h3>

          <div className="flex flex-col gap-3.5">
            {studyGuide.spokenScriptByStep.map((block, index) => (
              <div
                key={block.stepTitle}
                className="p-4 sm:p-5 rounded-xl bg-emerald-50/70 border border-emerald-800/20 flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-emerald-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{block.stepTitle}</span>
                  </span>
                </div>

                <p className="text-sm sm:text-base text-zinc-900 leading-relaxed bg-white p-3.5 rounded-lg border border-emerald-900/10 italic">
                  {block.whatToSay}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900 bg-amber-100/80 border border-amber-300 px-3 py-2 rounded-lg font-medium">
                  <span>
                    <strong>🎬 Acción en la Slide / Modal:</strong> {block.whenToClickModal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {allModalsInPage.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-emerald-950 flex items-center gap-2 border-b border-zinc-200 pb-2">
              <span>💻</span>
              <span>2. Ideas Clave y Modales de esta Slide (Solo para el Equipo)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allModalsInPage.map((modal) => (
                <div
                  key={modal.id}
                  className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold text-emerald-900">
                      {modal.modalTitle}
                    </span>
                    {modal.filePath && (
                      <code className="text-[11px] font-mono text-zinc-500">
                        Archivo: {modal.filePath}
                      </code>
                    )}
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mt-1">
                      <strong>💡 Idea clave para destacar:</strong> {modal.keyTakeaway}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenModal(modal)}
                    className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold self-start shadow-sm"
                  >
                    {modal.buttonLabel}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-emerald-950 flex items-center gap-2 border-b border-zinc-200 pb-2">
              <span>🔌</span>
              <span>3. Interfaces que sí o sí hay que nombrar</span>
            </h3>
            <div className="flex flex-col gap-2.5">
              {studyGuide.interfacesCheatSheet.map((item) => (
                <div
                  key={item.name}
                  className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1"
                >
                  <code className="text-xs sm:text-sm font-mono font-extrabold text-emerald-800">
                    {item.name}
                  </code>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-snug">
                    {item.roleAndWhyItMatters}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-emerald-950 flex items-center gap-2 border-b border-zinc-200 pb-2">
              <span>❓</span>
              <span>4. Posibles Preguntas del Jurado en este Tema</span>
            </h3>
            <div className="flex flex-col gap-2.5">
              {studyGuide.professorQuestions.map((qa) => (
                <div
                  key={qa.question}
                  className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300/80 flex flex-col gap-1.5"
                >
                  <p className="text-xs sm:text-sm font-extrabold text-amber-950">
                    P: {qa.question}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                    <strong>Respuesta:</strong> {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 rounded-xl bg-emerald-900 text-emerald-50 flex flex-col gap-1 shadow-md">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
            🔗 Frase de Pase al Siguiente Integrante / Tema
          </span>
          <p className="text-sm sm:text-base font-semibold italic">
            {studyGuide.transitionPhraseToNextPage}
          </p>
        </div>
      </div>
    </div>
  );
}
