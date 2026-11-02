import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  AlgebraicPiecePlacement,
  createBoardFromPlacements,
  createStandardBoard,
} from '../../core/board/boardSetup';
import { Position } from '../../core/board/Position';
import { ChessGame } from '../../core/game/ChessGame';
import { StudyPlayState } from '../../core/game/StudyPlayState';
import { Color, PieceType } from '../../core/pieces/types';
import { GameSnapshot } from '../../core/ports/GameSnapshot';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { MoveResult } from '../../core/ports/MoveResult';
import { AnalysisService } from '../services/AnalysisService';
import { FullGameAnalysisResult, IAnalysisService } from '../services/IAnalysisService';
import { getStoredGeminiApiKey } from '../services/GeminiCoachService';
import seedLibraryData from '../storage/chess-library.json';
import {
  BoardPiecePlacement,
  IChessLibraryRepository,
  MatePuzzleRecord,
  SavedAnnotatedMatchRecord,
  StudyPositionRecord,
} from '../storage/IChessLibraryRepository';
import { JsonFileLibraryAdapter } from '../storage/JsonFileLibraryAdapter';
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
import { hydrateSavedAnnotatedMatch } from './matches/savedMatchHydrator';
import { MatePuzzleController, PuzzleResolutionStatus } from './puzzles/MatePuzzleController';
import { getRejectionMessage } from './rejectionMessages';
import { getStateLabel, isTerminalState } from './stateDisplayLookup';
import {
  downloadTranscriptionFile,
  formatMatchTranscription,
  generateExportFilename,
} from './transcriptionFormatter';
import { ActivityMode, EditorPaletteTool, GAME_MODES, GameMode } from './types';

export interface ChessAppProps {
  readonly engineFactory?: () => IGameEngine;
  readonly analysisServiceFactory?: () => IAnalysisService;
  readonly libraryRepositoryFactory?: () => IChessLibraryRepository;
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

function extractPlacementsFromSnapshot(snapshot: GameSnapshot): BoardPiecePlacement[] {
  const placements: BoardPiecePlacement[] = [];
  for (let row = 0; row < snapshot.rows; row++) {
    for (let col = 0; col < snapshot.cols; col++) {
      const piece = snapshot.grid[row][col];
      if (piece) {
        placements.push({
          square: new Position(row, col).toAlgebraic(),
          type: piece.type,
          color: piece.color,
        });
      }
    }
  }
  return placements;
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
    (speed: PlaybackSpeed, targetEngine: IGameEngine = engine) => {
      clearPlaybackTimer();
      playbackTimerRef.current = setInterval(() => {
        const canAdvance = targetEngine.redo();
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

  const enterReplayFromStart = useCallback(
    (targetEngine: IGameEngine = engine) => {
      stopPlayback();
      setIsReplaying(true);
      while (targetEngine.undo()) {}
    },
    [engine, stopPlayback]
  );

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
  boardOrientation,
  canUndo,
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
  readonly boardOrientation: Color;
  readonly canUndo: boolean;
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
  const isClockActive =
    !isReplaying && (clock.clockStatus === 'RUNNING' || clock.clockStatus === 'PAUSED');
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
        boardOrientation={boardOrientation}
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
          canUndo={canUndo}
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
  libraryRepositoryFactory = () => new JsonFileLibraryAdapter(),
}: ChessAppProps): JSX.Element {
  const [engine, setEngine] = useState<IGameEngine>(() => engineFactory());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<readonly Position[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('HUMAN_VS_HUMAN');
  const [playerColor, setPlayerColor] = useState<Color>('WHITE');
  const [activeActivity, setActiveActivity] = useState<ActivityMode>('CLASSIC_MATCH');
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isClockEnabled, setIsClockEnabled] = useState(false);
  const [whiteMinutes, setWhiteMinutes] = useState(10);
  const [blackMinutes, setBlackMinutes] = useState(10);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [isEditorActive, setIsEditorActive] = useState(false);
  const [editorTool, setEditorTool] = useState<EditorPaletteTool | null>({
    kind: 'PIECE',
    color: 'WHITE',
    type: 'KNIGHT',
  });
  const [editorInitialTurn, setEditorInitialTurn] = useState<Color>('WHITE');
  const [editorPlacements, setEditorPlacements] = useState<BoardPiecePlacement[]>([]);

  const [studyPositions, setStudyPositions] = useState<readonly StudyPositionRecord[]>(
    () => seedLibraryData.studyPositions as unknown as StudyPositionRecord[]
  );
  const [matePuzzles, setMatePuzzles] = useState<readonly MatePuzzleRecord[]>(
    () => seedLibraryData.matePuzzles as unknown as MatePuzzleRecord[]
  );
  const [annotatedMatches, setAnnotatedMatches] = useState<readonly SavedAnnotatedMatchRecord[]>(
    () => seedLibraryData.annotatedMatches as unknown as SavedAnnotatedMatchRecord[]
  );

  const puzzleControllerRef = useRef<MatePuzzleController | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<MatePuzzleRecord | null>(null);
  const [puzzleStatus, setPuzzleStatus] = useState<PuzzleResolutionStatus>('IN_PROGRESS');
  const [puzzleRemainingMoves, setPuzzleRemainingMoves] = useState<number>(0);
  const [activeAnnotatedMatchId, setActiveAnnotatedMatchId] = useState<string | null>(null);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasGeminiApiKey, setHasGeminiApiKey] = useState(
    () => getStoredGeminiApiKey().length > 0
  );
  const [liveHint, setLiveHint] = useState<LiveHintData | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FullGameAnalysisResult | null>(null);
  const [isAnalyzingGame, setIsAnalyzingGame] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const analysisServiceRef = useRef<IAnalysisService>(analysisServiceFactory());
  const libraryRepositoryRef = useRef<IChessLibraryRepository>(libraryRepositoryFactory());
  const replay = useMatchReplay(engine);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  const refreshLibraryCatalog = useCallback(async () => {
    const repo = libraryRepositoryRef.current;
    const [loadedStudies, loadedPuzzles, loadedMatches] = await Promise.all([
      repo.getStudyPositions(),
      repo.getMatePuzzles(),
      repo.getAnnotatedMatches(),
    ]);
    setStudyPositions(loadedStudies);
    setMatePuzzles(loadedPuzzles);
    setAnnotatedMatches(loadedMatches);
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
    (
      currentEngine: IGameEngine,
      activeMode: GameMode,
      activePlayerColor: Color = playerColor
    ) => {
      const modeConfig = GAME_MODES.find((mode) => mode.id === activeMode);
      if (!modeConfig?.strategyFactory) {
        return;
      }

      const currentSnap = currentEngine.getSnapshot();
      if (isTerminalState(currentSnap.stateKind) || currentSnap.currentTurn === activePlayerColor) {
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
    [playerColor]
  );

  const applyEditorPlacementsToEngine = useCallback(
    (placements: readonly AlgebraicPiecePlacement[], turn: Color) => {
      const board = createBoardFromPlacements(placements);
      const studyEngine = new ChessGame(board, turn, undefined, undefined, new StudyPlayState());
      setEngine(studyEngine);
      return studyEngine;
    },
    []
  );

  const handleSelectActivity = useCallback(
    (nextActivity: ActivityMode) => {
      replay.stopPlayback();
      replay.setIsReplaying(false);
      clock.resetClock();
      setIsClockEnabled(false);
      clearSelection();
      setPendingPromotion(null);
      setFeedbackMessage(null);
      setLiveHint(null);
      setAnalysisResult(null);
      setActiveAnnotatedMatchId(null);
      puzzleControllerRef.current = null;
      setActivePuzzle(null);
      setPuzzleStatus('IN_PROGRESS');
      setPuzzleRemainingMoves(0);
      setActiveActivity(nextActivity);
      void refreshLibraryCatalog();

      const activitySetupLookup: Record<ActivityMode, () => void> = {
        CLASSIC_MATCH: () => {
          setIsEditorActive(false);
          setEngine(engineFactory());
        },
        STUDY_EDITOR: () => {
          setIsEditorActive(true);
          setEditorPlacements([]);
          setEditorInitialTurn('WHITE');
          applyEditorPlacementsToEngine([], 'WHITE');
        },
        MATE_PUZZLES: () => {
          setIsEditorActive(false);
          setEngine(engineFactory());
        },
        ANNOTATED_MATCHES: () => {
          setIsEditorActive(false);
          setEngine(engineFactory());
        },
      };

      activitySetupLookup[nextActivity]();
    },
    [
      applyEditorPlacementsToEngine,
      clearSelection,
      clock,
      engineFactory,
      refreshLibraryCatalog,
      replay,
    ]
  );

  const handleClearEditorBoard = useCallback(() => {
    setEditorPlacements([]);
    applyEditorPlacementsToEngine([], editorInitialTurn);
  }, [applyEditorPlacementsToEngine, editorInitialTurn]);

  const handleRestoreStandardEditorBoard = useCallback(() => {
    const standardSnap = new ChessGame(createStandardBoard()).getSnapshot();
    const placements = extractPlacementsFromSnapshot(standardSnap);
    setEditorPlacements(placements);
    applyEditorPlacementsToEngine(placements, editorInitialTurn);
  }, [applyEditorPlacementsToEngine, editorInitialTurn]);

  const handleChangeEditorTurn = useCallback(
    (turn: Color) => {
      setEditorInitialTurn(turn);
      applyEditorPlacementsToEngine(editorPlacements, turn);
    },
    [applyEditorPlacementsToEngine, editorPlacements]
  );

  const handleStartStudyMatch = useCallback(() => {
    setIsEditorActive(false);
    clearSelection();
    setFeedbackMessage(null);
    applyEditorPlacementsToEngine(editorPlacements, editorInitialTurn);
  }, [applyEditorPlacementsToEngine, clearSelection, editorInitialTurn, editorPlacements]);

  const handleReturnToEditor = useCallback(() => {
    const currentPlacements = extractPlacementsFromSnapshot(engine.getSnapshot());
    setEditorPlacements(currentPlacements);
    setIsEditorActive(true);
    clearSelection();
  }, [clearSelection, engine]);

  const handleLoadStudyPosition = useCallback(
    (study: StudyPositionRecord) => {
      setEditorPlacements([...study.pieces]);
      setEditorInitialTurn(study.initialTurn);
      setIsEditorActive(false);
      clearSelection();
      setFeedbackMessage(null);
      applyEditorPlacementsToEngine(study.pieces, study.initialTurn);
    },
    [applyEditorPlacementsToEngine, clearSelection]
  );

  const handleSaveStudyPosition = useCallback(
    async (title: string, description: string) => {
      const currentPieces = isEditorActive
        ? editorPlacements
        : extractPlacementsFromSnapshot(engine.getSnapshot());
      const newStudy: StudyPositionRecord = {
        id: `study-${Date.now()}`,
        title,
        description,
        initialTurn: editorInitialTurn,
        pieces: currentPieces,
      };
      await libraryRepositoryRef.current.saveStudyPosition(newStudy);
      await refreshLibraryCatalog();
      setFeedbackMessage('Posición de estudio guardada en la biblioteca JSON.');
    },
    [editorInitialTurn, editorPlacements, engine, isEditorActive, refreshLibraryCatalog]
  );

  const handleSaveMatePuzzle = useCallback(
    async (title: string, description: string, maxMoves: number) => {
      const currentPieces = isEditorActive
        ? editorPlacements
        : extractPlacementsFromSnapshot(engine.getSnapshot());
      const newPuzzle: MatePuzzleRecord = {
        id: `puzzle-${Date.now()}`,
        title,
        description,
        initialTurn: editorInitialTurn,
        maxMoves,
        pieces: currentPieces,
        opponentResponses: [],
      };
      await libraryRepositoryRef.current.saveMatePuzzle(newPuzzle);
      await refreshLibraryCatalog();
      setFeedbackMessage(`Ejercicio "${title}" guardado en la biblioteca JSON.`);
    },
    [editorInitialTurn, editorPlacements, engine, isEditorActive, refreshLibraryCatalog]
  );

  const handleSelectPuzzle = useCallback(
    (puzzle: MatePuzzleRecord) => {
      replay.stopPlayback();
      replay.setIsReplaying(false);
      clearSelection();
      setFeedbackMessage(null);
      setLiveHint(null);
      const controller = new MatePuzzleController(puzzle);
      puzzleControllerRef.current = controller;
      setActivePuzzle(puzzle);
      setPuzzleStatus(controller.getStatus());
      setPuzzleRemainingMoves(controller.getRemainingMoves());
      setEngine(controller.getEngine());
    },
    [clearSelection, replay]
  );

  const handleRetryPuzzle = useCallback(() => {
    const controller = puzzleControllerRef.current;
    if (!controller) {
      return;
    }
    clearSelection();
    setFeedbackMessage(null);
    setLiveHint(null);
    const freshEngine = controller.resetPuzzle();
    setPuzzleStatus(controller.getStatus());
    setPuzzleRemainingMoves(controller.getRemainingMoves());
    setEngine(freshEngine);
  }, [clearSelection]);

  const handleSelectAnnotatedMatch = useCallback(
    (match: SavedAnnotatedMatchRecord) => {
      clearSelection();
      setFeedbackMessage(null);
      setLiveHint(null);
      const hydratedEngine = hydrateSavedAnnotatedMatch(match);
      setEngine(hydratedEngine);
      setAnalysisResult(match.analysisResult);
      setActiveAnnotatedMatchId(match.id);
      replay.enterReplayFromStart(hydratedEngine);
    },
    [clearSelection, replay]
  );

  const handleDeleteAnnotatedMatch = useCallback(
    async (matchId: string) => {
      await libraryRepositoryRef.current.deleteAnnotatedMatch(matchId);
      if (activeAnnotatedMatchId === matchId) {
        replay.stopPlayback();
        replay.setIsReplaying(false);
        setActiveAnnotatedMatchId(null);
        setAnalysisResult(null);
        setEngine(engineFactory());
      }
      await refreshLibraryCatalog();
    },
    [activeAnnotatedMatchId, engineFactory, refreshLibraryCatalog, replay]
  );

  const resolveAnalysisEngineFactory = useCallback((): (() => IGameEngine) => {
    if (activeActivity === 'STUDY_EDITOR') {
      return () =>
        new ChessGame(
          createBoardFromPlacements(editorPlacements),
          editorInitialTurn,
          undefined,
          undefined,
          new StudyPlayState()
        );
    }
    return engineFactory;
  }, [activeActivity, editorInitialTurn, editorPlacements, engineFactory]);

  const handleSaveCurrentMatch = useCallback(
    async (title: string, description: string): Promise<boolean> => {
      const currentSnap = engine.getSnapshot();
      if (currentSnap.moveHistory.length === 0) {
        return false;
      }
      try {
        let resolvedAnalysis: FullGameAnalysisResult | null = analysisResult;
        if (!resolvedAnalysis) {
          try {
            resolvedAnalysis = await analysisServiceRef.current.analyzeFullGame(
              currentSnap,
              undefined,
              resolveAnalysisEngineFactory()
            );
            setAnalysisResult(resolvedAnalysis);
          } catch {
            resolvedAnalysis = {
              overallSummary: description,
              whiteAccuracy: 100,
              blackAccuracy: 100,
              analyzedMoves: [],
            };
          }
        }
        const isCustomStudy = activeActivity === 'STUDY_EDITOR';
        const newMatch: SavedAnnotatedMatchRecord = {
          id: `match-${Date.now()}`,
          title,
          description,
          ...(isCustomStudy
            ? {
                initialPieces: editorPlacements,
                initialTurn: editorInitialTurn,
              }
            : {}),
          moves: currentSnap.moveHistory,
          analysisResult: resolvedAnalysis,
        };
        await libraryRepositoryRef.current.saveAnnotatedMatch(newMatch);
        await refreshLibraryCatalog();
        return true;
      } catch {
        setFeedbackMessage('No se pudo guardar la partida en la biblioteca JSON.');
        return false;
      }
    },
    [
      activeActivity,
      analysisResult,
      editorInitialTurn,
      editorPlacements,
      engine,
      refreshLibraryCatalog,
      resolveAnalysisEngineFactory,
    ]
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
        if (activeActivity === 'CLASSIC_MATCH') {
          triggerAiMoveIfNeeded(engine, gameMode);
        }
      }
    },
    [
      activeActivity,
      clearSelection,
      clock,
      engine,
      gameMode,
      isClockEnabled,
      playerColor,
      triggerAiMoveIfNeeded,
    ]
  );

  const isAiMode = activeActivity === 'CLASSIC_MATCH' && gameMode !== 'HUMAN_VS_HUMAN';
  const isAiTurn = isAiMode && snapshot.currentTurn !== playerColor;
  const boardOrientation: Color = isAiMode ? playerColor : 'WHITE';
  const canUndo =
    isAiMode && playerColor === 'BLACK' ? snapshot.currentMoveIndex >= 2 : snapshot.canUndo;

  const isBoardLocked =
    isAiThinking ||
    isAiTurn ||
    (!isEditorActive &&
      (replay.isReplaying ||
        (isClockEnabled && clock.clockStatus !== 'RUNNING') ||
        (activeActivity === 'MATE_PUZZLES' && puzzleStatus !== 'IN_PROGRESS') ||
        isTerminalState(snapshot.stateKind)));

  const handleEditorSquareClick = useCallback(
    (targetPosition: Position) => {
      if (!editorTool) {
        return;
      }
      const targetSquare = targetPosition.toAlgebraic();
      const withoutSquare = editorPlacements.filter((item) => item.square !== targetSquare);
      const nextPlacements =
        editorTool.kind === 'ERASE'
          ? withoutSquare
          : [
              ...withoutSquare,
              {
                square: targetSquare,
                type: editorTool.type,
                color: editorTool.color,
              },
            ];
      setEditorPlacements(nextPlacements);
      applyEditorPlacementsToEngine(nextPlacements, editorInitialTurn);
    },
    [applyEditorPlacementsToEngine, editorInitialTurn, editorPlacements, editorTool]
  );

  const executePuzzleMove = useCallback(
    (from: Position, to: Position, promotionPiece?: PieceType): boolean => {
      if (activeActivity !== 'MATE_PUZZLES' || !puzzleControllerRef.current) {
        return false;
      }
      const controller = puzzleControllerRef.current;
      const puzzleOutcome = controller.makePlayerMove(from, to, promotionPiece);
      setPuzzleStatus(controller.getStatus());
      setPuzzleRemainingMoves(controller.getRemainingMoves());
      clearSelection();
      if (!puzzleOutcome.success) {
        setFeedbackMessage(getRejectionMessage(puzzleOutcome.reason));
      }
      return true;
    },
    [activeActivity, clearSelection]
  );

  const handleSquareClick = useCallback(
    (targetPosition: Position) => {
      if (activeActivity === 'STUDY_EDITOR' && isEditorActive) {
        handleEditorSquareClick(targetPosition);
        return;
      }

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
        const isLegalCandidate = legalMoves.some((candidate) =>
          candidate.equals(targetPosition)
        );
        if (isLegalCandidate) {
          setPendingPromotion({ from: selectedPosition, to: targetPosition });
          return;
        }
      }

      if (executePuzzleMove(selectedPosition, targetPosition)) {
        return;
      }

      const result = engine.makeMove(selectedPosition, targetPosition);
      processMoveOutcome(result);
    },
    [
      activeActivity,
      clearSelection,
      engine,
      executePuzzleMove,
      handleEditorSquareClick,
      isBoardLocked,
      isEditorActive,
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

      if (executePuzzleMove(from, to, pieceType)) {
        return;
      }

      const result = engine.makeMove(from, to, pieceType);
      processMoveOutcome(result);
    },
    [engine, executePuzzleMove, pendingPromotion, processMoveOutcome]
  );

  const handleCancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    clearSelection();
  }, [clearSelection]);

  const handleUndo = useCallback(() => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setIsAiThinking(false);
    if (activeActivity === 'MATE_PUZZLES' && puzzleControllerRef.current) {
      const controller = puzzleControllerRef.current;
      controller.undoPlayerMove();
      setPuzzleStatus(controller.getStatus());
      setPuzzleRemainingMoves(controller.getRemainingMoves());
    } else {
      engine.undo();
    }
    if (isAiMode && engine.getSnapshot().currentTurn !== playerColor) {
      engine.undo();
    }
    clearSelection();
    setLiveHint(null);
    setFeedbackMessage(null);
  }, [activeActivity, clearSelection, engine, isAiMode, playerColor]);

  const handleRedo = useCallback(() => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setIsAiThinking(false);
    engine.redo();
    if (isAiMode && engine.getSnapshot().currentTurn !== playerColor) {
      const redone = engine.redo();
      if (!redone && engine.getSnapshot().currentTurn !== playerColor) {
        triggerAiMoveIfNeeded(engine, gameMode, playerColor);
      }
    }
    clearSelection();
    setLiveHint(null);
    setFeedbackMessage(null);
  }, [clearSelection, engine, gameMode, isAiMode, playerColor, triggerAiMoveIfNeeded]);

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
      clearSelection();
      setFeedbackMessage(null);
      setLiveHint(null);
      if (newMode !== 'HUMAN_VS_HUMAN') {
        clock.resetClock();
        setIsClockEnabled(false);
        const currentSnap = engine.getSnapshot();
        if (currentSnap.moveHistory.length > 0 && currentSnap.currentTurn !== playerColor) {
          triggerAiMoveIfNeeded(engine, newMode, playerColor);
        }
      }
    },
    [clearSelection, clock, engine, playerColor, triggerAiMoveIfNeeded]
  );

  const handlePlayerColorChange = useCallback(
    (newColor: Color) => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      setIsAiThinking(false);
      setPlayerColor(newColor);
      clearSelection();
      setFeedbackMessage(null);
      setLiveHint(null);
    },
    [clearSelection]
  );

  const handleStartAiMatch = useCallback(() => {
    clearSelection();
    setFeedbackMessage(null);
    setLiveHint(null);
    triggerAiMoveIfNeeded(engine, gameMode, playerColor);
  }, [clearSelection, engine, gameMode, playerColor, triggerAiMoveIfNeeded]);

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
        resolveAnalysisEngineFactory()
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
  }, [engine, replay, resolveAnalysisEngineFactory, snapshot]);

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
            activeActivity={activeActivity}
            onSelectActivity={handleSelectActivity}
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
            boardOrientation={boardOrientation}
            canUndo={canUndo}
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
            activeActivity={activeActivity}
            studyEditorProps={{
              isEditorActive,
              selectedTool: editorTool,
              initialTurn: editorInitialTurn,
              studyPositions,
              onSelectTool: setEditorTool,
              onChangeInitialTurn: handleChangeEditorTurn,
              onClearBoard: handleClearEditorBoard,
              onRestoreStandardBoard: handleRestoreStandardEditorBoard,
              onStartStudyMatch: handleStartStudyMatch,
              onReturnToEditor: handleReturnToEditor,
              onLoadStudyPosition: handleLoadStudyPosition,
              onSaveStudyPosition: handleSaveStudyPosition,
              onSaveMatePuzzle: handleSaveMatePuzzle,
            }}
            matePuzzlesProps={{
              puzzles: matePuzzles,
              activePuzzle,
              puzzleStatus,
              remainingMoves: puzzleRemainingMoves,
              onSelectPuzzle: handleSelectPuzzle,
              onRetryPuzzle: handleRetryPuzzle,
            }}
            annotatedMatchesProps={{
              annotatedMatches,
              activeMatchId: activeAnnotatedMatchId,
              canSaveCurrentMatch: snapshot.moveHistory.length > 0,
              onSelectMatch: handleSelectAnnotatedMatch,
              onSaveCurrentMatch: handleSaveCurrentMatch,
              onDeleteMatch: handleDeleteAnnotatedMatch,
            }}
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
            playerColorConfig={{
              playerColor,
              isAiThinking,
              onPlayerColorChange: handlePlayerColorChange,
              onStartMatch: handleStartAiMatch,
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
