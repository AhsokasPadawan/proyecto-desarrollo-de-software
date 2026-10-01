import { Color, PieceType } from '../pieces/types';
import { GameStateKind } from './MoveResult';

export interface PieceSnapshot {
  readonly type: PieceType;
  readonly color: Color;
}

export interface GameSnapshot {
  readonly rows: number;
  readonly cols: number;
  readonly grid: readonly (readonly (PieceSnapshot | null)[])[];
  readonly currentTurn: Color;
  readonly stateKind: GameStateKind;
  readonly winner: Color | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}
