import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Position } from '../../core/board/Position';
import { ChessGame } from '../../core/game/ChessGame';
import { Color, PieceType } from '../../core/pieces/types';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { MoveResult } from '../../core/ports/MoveResult';
import { AnalysisService } from '../services/AnalysisService';
import { FullGameAnalysisResult, IAnalysisService } from '../services/IAnalysisService';
import { getStoredGeminiApiKey } from '../services/GeminiCoachService';
import { ChessBoardView } from './ChessBoardView';
import { ControlPanelView } from './ControlPanelView';
import { PromotionModal } from './PromotionModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AppHeader } from './components/AppHeader';
import { LiveHintData } from './components/CoachFeedbackCard';
import { GameActionBar } from './components/GameActionBar';
import { GameLayout } from './components/GameLayout';
import { PlayerClockBar } from './components/PlayerClockBar';
import { PlaybackSpeed, ReplayControlSection } from './components/ReplayControlSection';
import { useChessClock } from './clock/useChessClock';
import { getRejectionMessage } from './rejectionMessages';
import { getStateLabel, isTerminalState } from './stateDisplayLookup';
import { downloadTranscriptionFile, formatMatchTranscription, generateExportFilename } from './transcriptionFormatter';
import { GAME_MODES, GameMode } from './types';

export interface ChessAppProps {
  readonly engineFactory?: () => IGameEngine;
  readonly analysisServiceFactory?: () => IAnalysisService;
}

interface PendingPromotion {
  readonly from: Position;
  readonly to: Position;
}

type BoardLayoutMode =
  | 'REPLAY_WITH_CLOCK'
  | 'REPLAY_NO_CLOCK'
  | 'LIVE_WITH_CLOCK'
  | 'LIVE_NO_CLOCK';

interface BoardLayoutSpec {
  readonly boardMaxWidth: string;
  readonly extraHeightPx: number;
}

const BOARD_LAYOUT_DIMENSIONS: Record<BoardLayoutMode, BoardLayoutSpec> = {
  REPLAY_WITH_CLOCK: { boardMaxWidth: 'min(460px, calc(100dvh - 270px))', extraHeightPx: 214 },
  REPLAY_NO_CLOCK: { boardMaxWidth: 'min(500px, calc(100dvh - 190px))', extraHeightPx: 130 },
  LIVE_WITH_CLOCK: { boardMaxWidth: 'min(480px, calc(100dvh - 210px))', extraHeightPx: 136 },
  LIVE_NO_CLOCK: { boardMaxWidth: 'min(520px, calc(100dvh - 130px))', extraHeightPx: 52 },
};

function resolveBoardLayoutDimensions(
  isReplaying: boolean,
  isClockEnabled: boolean
): { readonly boardMaxWidth: string; readonly boardColumnHeight: string } {
  const modeKey: BoardLayoutMode = isReplaying
    ? isClockEnabled
      ? 'REPLAY_WITH_CLOCK'
      : 'REPLAY_NO_CLOCK'
    : isClockEnabled
      ? 'LIVE_WITH_CLOCK'
      : 'LIVE_NO_CLOCK';
  const { boardMaxWidth, extraHeightPx } = BOARD_LAYOUT_DIMENSIONS[modeKey];
  return {
    boardMaxWidth,
    boardColumnHeight: `calc(${boardMaxWidth} + ${extraHeightPx}px)`,
  };
}

function useMatchReplay(engine: IGameEngine) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1000);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPlaybackTimer = useCallback(() => {
    if (playbackTimerRef.current !== null) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    clearPlaybackTimer();
    setIsPlaying(false);
  }, [clearPlaybackTimer]);

  const startPlaybackInterval = useCallback(
    (speed: PlaybackSpeed) => {
      clearPlaybackTimer();
      playbackTimerRef.current = setInterval(() => {
        const canAdvance = engine.redo();
        if (!canAdvance) {
          stopPlayback();
        }
      }, speed);
    },
    [clearPlaybackTimer, engine, stopPlayback]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    setIsPlaying(true);
    startPlaybackInterval(playbackSpeed);
  }, [isPlaying, playbackSpeed, startPlaybackInterval, stopPlayback]);

  const handleSpeedChange = useCallback(
    (newSpeed: PlaybackSpeed) => {
      setPlaybackSpeed(newSpeed);
      if (isPlaying) {
        startPlaybackInterval(newSpeed);
      }
    },
    [isPlaying, startPlaybackInterval]
  );

  const handleGoToStart = useCallback(() => {
    stopPlayback();
    while (engine.undo()) {}
  }, [engine, stopPlayback]);

  const handleStepBackward = useCallback(() => {
    stopPlayback();
    engine.undo();
  }, [engine, stopPlayback]);

  const handleStepForward = useCallback(() => {
    stopPlayback();
    engine.redo();
  }, [engine, stopPlayback]);

  const handleGoToEnd = useCallback(() => {
    stopPlayback();
    while (engine.redo()) {}
  }, [engine, stopPlayback]);

  const enterReplayFromStart = useCallback(() => {
    stopPlayback();
    setIsReplaying(true);
    while (engine.undo()) {}
  }, [engine, stopPlayback]);

  const handleExitReplay = useCallback(() => {
    stopPlayback();
    while (engine.redo()) {}
    setIsReplaying(false);
  }, [engine, stopPlayback]);

  const handleJumpToMove = useCallback(
    (targetIndex: number) => {
      stopPlayback();
      const current = engine.getSnapshot().currentMoveIndex;
      if (targetIndex > current) {
        for (let i = 0; i < targetIndex - current; i++) {
          engine.redo();
        }
      } else if (targetIndex < current) {
        for (let i = 0; i < current - targetIndex; i++) {
          engine.undo();
        }
      }
    },
    [engine, stopPlayback]
  );

  return {
    isReplaying,
    setIsReplaying,
    isPlaying,
    playbackSpeed,
    stopPlayback,
    enterReplayFromStart,
    handleTogglePlay,
    handleSpeedChange,
    handleGoToStart,
    handleStepBackward,
    handleStepForward,
    handleGoToEnd,
    handleExitReplay,
    handleJumpToMove,
  };
}

function BoardColumnArea({
  snapshot,
  selectedPosition,
  legalMoves,
  onSquareClick,
  activeMoveSquares,
  suggestedMoveSquares,
  isBoardLocked,
  isReplaying,
  isClockEnabled,
  clock,
  onUndo,
  onRedo,
  onReset,
  onStartReplay,
  onExportMatch,
  onToggleClockPause,
  onAskHint,
  isHintLoading,
  onAnalyzeGame,
  isAnalyzingGame,
}: {
  readonly snapshot: ReturnType<IGameEngine['getSnapshot']>;
  readonly selectedPosition: Position | null;
  readonly legalMoves: readonly Position[];
  readonly onSquareClick: (position: Position) => void;
  readonly activeMoveSquares: { readonly from: string; readonly to: string } | null;
  readonly suggestedMoveSquares: { readonly from: string; readonly to: string } | null;
  readonly isBoardLocked: boolean;
  readonly isReplaying: boolean;
  readonly isClockEnabled: boolean;
  readonly clock: ReturnType<typeof useChessClock>;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onReset: () => void;
  readonly onStartReplay: () => void;
  readonly onExportMatch: () => void;
  readonly onToggleClockPause: () => void;
  readonly onAskHint: () => void;
  readonly isHintLoading: boolean;
  readonly onAnalyzeGame: () => void;
  readonly isAnalyzingGame: boolean;
}): JSX.Element {
  const isClockActive = !isReplaying && (clock.clockStatus === 'RUNNING' || clock.clockStatus === 'PAUSED');
  const isClockPaused = !isReplaying && clock.clockStatus === 'PAUSED';

  return (
    <>
      {isClockEnabled && (
        <PlayerClockBar
          color="BLACK"
          formattedTime={clock.blackFormatted}
          isActive={isClockActive && clock.activeColor === 'BLACK'}
          isLowTime={!isReplaying && clock.isBlackLowTime}
          isPaused={isClockPaused}
        />
      )}

      <ChessBoardView
        snapshot={snapshot}
        selectedPosition={selectedPosition}
        legalMoves={legalMoves}
        onSquareClick={onSquareClick}
        activeMoveSquares={activeMoveSquares}
        suggestedMoveSquares={suggestedMoveSquares}
        readOnly={isBoardLocked}
      />

      {isClockEnabled && (
        <PlayerClockBar
          color="WHITE"
          formattedTime={clock.whiteFormatted}
          isActive={isClockActive && clock.activeColor === 'WHITE'}
          isLowTime={!isReplaying && clock.isWhiteLowTime}
          isPaused={isClockPaused}
        />
      )}

      {!isReplaying && (
        <GameActionBar
          canUndo={snapshot.canUndo}
          canRedo={snapshot.canRedo}
          isTerminalState={isTerminalState(snapshot.stateKind)}
          onUndo={onUndo}
          onRedo={onRedo}
          onReset={onReset}
          onStartReplay={onStartReplay}
          onExportMatch={onExportMatch}
          isClockEnabled={isClockEnabled}
          isClockRunning={clock.clockStatus === 'RUNNING'}
          isClockPaused={clock.clockStatus === 'PAUSED'}
          onToggleClockPause={onToggleClockPause}
          onAskHint={onAskHint}
          isHintLoading={isHintLoading}
          onAnalyzeGame={onAnalyzeGame}
          isAnalyzingGame={isAnalyzingGame}
        />
      )}
    </>
  );
}

export function ChessApp({
  engineFactory = () => new ChessGame(),
  analysisServiceFactory = () => new AnalysisService(),
}: ChessAppProps): JSX.Element {
  const [engine, setEngine] = useState<IGameEngine>(() => engineFactory());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<readonly Position[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('HUMAN_VS_HUMAN');
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isClockEnabled, setIsClockEnabled] = useState(false);
  const [whiteMinutes, setWhiteMinutes] = useState(10);
  const [blackMinutes, setBlackMinutes] = useState(10);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasGeminiApiKey, setHasGeminiApiKey] = useState(() => getStoredGeminiApiKey().length > 0);
  const [liveHint, setLiveHint] = useState<LiveHintData | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FullGameAnalysisResult | null>(null);
  const [isAnalyzingGame, setIsAnalyzingGame] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number } | null>(null);

  const analysisServiceRef = useRef<IAnalysisService>(analysisServiceFactory());
  const replay = useMatchReplay(engine);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  const handleTimeout = useCallback(
    (timedOutColor: Color) => {
      engine.declareTimeout(timedOutColor);
    },
    [engine]
  );

  const clock = useChessClock({
    isEnabled: isClockEnabled,
    onTimeout: handleTimeout,
  });

  const handleToggleClock = useCallback(
    (enabled: boolean) => {
      setIsClockEnabled(enabled);
      if (!enabled) {
        clock.resetClock();
      }
    },
    [clock]
  );

  const handleWhiteMinutesChange = useCallback(
    (minutes: number) => {
      setWhiteMinutes(minutes);
      clock.setPlayerMinutes('WHITE', minutes);
    },
    [clock]
  );

  const handleBlackMinutesChange = useCallback(
    (minutes: number) => {
      setBlackMinutes(minutes);
      clock.setPlayerMinutes('BLACK', minutes);
    },
    [clock]
  );

  const handleStartClockMatch = useCallback(() => {
    clock.startClock('WHITE');
  }, [clock]);

  const handleToggleClockPause = useCallback(() => {
    if (clock.clockStatus === 'RUNNING') {
      clock.pauseClock();
    } else if (clock.clockStatus === 'PAUSED') {
      clock.resumeClock();
    }
  }, [clock]);

  const snapshot = useSyncExternalStore(
    useCallback(
      (notify: () => void) => {
        return engine.subscribe({
          onGameStateChanged: () => notify(),
        });
      },
      [engine]
    ),
    useCallback(() => engine.getSnapshot(), [engine]),
    useCallback(() => engine.getSnapshot(), [engine])
  );

  const clearSelection = useCallback(() => {
    setSelectedPosition(null);
    setLegalMoves([]);
  }, []);

  const updateSelection = useCallback(
    (pos: Position) => {
      setSelectedPosition(pos);
      setLegalMoves(engine.getLegalMoves(pos));
    },
    [engine]
  );

  const triggerAiMoveIfNeeded = useCallback(
    (currentEngine: IGameEngine, activeMode: GameMode) => {
      const modeConfig = GAME_MODES.find((mode) => mode.id === activeMode);
      if (!modeConfig?.strategyFactory) {
        return;
      }

      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }

      const executeAiMove = () => {
        setIsAiThinking(false);
        const strategy = modeConfig.strategyFactory!();
        const aiMove = strategy.chooseMove(currentEngine);
        if (aiMove) {
          currentEngine.makeMove(aiMove.from, aiMove.to);
        }
      };

      const delay = modeConfig.delayMs ?? 0;
      if (delay > 0) {
        setIsAiThinking(true);
        aiTimerRef.current = setTimeout(executeAiMove, delay);
      } else {
        executeAiMove();
      }
    },
    []
  );

  const processMoveOutcome = useCallback(
    (result: MoveResult) => {
      clearSelection();
      setLiveHint(null);
      if (!result.success) {
        setFeedbackMessage(getRejectionMessage(result.reason));
      } else {
        const nextSnapshot = engine.getSnapshot();
        if (isTerminalState(nextSnapshot.stateKind)) {
          if (isClockEnabled) {
            clock.pauseClock();
          }
        } else if (isClockEnabled && clock.clockStatus === 'RUNNING') {
          clock.switchClockTurn(nextSnapshot.currentTurn);
        }
        triggerAiMoveIfNeeded(engine, gameMode);
      }
    },
    [clearSelection, clock, engine, gameMode, isClockEnabled, triggerAiMoveIfNeeded]
  );

  const isBoardLocked =
    isAiThinking ||
    replay.isReplaying ||
    (isClockEnabled && clock.clockStatus !== 'RUNNING') ||
    isTerminalState(snapshot.stateKind);

  const handleSquareClick = useCallback(
    (targetPosition: Position) => {
      if (isBoardLocked) {
        return;
      }

      setFeedbackMessage(null);

      if (!selectedPosition) {
        const piece = snapshot.grid[targetPosition.row][targetPosition.col];
        if (piece && piece.color === snapshot.currentTurn) {
          updateSelection(targetPosition);
        }
        return;
      }

      if (selectedPosition.equals(targetPosition)) {
        clearSelection();
        return;
      }

      const clickedPiece = snapshot.grid[targetPosition.row][targetPosition.col];
      if (clickedPiece && clickedPiece.color === snapshot.currentTurn) {
        updateSelection(targetPosition);
        return;
      }

      const movingPiece = snapshot.grid[selectedPosition.row][selectedPosition.col];
      const isPawn = movingPiece?.type === 'PAWN';
      const isReachingLastRank =
        (movingPiece?.color === 'WHITE' && targetPosition.row === snapshot.rows - 1) ||
        (movingPiece?.color === 'BLACK' && targetPosition.row === 0);

      if (isPawn && isReachingLastRank) {
        const isLegalCandidate = legalMoves.some((candidate) => candidate.equals(targetPosition));
        if (isLegalCandidate) {
          setPendingPromotion({ from: selectedPosition, to: targetPosition });
          return;
        }
      }

      const result = engine.makeMove(selectedPosition, targetPosition);
      processMoveOutcome(result);
    },
    [
      clearSelection,
      engine,
      isBoardLocked,
      legalMoves,
      processMoveOutcome,
      selectedPosition,
      snapshot.currentTurn,
      snapshot.grid,
      snapshot.rows,
      updateSelection,
    ]
  );

  const handleSelectPromotionPiece = useCallback(
    (pieceType: PieceType) => {
      if (!pendingPromotion) {
        return;
      }
      const { from, to } = pendingPromotion;
      setPendingPromotion(null);
      const result = engine.makeMove(from, to, pieceType);
      processMoveOutcome(result);
    },
    [engine, pendingPromotion, processMoveOutcome]
  );

  const handleCancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    clearSelection();
  }, [clearSelection]);

  const handleUndo = useCallback(() => {
    engine.undo();
    clearSelection();
    setLiveHint(null);
    setFeedbackMessage(null);
  }, [clearSelection, engine]);

  const handleRedo = useCallback(() => {
    engine.redo();
    clearSelection();
    setLiveHint(null);
    setFeedbackMessage(null);
  }, [clearSelection, engine]);

  const handleStartReplay = useCallback(() => {
    clearSelection();
    setLiveHint(null);
    setFeedbackMessage(null);
    replay.enterReplayFromStart();
  }, [clearSelection, replay]);

  const handleReset = useCallback(() => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setIsAiThinking(false);
    replay.stopPlayback();
    replay.setIsReplaying(false);
    clock.resetClock();
    setEngine(engineFactory());
    clearSelection();
    setFeedbackMessage(null);
    setPendingPromotion(null);
    setLiveHint(null);
    setAnalysisResult(null);
  }, [clearSelection, clock, engineFactory, replay]);

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      setIsAiThinking(false);
      setGameMode(newMode);
      setFeedbackMessage(null);
      setLiveHint(null);
      if (newMode !== 'HUMAN_VS_HUMAN') {
        clock.resetClock();
        setIsClockEnabled(false);
        const currentSnap = engine.getSnapshot();
        if (currentSnap.currentTurn === 'BLACK') {
          triggerAiMoveIfNeeded(engine, newMode);
        }
      }
    },
    [clock, engine, triggerAiMoveIfNeeded]
  );

  const handleAskHint = useCallback(async () => {
    setIsHintLoading(true);
    setFeedbackMessage(null);
    try {
      const hint = await analysisServiceRef.current.getLiveHint(snapshot);
      setLiveHint(hint);
    } catch {
      setFeedbackMessage('No se pudo obtener la sugerencia del entrenador.');
    } finally {
      setIsHintLoading(false);
    }
  }, [snapshot]);

  const handleAnalyzeGame = useCallback(async () => {
    if (snapshot.moveHistory.length === 0) {
      return;
    }
    setIsAnalyzingGame(true);
    setFeedbackMessage(null);
    try {
      const result = await analysisServiceRef.current.analyzeFullGame(
        snapshot,
        (current, total) => setAnalysisProgress({ current, total }),
        engineFactory
      );
      setAnalysisResult(result);
      replay.enterReplayFromStart();
      if (result.analyzedMoves.length > 0) {
        engine.redo();
      }
    } catch {
      setFeedbackMessage('Hubo un error al analizar la partida.');
    } finally {
      setIsAnalyzingGame(false);
      setAnalysisProgress(null);
    }
  }, [engine, engineFactory, replay, snapshot]);

  const handleKeySaved = useCallback(() => {
    analysisServiceRef.current = analysisServiceFactory();
    setHasGeminiApiKey(getStoredGeminiApiKey().length > 0);
  }, [analysisServiceFactory]);

  const handleExportMatch = useCallback(() => {
    const activeModeConfig = GAME_MODES.find((mode) => mode.id === gameMode);
    const baseLabel = activeModeConfig?.label ?? gameMode;
    const modeLabel = isClockEnabled ? `${baseLabel} (Con Reloj)` : baseLabel;
    const resultLabel = getStateLabel(snapshot.stateKind, snapshot.winner);
    const content = formatMatchTranscription({
      modeLabel,
      resultLabel,
      moveHistory: snapshot.moveHistory,
      analysisResult,
    });
    const filename = generateExportFilename();
    downloadTranscriptionFile(filename, content);
  }, [
    analysisResult,
    gameMode,
    isClockEnabled,
    snapshot.moveHistory,
    snapshot.stateKind,
    snapshot.winner,
  ]);

  const currentAnalyzedMove =
    replay.isReplaying && analysisResult && snapshot.currentMoveIndex > 0
      ? analysisResult.analyzedMoves[snapshot.currentMoveIndex - 1]
      : undefined;

  const activeMove =
    replay.isReplaying && snapshot.currentMoveIndex > 0
      ? snapshot.moveHistory[snapshot.currentMoveIndex - 1]
      : null;

  const activeMoveSquares = activeMove
    ? { from: activeMove.from, to: activeMove.to }
    : null;

  const suggestedMoveSquares = liveHint
    ? { from: liveHint.from, to: liveHint.to }
    : currentAnalyzedMove && currentAnalyzedMove.bestMoveFrom && currentAnalyzedMove.bestMoveTo
    ? { from: currentAnalyzedMove.bestMoveFrom, to: currentAnalyzedMove.bestMoveTo }
    : null;

  const { boardMaxWidth, boardColumnHeight } = resolveBoardLayoutDimensions(
    replay.isReplaying,
    isClockEnabled
  );

  return (
    <>
      <GameLayout
        header={
          <AppHeader
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            hasApiKey={hasGeminiApiKey}
          />
        }
        boardArea={
          <BoardColumnArea
            snapshot={snapshot}
            selectedPosition={selectedPosition}
            legalMoves={legalMoves}
            onSquareClick={handleSquareClick}
            activeMoveSquares={activeMoveSquares}
            suggestedMoveSquares={suggestedMoveSquares}
            isBoardLocked={isBoardLocked}
            isReplaying={replay.isReplaying}
            isClockEnabled={isClockEnabled}
            clock={clock}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onStartReplay={handleStartReplay}
            onExportMatch={handleExportMatch}
            onToggleClockPause={handleToggleClockPause}
            onAskHint={handleAskHint}
            isHintLoading={isHintLoading}
            onAnalyzeGame={handleAnalyzeGame}
            isAnalyzingGame={isAnalyzingGame}
          />
        }
        controlPanel={
          <ControlPanelView
            snapshot={snapshot}
            currentGameMode={gameMode}
            feedbackMessage={feedbackMessage}
            onModeChange={handleModeChange}
            isReplaying={replay.isReplaying}
            isPlaying={replay.isPlaying}
            playbackSpeed={replay.playbackSpeed}
            onJumpToMove={replay.handleJumpToMove}
            analysisResult={analysisResult}
            currentAnalyzedMove={currentAnalyzedMove}
            liveHint={liveHint}
            isAnalysisLoading={isAnalyzingGame}
            analysisProgress={analysisProgress}
            onDismissHint={() => setLiveHint(null)}
            onAnalyzeGame={handleAnalyzeGame}
            clockConfig={{
              isClockEnabled,
              isClockRunning: clock.clockStatus === 'RUNNING',
              whiteMinutes,
              blackMinutes,
              onToggleClock: handleToggleClock,
              onWhiteMinutesChange: handleWhiteMinutesChange,
              onBlackMinutesChange: handleBlackMinutesChange,
              onStartMatch: handleStartClockMatch,
            }}
          />
        }
        replayBar={
          replay.isReplaying ? (
            <ReplayControlSection
              currentMoveIndex={snapshot.currentMoveIndex}
              totalMoves={snapshot.moveHistory.length}
              isPlaying={replay.isPlaying}
              playbackSpeed={replay.playbackSpeed}
              onGoToStart={replay.handleGoToStart}
              onStepBackward={replay.handleStepBackward}
              onTogglePlay={replay.handleTogglePlay}
              onStepForward={replay.handleStepForward}
              onGoToEnd={replay.handleGoToEnd}
              onSpeedChange={replay.handleSpeedChange}
              onExitReplay={replay.handleExitReplay}
              onReset={handleReset}
              onExportMatch={handleExportMatch}
            />
          ) : undefined
        }
        boardMaxWidth={boardMaxWidth}
        boardColumnHeight={boardColumnHeight}
      />

      <PromotionModal
        color={snapshot.currentTurn}
        isOpen={pendingPromotion !== null}
        onSelectPiece={handleSelectPromotionPiece}
        onCancel={handleCancelPromotion}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={handleKeySaved}
      />
    </>
  );
}
