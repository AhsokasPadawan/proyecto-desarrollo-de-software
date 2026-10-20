import { ReactNode } from 'react';
import { AnalyzedMove, FullGameAnalysisResult } from '../../services/AnalysisService';
import { PLAYER_DISPLAY_CONFIG } from '../pieceDisplay';

export interface LiveHintData {
  readonly from: string;
  readonly to: string;
  readonly san: string;
  readonly evaluation: number;
  readonly advice: string;
}

export interface CoachFeedbackCardProps {
  readonly analyzedMove?: AnalyzedMove;
  readonly liveHint?: LiveHintData | null;
  readonly isLoading?: boolean;
  readonly progress?: { current: number; total: number } | null;
  readonly analysisResult?: FullGameAnalysisResult | null;
  readonly onDismissHint?: () => void;
  readonly onAnalyzeGame?: () => void;
}

type CoachCardVariant = 'LOADING' | 'LIVE_HINT' | 'ANALYZED_MOVE' | 'SUMMARY' | 'INVITE';

const COACH_CARD_VARIANT_STYLES: Record<CoachCardVariant, string> = {
  LOADING:
    'p-4 border-emerald-800/60 bg-emerald-950/30 text-emerald-100 flex-col gap-2.5 backdrop-blur-sm animate-pulse',
  LIVE_HINT:
    'p-4 border-sky-700/60 bg-sky-950/40 text-sky-100 flex-col gap-2 backdrop-blur-sm shadow-lg',
  ANALYZED_MOVE:
    'p-4 border-zinc-800 bg-zinc-900/95 text-zinc-100 flex-col gap-3 shadow-xl',
  SUMMARY:
    'p-4 border-emerald-900/50 bg-zinc-900/90 text-zinc-100 flex-col gap-2.5 shadow-xl shrink-0',
  INVITE:
    'p-3 border-zinc-800 bg-zinc-950/60 text-zinc-300 items-center justify-between gap-2 shadow-sm',
};

function CoachCardShell({
  variant,
  testId,
  children,
}: {
  readonly variant: CoachCardVariant;
  readonly testId: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <div
      className={`w-full rounded-xl border flex ${COACH_CARD_VARIANT_STYLES[variant]}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function CoachLoadingCard({
  progress,
}: {
  readonly progress?: { current: number; total: number } | null;
}): JSX.Element {
  const percentage =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <CoachCardShell variant="LOADING" testId="coach-loading-card">
      <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Analizando partida con Motor & Gemini...
        </span>
        {progress && (
          <span>
            {progress.current} / {progress.total}
          </span>
        )}
      </div>

      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-emerald-900/40">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </CoachCardShell>
  );
}

function CoachLiveHintCard({
  liveHint,
  onDismissHint,
}: {
  readonly liveHint: LiveHintData;
  readonly onDismissHint?: () => void;
}): JSX.Element {
  return (
    <CoachCardShell variant="LIVE_HINT" testId="coach-live-hint-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Sugerencia del Coach (En Vivo)
          </span>
        </div>
        {onDismissHint && (
          <button
            type="button"
            onClick={onDismissHint}
            className="text-xs text-sky-400 hover:text-sky-200 px-1 rounded"
            aria-label="Cerrar sugerencia"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs bg-zinc-950/70 px-3 py-2 rounded-lg border border-sky-900/50">
        <span className="text-zinc-400">Movimiento recomendado:</span>
        <strong className="text-sky-300 font-mono text-sm">
          {liveHint.from} → {liveHint.to}
        </strong>
      </div>

      <p className="text-xs text-sky-100/95 leading-relaxed pt-1">{liveHint.advice}</p>
    </CoachCardShell>
  );
}

function CoachAnalyzedMoveCard({
  analyzedMove,
}: {
  readonly analyzedMove: AnalyzedMove;
}): JSX.Element {
  const isOptimalMove = analyzedMove.evalLoss === 0 || analyzedMove.quality.quality === 'BEST';
  const { tag: turnLabel } = PLAYER_DISPLAY_CONFIG[analyzedMove.turn];

  return (
    <CoachCardShell variant="ANALYZED_MOVE" testId="coach-analyzed-move-card">
      <div className="grid grid-cols-3 items-center border-b border-zinc-800 pb-2.5">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
            Jugada #{analyzedMove.moveIndex + 1}
          </span>
          <span className="text-[11px] text-zinc-500">{turnLabel}</span>
        </div>

        <div className="flex items-center justify-center">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold text-center inline-flex items-center justify-center gap-1 shadow-sm whitespace-nowrap ${analyzedMove.quality.badgeClass}`}
          >
            <span>{analyzedMove.quality.symbol}</span>
            <span>{analyzedMove.quality.label}</span>
          </span>
        </div>

        <div className="flex flex-col items-end text-right">
          {isOptimalMove ? (
            <>
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Ventaja</span>
              <span className="text-xs font-semibold text-emerald-400">Óptima</span>
            </>
          ) : (
            <>
              <span
                className="text-[10px] text-zinc-500 uppercase font-semibold"
                title="Pérdida de ventaja frente a la mejor jugada"
              >
                Pérdida ventaja
              </span>
              <span className="text-xs font-mono font-semibold text-amber-400">
                -{analyzedMove.evalLoss.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
            Jugada realizada
          </span>
          <span className="font-mono text-zinc-200 font-bold">
            {analyzedMove.from} → {analyzedMove.to}
          </span>
        </div>
        <div className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">
            Mejor jugada del motor
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            {analyzedMove.bestMoveFrom} → {analyzedMove.bestMoveTo}
          </span>
        </div>
      </div>

      <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60 max-h-36 overflow-y-auto pr-1">
        <span className="text-emerald-400 font-semibold mr-1.5">Coach Gemini:</span>
        {analyzedMove.advice}
      </div>
    </CoachCardShell>
  );
}

function CoachSummaryCard({
  analysisResult,
}: {
  readonly analysisResult: FullGameAnalysisResult;
}): JSX.Element {
  return (
    <CoachCardShell variant="SUMMARY" testId="coach-summary-card">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <span>♟</span> Resumen del Entrenador
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-300">
            Blancas: <strong className="text-emerald-400">{analysisResult.whiteAccuracy}%</strong>
          </span>
          <span className="text-zinc-300">
            Negras: <strong className="text-emerald-400">{analysisResult.blackAccuracy}%</strong>
          </span>
        </div>
      </div>
      <div
        className="max-h-36 overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed whitespace-pre-line"
        data-testid="coach-summary-content"
      >
        <p>{analysisResult.overallSummary}</p>
      </div>
    </CoachCardShell>
  );
}

function CoachInviteCard({
  onAnalyzeGame,
}: {
  readonly onAnalyzeGame: () => void;
}): JSX.Element {
  return (
    <CoachCardShell variant="INVITE" testId="coach-invite-card">
      <div className="flex items-center gap-2 text-xs">
        <span>✨</span>
        <span className="text-[11px] text-zinc-400">
          Analiza esta partida con el motor y Gemini
        </span>
      </div>
      <button
        type="button"
        onClick={onAnalyzeGame}
        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
      >
        <span>Analizar</span>
      </button>
    </CoachCardShell>
  );
}

export function CoachFeedbackCard({
  analyzedMove,
  liveHint,
  isLoading = false,
  progress,
  analysisResult,
  onDismissHint,
  onAnalyzeGame,
}: CoachFeedbackCardProps): JSX.Element | null {
  if (isLoading) {
    return <CoachLoadingCard progress={progress} />;
  }

  if (liveHint) {
    return <CoachLiveHintCard liveHint={liveHint} onDismissHint={onDismissHint} />;
  }

  if (analyzedMove) {
    return <CoachAnalyzedMoveCard analyzedMove={analyzedMove} />;
  }

  if (analysisResult?.overallSummary) {
    return <CoachSummaryCard analysisResult={analysisResult} />;
  }

  if (onAnalyzeGame) {
    return <CoachInviteCard onAnalyzeGame={onAnalyzeGame} />;
  }

  return null;
}
