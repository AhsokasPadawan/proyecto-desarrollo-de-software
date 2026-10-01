import { Position } from '../board/Position';
import { PieceType } from '../pieces/types';
import { GameSnapshot } from './GameSnapshot';
import { IGameObserver, UnsubscribeFn } from './IGameObserver';
import { MoveResult } from './MoveResult';

export interface IGameEngine {
  getSnapshot(): GameSnapshot;
  getLegalMoves(from: Position): Position[];
  makeMove(from: Position, to: Position, promotionPiece?: PieceType): MoveResult;
  undo(): boolean;
  redo(): boolean;
  subscribe(observer: IGameObserver): UnsubscribeFn;
  unsubscribe(observer: IGameObserver): void;
}
