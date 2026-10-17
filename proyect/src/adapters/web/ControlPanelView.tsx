import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { getStateBadgeClass, getStateLabel, isTerminalState } from './stateDisplayLookup';
import { GAME_MODES, GameMode } from './types';
import { ModeSelectorButton } from './components/ModeSelectorButton';
import { ControlSection } from './components/ControlSection';
import { FeedbackBanner } from './components/FeedbackBanner';
import { MoveHistoryTable } from './components/MoveHistoryTable';
import { PlaybackSpeed, ReplayControlSection } from './components/ReplayControlSection';
import { ClockConfigSection, ClockConfigSectionProps } from './components/ClockConfigSection';
import { CoachFeedbackCard, LiveHintData } from './components/CoachFeedbackCard';
import { PLAYER_DISPLAY_CONFIG } from './pieceDisplay';
import { AnalyzedMove, FullGameAnalysisResult } from '../services/AnalysisService';

export interface ControlPanelViewProps {
  readonly snapshot: GameSnapshot;
  readonly currentGameMode: GameMode;
  readonly feedbackMessage: string | null;
  readonly onModeChange: (newMode: GameMode) => void;
  readonly isReplaying?: boolean;
  readonly isPlaying?: boolean;
  readonly playbackSpeed?: PlaybackSpeed;
  readonly onStartReplay?: () => void;
  readonly onExitReplay?: () => void;
  readonly onGoToStart?: () => void;
  readonly onStepBackward?: () => void;
  readonly onTogglePlay?: () => void;
  readonly onStepForward?: () => void;
  readonly onGoToEnd?: () => void;
  readonly onSpeedChange?: (speed: PlaybackSpeed) => void;
  readonly onJumpToMove?: (targetIndex: number) => void;
  readonly clockConfig?: ClockConfigSectionProps;
  readonly analysisResult?: FullGameAnalysisResult | null;
  readonly currentAnalyzedMove?: AnalyzedMove;
  readonly liveHint?: LiveHintData | null;
  readonly isAnalysisLoading?: boolean;
  readonly analysisProgress?: { current: number; total: number } | null;
  readonly onDismissHint?: () => void;
  readonly onAnalyzeGame?: () => void;
}

function MatchStatusSection({ snapshot }: { readonly snapshot: GameSnapshot }): JSX.Element {
  const { tag, badgeStyle, dotStyle } = PLAYER_DISPLAY_CONFIG[snapshot.currentTurn];
  const stateLabel = getStateLabel(snapshot.stateKind, snapshot.winner);
  const stateBadgeClass = getStateBadgeClass(snapshot.stateKind);

  return (
    <ControlSection title="Estado de Partida">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Turno Actual
          </span>
          <span
            className={`px-2.5 py-1.5 rounded-md text-xs border shadow-sm flex items-center justify-center gap-1.5 ${badgeStyle}`}
            data-testid="turn-indicator"
          >
            <span className={`w-2 h-2 rounded-full ${dotStyle}`} />
            {tag}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Fase del Juego
          </span>
          <div
            className={`px-2.5 py-1.5 rounded-md text-xs border flex items-center justify-center text-center font-medium ${stateBadgeClass}`}
            data-testid="game-state-banner"
          >
            <span className="truncate">{stateLabel}</span>
          </div>
        </div>
      </div>
    </ControlSection>
  );
}

function GameModeSelectionSection({
  currentGameMode,
  onModeChange,
  clockConfig,
}: {
  readonly currentGameMode: GameMode;
  readonly onModeChange: (newMode: GameMode) => void;
  readonly clockConfig?: ClockConfigSectionProps;
}): JSX.Element {
  return (
    <ControlSection title="Modo de Juego" hasDivider>
      <div className="grid grid-cols-1 gap-1.5">
        {GAME_MODES.map((mode) => (
          <ModeSelectorButton
            key={mode.id}
            label={mode.label}
            isSelected={currentGameMode === mode.id}
            onClick={() => onModeChange(mode.id)}
            testId={`mode-selector-${mode.id.toLowerCase()}`}
          />
        ))}
      </div>

      {currentGameMode === 'HUMAN_VS_HUMAN' && clockConfig && (
        <ClockConfigSection {...clockConfig} />
      )}
    </ControlSection>
  );
}

export function ControlPanelView({
  snapshot,
  currentGameMode,
  feedbackMessage,
  onModeChange,
  isReplaying = false,
  isPlaying = false,
  playbackSpeed = 1000,
  onExitReplay,
  onGoToStart,
  onStepBackward,
  onTogglePlay,
  onStepForward,
  onGoToEnd,
  onSpeedChange,
  onJumpToMove,
  clockConfig,
  analysisResult,
  currentAnalyzedMove,
  liveHint,
  isAnalysisLoading = false,
  analysisProgress,
  onDismissHint,
  onAnalyzeGame,
}: ControlPanelViewProps): JSX.Element {
  const hasGameStarted = snapshot.moveHistory.length > 0;
  const isMatchFinished = isTerminalState(snapshot.stateKind);
  const canRenderInlineReplayControls = Boolean(
    isReplaying &&
      onExitReplay &&
      onGoToStart &&
      onStepBackward &&
      onTogglePlay &&
      onStepForward &&
      onGoToEnd &&
      onSpeedChange
  );

  return (
    <aside className="w-full lg:w-96 xl:w-[420px] h-full max-h-full flex flex-col gap-3 p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md overflow-y-auto">
      <div className="flex flex-col gap-2.5 flex-1 min-h-0">
        <header className="border-b border-zinc-800 pb-2">
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Panel de Partida</h2>
        </header>

        <MatchStatusSection snapshot={snapshot} />

        {feedbackMessage && <FeedbackBanner message={feedbackMessage} />}

        <CoachFeedbackCard
          analyzedMove={currentAnalyzedMove}
          liveHint={liveHint}
          isLoading={isAnalysisLoading}
          progress={analysisProgress}
          analysisResult={!currentAnalyzedMove ? analysisResult : undefined}
          onDismissHint={onDismissHint}
          onAnalyzeGame={isMatchFinished && !analysisResult ? onAnalyzeGame : undefined}
        />

        {!hasGameStarted && !isReplaying ? (
          <GameModeSelectionSection
            currentGameMode={currentGameMode}
            onModeChange={onModeChange}
            clockConfig={clockConfig}
          />
        ) : (
          <ControlSection
            title={`Historial de Jugadas (${snapshot.moveHistory.length})`}
            hasDivider
            className="flex-1 flex flex-col min-h-[160px]"
          >
            <MoveHistoryTable
              moveHistory={snapshot.moveHistory}
              currentMoveIndex={snapshot.currentMoveIndex}
              onJumpToMove={onJumpToMove}
              analyzedMoves={analysisResult?.analyzedMoves}
            />
          </ControlSection>
        )}
      </div>

      {canRenderInlineReplayControls && (
        <div className="mt-auto pt-2 border-t border-zinc-800">
          <ReplayControlSection
            currentMoveIndex={snapshot.currentMoveIndex}
            totalMoves={snapshot.moveHistory.length}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onGoToStart={onGoToStart!}
            onStepBackward={onStepBackward!}
            onTogglePlay={onTogglePlay!}
            onStepForward={onStepForward!}
            onGoToEnd={onGoToEnd!}
            onSpeedChange={onSpeedChange!}
            onExitReplay={onExitReplay!}
          />
        </div>
      )}
    </aside>
  );
}
