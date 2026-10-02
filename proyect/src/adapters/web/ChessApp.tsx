import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { Position } from '../../core/board/Position';
import { ChessGame } from '../../core/game/ChessGame';
import { Color, PieceType } from '../../core/pieces/types';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { MoveResult } from '../../core/ports/MoveResult';
import { ChessBoardView } from './ChessBoardView';
import { ControlPanelView } from './ControlPanelView';
import { PromotionModal } from './PromotionModal';
import { AppHeader } from './components/AppHeader';
import { GameActionBar } from './components/GameActionBar';
import { PlayerClockBar } from './components/PlayerClockBar';
import { PlaybackSpeed, ReplayControlSection } from './components/ReplayControlSection';
import { useChessClock } from './clock/useChessClock';
import { getRejectionMessage } from './rejectionMessages';
import { getStateLabel, isTerminalState } from './stateDisplayLookup';
import { downloadTranscriptionFile, formatMatchTranscription, generateExportFilename } from './transcriptionFormatter';
import { GAME_MODES, GameMode } from './types';

export interface ChessAppProps {
  readonly engineFactory?: () => IGameEngine;
}

interface PendingPromotion {
  readonly from: Position;
  readonly to: Position;
}

export function ChessApp({ engineFactory = () => new ChessGame() }: ChessAppProps): JSX.Element {
  const [engine, setEngine] = useState<IGameEngine>(() => engineFactory());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<readonly Position[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('HUMAN_VS_HUMAN');
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1000);
  const [isClockEnabled, setIsClockEnabled] = useState(false);
  const [whiteMinutes, setWhiteMinutes] = useState(10);
  const [blackMinutes, setBlackMinutes] = useState(10);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      const strategy = modeConfig.strategyFactory();
      const aiMove = strategy.chooseMove(currentEngine);
      if (aiMove) {
        currentEngine.makeMove(aiMove.from, aiMove.to);
      }
    },
    []
  );

  const processMoveOutcome = useCallback(
    (result: MoveResult) => {
      clearSelection();
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
    isReplaying ||
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

      const targetPiece = snapshot.grid[targetPosition.row][targetPosition.col];
      if (targetPiece && targetPiece.color === snapshot.currentTurn) {
        updateSelection(targetPosition);
        return;
      }

      const originPiece = snapshot.grid[selectedPosition.row][selectedPosition.col];
      const isPawn = originPiece?.type === 'PAWN';
      const isReachingLastRank =
        (originPiece?.color === 'WHITE' && targetPosition.row === snapshot.rows - 1) ||
        (originPiece?.color === 'BLACK' && targetPosition.row === 0);

      const isCandidateLegal = legalMoves.some((move) => move.equals(targetPosition));
      if (isPawn && isReachingLastRank && isCandidateLegal) {
        setPendingPromotion({ from: selectedPosition, to: targetPosition });
        return;
      }

      const result = engine.makeMove(selectedPosition, targetPosition);
      processMoveOutcome(result);
    },
    [clearSelection, engine, isBoardLocked, legalMoves, processMoveOutcome, selectedPosition, snapshot, updateSelection]
  );

  const handleSelectPromotionPiece = useCallback(
    (promotionPiece: PieceType) => {
      if (!pendingPromotion) {
        return;
      }

      const result = engine.makeMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
      setPendingPromotion(null);
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
    setFeedbackMessage(null);
  }, [clearSelection, engine]);

  const handleRedo = useCallback(() => {
    engine.redo();
    clearSelection();
    setFeedbackMessage(null);
  }, [clearSelection, engine]);

  const stopPlayback = useCallback(() => {
    if (playbackTimerRef.current !== null) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    playbackTimerRef.current = setInterval(() => {
      const canAdvance = engine.redo();
      if (!canAdvance) {
        if (playbackTimerRef.current !== null) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
        setIsPlaying(false);
      }
    }, playbackSpeed);
  }, [engine, isPlaying, playbackSpeed, stopPlayback]);

  const handleSpeedChange = useCallback(
    (newSpeed: PlaybackSpeed) => {
      setPlaybackSpeed(newSpeed);
      if (isPlaying) {
        if (playbackTimerRef.current !== null) {
          clearInterval(playbackTimerRef.current);
        }
        playbackTimerRef.current = setInterval(() => {
          const canAdvance = engine.redo();
          if (!canAdvance) {
            if (playbackTimerRef.current !== null) {
              clearInterval(playbackTimerRef.current);
              playbackTimerRef.current = null;
            }
            setIsPlaying(false);
          }
        }, newSpeed);
      }
    },
    [engine, isPlaying]
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

  const handleStartReplay = useCallback(() => {
    clearSelection();
    setFeedbackMessage(null);
    stopPlayback();
    setIsReplaying(true);
    while (engine.undo()) {}
  }, [clearSelection, engine, stopPlayback]);

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

  const handleReset = useCallback(() => {
    stopPlayback();
    setIsReplaying(false);
    clock.resetClock();
    setEngine(engineFactory());
    clearSelection();
    setFeedbackMessage(null);
    setPendingPromotion(null);
  }, [clearSelection, clock, engineFactory, stopPlayback]);

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      setGameMode(newMode);
      setFeedbackMessage(null);
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

  const handleExportMatch = useCallback(() => {
    const activeModeConfig = GAME_MODES.find((mode) => mode.id === gameMode);
    const baseLabel = activeModeConfig?.label ?? gameMode;
    const modeLabel = isClockEnabled ? `${baseLabel} (Con Reloj)` : baseLabel;
    const resultLabel = getStateLabel(snapshot.stateKind, snapshot.winner);
    const content = formatMatchTranscription({
      modeLabel,
      resultLabel,
      moveHistory: snapshot.moveHistory,
    });
    const filename = generateExportFilename();
    downloadTranscriptionFile(filename, content);
  }, [gameMode, isClockEnabled, snapshot.moveHistory, snapshot.stateKind, snapshot.winner]);

  const activeMove =
    isReplaying && snapshot.currentMoveIndex > 0
      ? snapshot.moveHistory[snapshot.currentMoveIndex - 1]
      : null;
  const activeMoveSquares = activeMove
    ? { from: activeMove.from, to: activeMove.to }
    : null;

  return (
    <div className="min-h-screen lg:h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-3 lg:p-6 overflow-x-hidden lg:overflow-hidden">
      <main className="w-full max-w-[1240px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6">
        <AppHeader />

        <div className="flex flex-col items-center gap-3 w-full max-w-[820px]">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6 w-full">
            <div className="flex flex-col items-stretch gap-2.5 w-full max-w-[474px]">
              {isClockEnabled && (
                <PlayerClockBar
                  color="BLACK"
                  formattedTime={clock.blackFormatted}
                  isActive={!isReplaying && clock.activeColor === 'BLACK' && (clock.clockStatus === 'RUNNING' || clock.clockStatus === 'PAUSED')}
                  isLowTime={!isReplaying && clock.isBlackLowTime}
                  isPaused={!isReplaying && clock.clockStatus === 'PAUSED'}
                />
              )}

              <ChessBoardView
                snapshot={snapshot}
                selectedPosition={selectedPosition}
                legalMoves={legalMoves}
                onSquareClick={handleSquareClick}
                activeMoveSquares={activeMoveSquares}
                readOnly={isBoardLocked}
              />

              {isClockEnabled && (
                <PlayerClockBar
                  color="WHITE"
                  formattedTime={clock.whiteFormatted}
                  isActive={!isReplaying && clock.activeColor === 'WHITE' && (clock.clockStatus === 'RUNNING' || clock.clockStatus === 'PAUSED')}
                  isLowTime={!isReplaying && clock.isWhiteLowTime}
                  isPaused={!isReplaying && clock.clockStatus === 'PAUSED'}
                />
              )}

              {!isReplaying && (
                <GameActionBar
                  canUndo={snapshot.canUndo}
                  canRedo={snapshot.canRedo}
                  isTerminalState={isTerminalState(snapshot.stateKind)}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onReset={handleReset}
                  onStartReplay={handleStartReplay}
                  onExportMatch={handleExportMatch}
                  isClockEnabled={isClockEnabled}
                  isClockRunning={clock.clockStatus === 'RUNNING'}
                  isClockPaused={clock.clockStatus === 'PAUSED'}
                  onToggleClockPause={handleToggleClockPause}
                />
              )}
            </div>

            <ControlPanelView
              snapshot={snapshot}
              currentGameMode={gameMode}
              feedbackMessage={feedbackMessage}
              onModeChange={handleModeChange}
              isReplaying={isReplaying}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onJumpToMove={handleJumpToMove}
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
          </div>

          {isReplaying && (
            <ReplayControlSection
              currentMoveIndex={snapshot.currentMoveIndex}
              totalMoves={snapshot.moveHistory.length}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onGoToStart={handleGoToStart}
              onStepBackward={handleStepBackward}
              onTogglePlay={handleTogglePlay}
              onStepForward={handleStepForward}
              onGoToEnd={handleGoToEnd}
              onSpeedChange={handleSpeedChange}
              onExitReplay={handleExitReplay}
              onReset={handleReset}
              onExportMatch={handleExportMatch}
            />
          )}
        </div>
      </main>

      <PromotionModal
        color={snapshot.currentTurn}
        isOpen={pendingPromotion !== null}
        onSelectPiece={handleSelectPromotionPiece}
        onCancel={handleCancelPromotion}
      />
    </div>
  );
}
