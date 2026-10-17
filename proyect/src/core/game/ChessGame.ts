import { Board } from '../board/Board';
import { createStandardBoard } from '../board/boardSetup';
import { Position } from '../board/Position';
import { IPiece } from '../pieces/IPiece';
import { Color, OPPOSITE_COLOR, PieceType } from '../pieces/types';
import { GameSnapshot, MoveRecord, PieceSnapshot } from '../ports/GameSnapshot';
import { IGameEngine } from '../ports/IGameEngine';
import { IGameObserver, UnsubscribeFn } from '../ports/IGameObserver';
import { MoveRejectionReason, MoveResult } from '../ports/MoveResult';
import { CheckDetector } from '../rules/CheckDetector';
import { CommandHistory } from './CommandHistory';
import { IGameState } from './IGameState';
import { isInsufficientMaterial } from './InsufficientMaterialEvaluator';
import { MoveCommand } from './MoveCommand';
import { NormalPlayState } from './NormalPlayState';
import { computePositionSignature } from './PositionHasher';
import { TimeoutState } from './TimeoutState';

interface TurnRecord {
  readonly state: IGameState;
  readonly halfMoveClock: number;
  readonly positionSignature: string;
}

export class ChessGame implements IGameEngine {
  private readonly board: Board;
  private currentTurn: Color;
  private readonly history: CommandHistory;
  private readonly checkDetector: CheckDetector;
  private readonly observers: Set<IGameObserver>;

  private currentState: IGameState;
  private halfMoveClock: number = 0;
  private currentPositionSignature: string;

  private readonly positionCounts: Map<string, number> = new Map();
  private readonly turnHistory: TurnRecord[] = [];
  private readonly redoHistory: TurnRecord[] = [];
  private readonly recordedMoves: MoveRecord[] = [];
  private appliedMoveCount: number = 0;
  private cachedSnapshot: GameSnapshot | null = null;

  constructor(
    board: Board = createStandardBoard(),
    initialTurn: Color = 'WHITE',
    history: CommandHistory = new CommandHistory(),
    checkDetector: CheckDetector = new CheckDetector()
  ) {
    this.board = board;
    this.currentTurn = initialTurn;
    this.history = history;
    this.checkDetector = checkDetector;
    this.observers = new Set<IGameObserver>();

    this.currentState = new NormalPlayState();

    this.currentPositionSignature = computePositionSignature(this.board, this.currentTurn);
    this.incrementPositionCount(this.currentPositionSignature);
  }

  getSnapshot(): GameSnapshot {
    if (this.cachedSnapshot) {
      return this.cachedSnapshot;
    }

    const grid: (readonly (PieceSnapshot | null)[])[] = [];

    for (let row = 0; row < this.board.rows; row++) {
      const rowCells: (PieceSnapshot | null)[] = [];
      for (let col = 0; col < this.board.cols; col++) {
        const piece = this.board.getPieceAt(new Position(row, col));
        if (piece) {
          rowCells.push(Object.freeze({ type: piece.type, color: piece.color }));
        } else {
          rowCells.push(null);
        }
      }
      grid.push(Object.freeze(rowCells));
    }

    this.cachedSnapshot = Object.freeze({
      rows: this.board.rows,
      cols: this.board.cols,
      grid: Object.freeze(grid),
      currentTurn: this.currentTurn,
      stateKind: this.currentState.type,
      winner: this.currentState.getWinner(this.currentTurn),
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
      moveHistory: Object.freeze([...this.recordedMoves]),
      currentMoveIndex: this.appliedMoveCount,
    });

    return this.cachedSnapshot;
  }

  getLegalMoves(position: Position): Position[] {
    const piece = this.board.getPieceAt(position);
    if (!piece || piece.color !== this.currentTurn) {
      return [];
    }

    return piece
      .getPseudoLegalMoves(position, this.board)
      .filter((target) => !this.wouldMoveExposeKingToCheck(piece, position, target));
  }

  makeMove(from: Position, to: Position, promotionPiece?: PieceType): MoveResult {
    const validation = this.validateMove(from, to, promotionPiece);
    if ('errorReason' in validation) {
      return { success: false, reason: validation.errorReason };
    }
    const { piece } = validation;

    const command = new MoveCommand(this.board, from, to, promotionPiece);
    this.history.executeCommand(command);

    this.recordMove(piece, from, to, command, promotionPiece);
    this.addSnapshotToTurnHistory();
    this.updateHalfMoveClock(piece.type, command.getCapturedPiece() !== null);
    this.switchTurn();

    const currentSignature = this.trackPositionRepetition();
    this.updateGameState(currentSignature);
    this.notifyObservers();

    return {
      success: true,
      capturedPiece: command.getCapturedPiece(),
      nextState: this.currentState.type,
    };
  }

  declareTimeout(timedOutColor: Color): GameSnapshot {
    if (!this.currentState.canAcceptMoves()) {
      return this.getSnapshot();
    }

    this.currentState = new TimeoutState(timedOutColor);
    this.notifyObservers();
    return this.getSnapshot();
  }

  undo(): boolean {
    const undone = this.history.undo();
    if (!undone) {
      return false;
    }

    this.appliedMoveCount = Math.max(0, this.appliedMoveCount - 1);

    const previousTurn = this.turnHistory.pop();
    if (previousTurn) {
      this.decrementPositionCount(this.currentPositionSignature);
      this.redoHistory.push(this.createCurrentTurnRecord());
      this.restoreTurnRecord(previousTurn);
    }

    this.switchTurn();
    this.notifyObservers();
    return true;
  }

  redo(): boolean {
    const redone = this.history.redo();
    if (!redone) {
      return false;
    }

    this.appliedMoveCount = Math.min(this.recordedMoves.length, this.appliedMoveCount + 1);

    const nextTurn = this.redoHistory.pop();
    if (nextTurn) {
      this.turnHistory.push(this.createCurrentTurnRecord());
      this.incrementPositionCount(nextTurn.positionSignature);
      this.restoreTurnRecord(nextTurn);
    }

    this.switchTurn();
    this.notifyObservers();
    return true;
  }

  subscribe(observer: IGameObserver): UnsubscribeFn {
    this.observers.add(observer);
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer: IGameObserver): void {
    this.observers.delete(observer);
  }

  private validateMove(
    from: Position,
    to: Position,
    promotionPiece?: PieceType
  ): { piece: IPiece } | { errorReason: MoveRejectionReason } {
    if (!this.currentState.canAcceptMoves()) {
      return { errorReason: 'GAME_OVER' };
    }

    const piece = this.board.getPieceAt(from);
    if (!piece) {
      return { errorReason: 'EMPTY_ORIGIN' };
    }

    if (piece.color !== this.currentTurn) {
      return { errorReason: 'WRONG_TURN' };
    }

    const pseudoLegalMoves = piece.getPseudoLegalMoves(from, this.board);
    const isPseudoLegal = pseudoLegalMoves.some((candidate) => candidate.equals(to));
    if (!isPseudoLegal) {
      return { errorReason: 'ILLEGAL_MOVE' };
    }

    if (this.wouldMoveExposeKingToCheck(piece, from, to, promotionPiece)) {
      return { errorReason: 'KING_LEFT_IN_CHECK' };
    }

    return { piece };
  }

  private recordMove(
    piece: IPiece,
    from: Position,
    to: Position,
    command: MoveCommand,
    promotionPiece?: PieceType
  ): void {
    const isCastling = piece.type === 'KING' && Math.abs(to.col - from.col) === 2;
    const isPromotion = piece.type === 'PAWN' && (to.row === this.board.rows - 1 || to.row === 0);

    const record: MoveRecord = Object.freeze({
      moveIndex: this.appliedMoveCount,
      turn: piece.color,
      piece: piece.type,
      from: from.toAlgebraic(),
      to: to.toAlgebraic(),
      capturedPiece: command.getCapturedPiece()?.type,
      isCastling,
      isPromotion,
      promotionPiece: isPromotion ? (promotionPiece ?? 'QUEEN') : undefined,
    });

    this.recordedMoves.length = this.appliedMoveCount;
    this.recordedMoves.push(record);
    this.appliedMoveCount += 1;
  }

  private addSnapshotToTurnHistory(): void {
    this.turnHistory.push(this.createCurrentTurnRecord());
    this.redoHistory.length = 0;
  }

  private createCurrentTurnRecord(): TurnRecord {
    return {
      state: this.currentState,
      halfMoveClock: this.halfMoveClock,
      positionSignature: this.currentPositionSignature,
    };
  }

  private restoreTurnRecord(record: TurnRecord): void {
    this.currentState = record.state;
    this.halfMoveClock = record.halfMoveClock;
    this.currentPositionSignature = record.positionSignature;
  }

  private updateHalfMoveClock(pieceType: PieceType, hasCaptured: boolean): void {
    if (pieceType === 'PAWN' || hasCaptured) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock += 1;
    }
  }

  private switchTurn(): void {
    this.currentTurn = OPPOSITE_COLOR[this.currentTurn];
  }

  private trackPositionRepetition(): string {
    const currentSignature = computePositionSignature(this.board, this.currentTurn);
    this.currentPositionSignature = currentSignature;
    this.incrementPositionCount(currentSignature);
    return currentSignature;
  }

  private updateGameState(currentSignature: string): void {
    const isKingInCheck = this.checkDetector.isKingInCheck(this.board, this.currentTurn);
    const hasLegalMoves = this.hasAnyLegalMove();
    const isFiftyMoveRuleReached = this.halfMoveClock >= 100;
    const isInsufficient = isInsufficientMaterial(this.board);
    const isThreefoldRepetition = (this.positionCounts.get(currentSignature) ?? 0) >= 3;

    this.currentState = this.currentState.evaluateNextState({
      isKingInCheck,
      hasLegalMoves,
      isFiftyMoveRuleReached,
      isInsufficientMaterial: isInsufficient,
      isThreefoldRepetition,
    });
  }

  private wouldMoveExposeKingToCheck(
    piece: IPiece,
    from: Position,
    to: Position,
    promotionPiece?: PieceType
  ): boolean {
    const isCastling = piece.type === 'KING' && Math.abs(to.col - from.col) === 2;
    if (isCastling && this.isCastlingOriginOrTransitAttacked(from, to, piece.color)) {
      return true;
    }

    const simulation = new MoveCommand(this.board, from, to, promotionPiece);
    simulation.execute();

    try {
      return this.checkDetector.isKingInCheck(this.board, piece.color);
    } finally {
      simulation.undo();
    }
  }

  private isCastlingOriginOrTransitAttacked(
    from: Position,
    to: Position,
    kingColor: Color
  ): boolean {
    const opponentColor = OPPOSITE_COLOR[kingColor];
    const direction = Math.sign(to.col - from.col);
    const transitSquare = from.offset(0, direction);

    return (
      this.checkDetector.isSquareAttacked(this.board, from, opponentColor) ||
      this.checkDetector.isSquareAttacked(this.board, transitSquare, opponentColor)
    );
  }

  private hasAnyLegalMove(): boolean {
    const placements = this.board.getPiecesByColor(this.currentTurn);
    for (const placement of placements) {
      const legalMoves = this.getLegalMoves(placement.position);
      if (legalMoves.length > 0) {
        return true;
      }
    }
    return false;
  }

  private incrementPositionCount(signature: string): void {
    const count = (this.positionCounts.get(signature) ?? 0) + 1;
    this.positionCounts.set(signature, count);
  }

  private decrementPositionCount(signature: string): void {
    const count = this.positionCounts.get(signature);
    if (!count || count <= 1) {
      this.positionCounts.delete(signature);
    } else {
      this.positionCounts.set(signature, count - 1);
    }
  }

  private notifyObservers(): void {
    this.cachedSnapshot = null;
    const snapshot = this.getSnapshot();
    for (const observer of this.observers) {
      observer.onGameStateChanged(snapshot);
    }
  }
}
