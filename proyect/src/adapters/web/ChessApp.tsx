import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { Position } from '../../core/board/Position';
import { ChessGame } from '../../core/game/ChessGame';
import { PieceType } from '../../core/pieces/types';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { MoveResult } from '../../core/ports/MoveResult';
import { ChessBoardView } from './ChessBoardView';
import { ControlPanelView } from './ControlPanelView';
import { PromotionModal } from './PromotionModal';
import { AppHeader } from './components/AppHeader';
import { MoveHistoryPanel } from './components/MoveHistoryPanel';
import { PlaybackSpeed } from './components/ReplayControlSection';
import { getRejectionMessage } from './rejectionMessages';
import { getStateLabel } from './stateDisplayLookup';
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
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        triggerAiMoveIfNeeded(engine, gameMode);
      }
    },
    [clearSelection, engine, gameMode, triggerAiMoveIfNeeded]
  );

  const handleSquareClick = useCallback(
    (targetPosition: Position) => {
      if (isReplaying) {
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
    [clearSelection, engine, isReplaying, legalMoves, processMoveOutcome, selectedPosition, snapshot, updateSelection]
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
    setEngine(engineFactory());
    clearSelection();
    setFeedbackMessage(null);
    setPendingPromotion(null);
  }, [clearSelection, engineFactory, stopPlayback]);

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      setGameMode(newMode);
      setFeedbackMessage(null);
      if (newMode !== 'HUMAN_VS_HUMAN') {
        const currentSnap = engine.getSnapshot();
        if (currentSnap.currentTurn === 'BLACK') {
          triggerAiMoveIfNeeded(engine, newMode);
        }
      }
    },
    [engine, triggerAiMoveIfNeeded]
  );

  const handleExportMatch = useCallback(() => {
    const activeModeConfig = GAME_MODES.find((mode) => mode.id === gameMode);
    const modeLabel = activeModeConfig?.label ?? gameMode;
    const resultLabel = getStateLabel(snapshot.stateKind);
    const content = formatMatchTranscription({
      modeLabel,
      resultLabel,
      moveHistory: snapshot.moveHistory,
    });
    const filename = generateExportFilename();
    downloadTranscriptionFile(filename, content);
  }, [gameMode, snapshot.moveHistory, snapshot.stateKind]);

  const activeMove =
    isReplaying && snapshot.currentMoveIndex > 0
      ? snapshot.moveHistory[snapshot.currentMoveIndex - 1]
      : null;
  const activeMoveSquares = activeMove
    ? { from: activeMove.from, to: activeMove.to }
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 md:p-8">
      <AppHeader />

      <main className="w-full max-w-7xl flex flex-col xl:flex-row items-center xl:items-start justify-center gap-6">
        <ChessBoardView
          snapshot={snapshot}
          selectedPosition={selectedPosition}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
          activeMoveSquares={activeMoveSquares}
        />

        <ControlPanelView
          snapshot={snapshot}
          currentGameMode={gameMode}
          feedbackMessage={feedbackMessage}
          onModeChange={handleModeChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onExportMatch={handleExportMatch}
          isReplaying={isReplaying}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onStartReplay={handleStartReplay}
          onExitReplay={handleExitReplay}
          onGoToStart={handleGoToStart}
          onStepBackward={handleStepBackward}
          onTogglePlay={handleTogglePlay}
          onStepForward={handleStepForward}
          onGoToEnd={handleGoToEnd}
          onSpeedChange={handleSpeedChange}
        />

        {(isReplaying || snapshot.moveHistory.length > 0) && (
          <MoveHistoryPanel
            moveHistory={snapshot.moveHistory}
            currentMoveIndex={snapshot.currentMoveIndex}
            onJumpToMove={handleJumpToMove}
            isReplaying={isReplaying}
          />
        )}
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
