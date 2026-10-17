# Mapa de Archivos del Proyecto

Índice central de archivos del proyecto agrupados por capa y sub-paquete, utilizado como referencia base en las discusiones y explicaciones de [`docs/teachings/`](./).

---

## Capa de Dominio (`proyect/src/core/`)

* **`ports/`** — [Ver explicación detallada](./01-core-ports.md)
  * `GameSnapshot.ts`
  * `IBoardQuery.ts`
  * `IGameEngine.ts`
  * `IGameObserver.ts`
  * `MoveResult.ts`
* **`board/`** — [Ver explicación detallada](./02-core-board.md)
  * `Position.ts`
  * `Board.ts`
  * `boardSetup.ts`
  * `FenSerializer.ts`
* **`pieces/`** — [Ver explicación detallada](./03-core-pieces.md)
  * `types.ts`
  * `IPiece.ts`
  * `Piece.ts`
  * `Pawn.ts`
  * `Rook.ts`
  * `Knight.ts`
  * `Bishop.ts`
  * `Queen.ts`
  * `King.ts`
  * `pieceFactory.ts`
* **`rules/`** — [Ver explicación detallada](./04-core-rules.md)
  * `IMovementRule.ts`
  * `SlidingMoveRule.ts`
  * `LeapMoveRule.ts`
  * `PawnForwardRule.ts`
  * `PawnCaptureRule.ts`
  * `EnPassantCaptureRule.ts`
  * `CastlingMoveRule.ts`
  * `CheckDetector.ts`
  * `legalMoveEvaluator.ts`
* **`game/`** — [Ver explicación detallada](./05-core-game.md)
  * `ICommand.ts`
  * `MoveCommand.ts`
  * `CommandHistory.ts`
  * `IGameState.ts`
  * `activeStateTransition.ts`
  * `NormalPlayState.ts`
  * `CheckState.ts`
  * `CheckmateState.ts`
  * `StalemateState.ts`
  * `DrawState.ts`
  * `TimeoutState.ts`
  * `InsufficientMaterialEvaluator.ts`
  * `PositionHasher.ts`
  * `ChessGame.ts`
* **`strategy/`** — [Ver explicación detallada](./06-core-strategy.md)
  * `IAiStrategy.ts`
  * `RandomAiStrategy.ts`
  * `GreedyMaterialAiStrategy.ts`

---

## Capa de Adaptadores (`proyect/src/adapters/`)

* **`services/`** (Servicios de análisis, API y Gemini AI Coach)
  * `IChessEngine.ts`
  * `IAiCoachEngine.ts`
  * `IAnalysisService.ts`
  * `ChessApiService.ts`
  * `GeminiCoachService.ts`
  * `AnalysisService.ts`
* **`web/clock/`** (Reloj de ajedrez y hook reactivo)
  * `ChessClockController.ts`
  * `formatClockTime.ts`
  * `useChessClockTypes.ts`
  * `useChessClock.ts`
* **`web/`** (Helpers, DTOs y Presentadores Web)
  * `types.ts`
  * `rejectionMessages.ts`
  * `stateDisplayLookup.ts`
  * `transcriptionFormatter.ts`
  * `moveQualityEvaluator.ts`
  * `pieceDisplay.tsx`
  * `index.css`
* **`web/components/` & Vistas** (Componentes de Presentación en React)
  * `ActionButton.tsx`
  * `ApiKeyModal.tsx`
  * `AppHeader.tsx`
  * `ChessSquare.tsx`
  * `ClockConfigSection.tsx`
  * `CoachFeedbackCard.tsx`
  * `ControlSection.tsx`
  * `FeedbackBanner.tsx`
  * `GameActionBar.tsx`
  * `GameLayout.tsx`
  * `ModalDialog.tsx`
  * `ModeSelectorButton.tsx`
  * `MoveHighlightLegend.tsx`
  * `MoveHistoryTable.tsx`
  * `PlayerClockBar.tsx`
  * `PlayerTimePicker.tsx`
  * `PromotionOptionButton.tsx`
  * `ReplayControlSection.tsx`
  * `PromotionModal.tsx`
  * `ChessBoardView.tsx`
  * `ControlPanelView.tsx`
  * `ChessApp.tsx`
  * `App.tsx`
  * `main.tsx`
