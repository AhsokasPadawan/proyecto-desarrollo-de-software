import { createBoardFromPlacements, createStandardBoard } from '../../../core/board/boardSetup';
import { Position } from '../../../core/board/Position';
import { ChessGame } from '../../../core/game/ChessGame';
import { NormalPlayState } from '../../../core/game/NormalPlayState';
import { StudyPlayState } from '../../../core/game/StudyPlayState';
import { IGameEngine } from '../../../core/ports/IGameEngine';
import { SavedAnnotatedMatchRecord } from '../../storage/IChessLibraryRepository';

export function hydrateSavedAnnotatedMatch(record: SavedAnnotatedMatchRecord): IGameEngine {
  const hasCustomSetup = Boolean(record.initialPieces && record.initialPieces.length > 0);
  const board = hasCustomSetup
    ? createBoardFromPlacements(record.initialPieces!)
    : createStandardBoard();
  const initialState = hasCustomSetup ? new StudyPlayState() : new NormalPlayState();

  const game = new ChessGame(
    board,
    record.initialTurn ?? 'WHITE',
    undefined,
    undefined,
    initialState
  );

  for (const move of record.moves) {
    const fromPos = Position.fromAlgebraic(move.from);
    const toPos = Position.fromAlgebraic(move.to);
    game.makeMove(fromPos, toPos, move.promotionPiece);
  }

  return game;
}
