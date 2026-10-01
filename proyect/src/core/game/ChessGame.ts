import { Board } from '../board/Board';
import { BoardSetupFactory } from '../board/BoardSetupFactory';
import { Position } from '../board/Position';
import { Color, OPPOSITE_COLOR, PieceType } from '../pieces/types';
import { GameSnapshot, PieceSnapshot } from '../ports/GameSnapshot';
import { IGameEngine } from '../ports/IGameEngine';
import { IGameObserver, UnsubscribeFn } from '../ports/IGameObserver';
import { MoveResult } from '../ports/MoveResult';
import { CheckDetector } from '../rules/CheckDetector';
import { CheckState } from './CheckState';
import { CommandHistory } from './CommandHistory';
import { IGameState } from './IGameState';
import { InsufficientMaterialEvaluator } from './InsufficientMaterialEvaluator';
import { MoveCommand } from './MoveCommand';
import { NormalPlayState } from './NormalPlayState';
import { PositionHasher } from './PositionHasher';

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
  private cachedSnapshot: GameSnapshot | null = null;

  constructor(
    board: Board = BoardSetupFactory.createStandardBoard(),
    initialTurn: Color = 'WHITE',
    history: CommandHistory = new CommandHistory(),
    checkDetector: CheckDetector = new CheckDetector()
  ) {
    this.board = board;
    this.currentTurn = initialTurn;
    this.history = history;
    this.checkDetector = checkDetector;
    this.observers = new Set<IGameObserver>();

    const inCheck = this.checkDetector.isKingInCheck(this.board, this.currentTurn);
    this.currentState = inCheck ? new CheckState() : new NormalPlayState();

    this.currentPositionSignature = PositionHasher.computeSignature(this.board, this.currentTurn);
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
      stateKind: this.currentState.kind,
      winner: this.currentState.getWinner(this.currentTurn),
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
    });

    return this.cachedSnapshot;
  }

  getLegalMoves(position: Position): Position[] {
    const piece = this.board.getPieceAt(position);
    if (!piece || piece.color !== this.currentTurn) {
      return [];
    }

    const pseudoLegalMoves = piece.getPseudoLegalMoves(position, this.board);
    const strictlyLegalMoves: Position[] = [];

    for (const target of pseudoLegalMoves) {
      const simulation = new MoveCommand(this.board, position, target);
      simulation.execute();

      let leavesKingInCheck = false;
      try {
        leavesKingInCheck = this.checkDetector.isKingInCheck(this.board, piece.color);
      } finally {
        simulation.undo();
      }

      if (!leavesKingInCheck) {
        strictlyLegalMoves.push(target);
      }
    }

    return strictlyLegalMoves;
  }

  makeMove(from: Position, to: Position, promotionPiece?: PieceType): MoveResult {
    if (!this.currentState.canAcceptMoves()) {
      return { success: false, reason: 'GAME_OVER' };
    }

    const piece = this.board.getPieceAt(from);
    if (!piece) {
      return { success: false, reason: 'EMPTY_ORIGIN' };
    }

    if (piece.color !== this.currentTurn) {
      return { success: false, reason: 'WRONG_TURN' };
    }

    const pseudoLegalMoves = piece.getPseudoLegalMoves(from, this.board);
    const isPseudoLegal = pseudoLegalMoves.some((candidate) => candidate.equals(to));
    if (!isPseudoLegal) {
      return { success: false, reason: 'ILLEGAL_MOVE' };
    }

    const simulation = new MoveCommand(this.board, from, to, promotionPiece);
    simulation.execute();

    let leavesKingInCheck = false;
    try {
      leavesKingInCheck = this.checkDetector.isKingInCheck(this.board, piece.color);
    } finally {
      simulation.undo();
    }

    if (leavesKingInCheck) {
      return { success: false, reason: 'KING_LEFT_IN_CHECK' };
    }

    const command = new MoveCommand(this.board, from, to, promotionPiece);
    this.history.executeCommand(command);

    this.turnHistory.push({
      state: this.currentState,
      halfMoveClock: this.halfMoveClock,
      positionSignature: this.currentPositionSignature,
    });
    this.redoHistory.length = 0;

    const isPawnMove = piece.type === 'PAWN';
    const isCapture = command.getCapturedPiece() !== null;
    if (isPawnMove || isCapture) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock += 1;
    }

    this.currentTurn = OPPOSITE_COLOR[this.currentTurn];

    const currentSignature = PositionHasher.computeSignature(this.board, this.currentTurn);
    this.currentPositionSignature = currentSignature;
    this.incrementPositionCount(currentSignature);

    const isKingInCheck = this.checkDetector.isKingInCheck(this.board, this.currentTurn);
    const hasLegalMoves = this.hasAnyLegalMove(this.currentTurn);
    const isFiftyMoveRuleReached = this.halfMoveClock >= 100;
    const isInsufficientMaterial = InsufficientMaterialEvaluator.isInsufficient(this.board);
    const isThreefoldRepetition = (this.positionCounts.get(currentSignature) ?? 0) >= 3;

    this.currentState = this.currentState.evaluateNextState({
      isKingInCheck,
      hasLegalMoves,
      isFiftyMoveRuleReached,
      isInsufficientMaterial,
      isThreefoldRepetition,
    });

    this.notifyObservers();

    return {
      success: true,
      capturedPiece: command.getCapturedPiece(),
      nextState: this.currentState.kind,
    };
  }

  undo(): boolean {
    const undone = this.history.undo();
    if (!undone) {
      return false;
    }

    const previousTurn = this.turnHistory.pop();
    if (previousTurn) {
      this.decrementPositionCount(this.currentPositionSignature);
      this.redoHistory.push({
        state: this.currentState,
        halfMoveClock: this.halfMoveClock,
        positionSignature: this.currentPositionSignature,
      });

      this.currentState = previousTurn.state;
      this.halfMoveClock = previousTurn.halfMoveClock;
      this.currentPositionSignature = previousTurn.positionSignature;
    }

    this.currentTurn = OPPOSITE_COLOR[this.currentTurn];
    this.notifyObservers();
    return true;
  }

  redo(): boolean {
    const redone = this.history.redo();
    if (!redone) {
      return false;
    }

    const nextTurn = this.redoHistory.pop();
    if (nextTurn) {
      this.turnHistory.push({
        state: this.currentState,
        halfMoveClock: this.halfMoveClock,
        positionSignature: this.currentPositionSignature,
      });

      this.incrementPositionCount(nextTurn.positionSignature);
      this.currentState = nextTurn.state;
      this.halfMoveClock = nextTurn.halfMoveClock;
      this.currentPositionSignature = nextTurn.positionSignature;
    }

    this.currentTurn = OPPOSITE_COLOR[this.currentTurn];
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

  private hasAnyLegalMove(color: Color): boolean {
    const placements = this.board.getPiecesByColor(color);
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
