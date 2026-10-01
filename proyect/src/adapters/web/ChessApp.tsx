import { useCallback, useState, useSyncExternalStore } from 'react';
import { Position } from '../../core/board/Position';
import { ChessGame } from '../../core/game/ChessGame';
import { PieceType } from '../../core/pieces/types';
import { IGameEngine } from '../../core/ports/IGameEngine';
import { MoveResult } from '../../core/ports/MoveResult';
import { ChessBoardView } from './ChessBoardView';
import { ControlPanelView } from './ControlPanelView';
import { PromotionModal } from './PromotionModal';
import { AppHeader } from './components/AppHeader';
import { getRejectionMessage } from './rejectionMessages';
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
    [clearSelection, engine, legalMoves, processMoveOutcome, selectedPosition, snapshot, updateSelection]
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

  const handleReset = useCallback(() => {
    setEngine(engineFactory());
    clearSelection();
    setFeedbackMessage(null);
    setPendingPromotion(null);
  }, [clearSelection, engineFactory]);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 md:p-8">
      <AppHeader />

      <main className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        <ChessBoardView
          snapshot={snapshot}
          selectedPosition={selectedPosition}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
        />

        <ControlPanelView
          snapshot={snapshot}
          currentGameMode={gameMode}
          feedbackMessage={feedbackMessage}
          onModeChange={handleModeChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
        />
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
