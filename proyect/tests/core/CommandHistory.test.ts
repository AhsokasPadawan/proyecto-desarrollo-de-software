import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board/Board';
import { Position } from '../../src/core/board/Position';
import { Pawn } from '../../src/core/pieces/Pawn';
import { Rook } from '../../src/core/pieces/Rook';
import { CommandHistory } from '../../src/core/game/CommandHistory';
import { MoveCommand } from '../../src/core/game/MoveCommand';

describe('MoveCommand & CommandHistory', () => {
  it('reports false for both canUndo and canRedo before executing any command', () => {
    const history = new CommandHistory();

    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });

  it('moves piece from source to target and records captured piece when target is occupied', () => {
    const board = new Board(8, 8);
    const whiteRook = new Rook('WHITE');
    const blackPawn = new Pawn('BLACK');
    const origin = new Position(0, 0);
    const target = new Position(0, 4);
    board.placePiece(origin, whiteRook);
    board.placePiece(target, blackPawn);
    const command = new MoveCommand(board, origin, target);

    command.execute();

    expect(board.getPieceAt(origin)).toBeNull();
    expect(board.getPieceAt(target)).toBe(whiteRook);
    expect(command.getCapturedPiece()).toBe(blackPawn);
  });

  it('restores moved piece and captured piece to their original positions upon undo', () => {
    const board = new Board(8, 8);
    const whiteRook = new Rook('WHITE');
    const blackPawn = new Pawn('BLACK');
    const origin = new Position(0, 0);
    const target = new Position(0, 4);
    board.placePiece(origin, whiteRook);
    board.placePiece(target, blackPawn);
    const command = new MoveCommand(board, origin, target);
    command.execute();

    command.undo();

    expect(board.getPieceAt(origin)).toBe(whiteRook);
    expect(board.getPieceAt(target)).toBe(blackPawn);
  });

  it('restores empty target square upon undo when move involved no capture', () => {
    const board = new Board(8, 8);
    const whiteRook = new Rook('WHITE');
    const origin = new Position(0, 0);
    const target = new Position(0, 4);
    board.placePiece(origin, whiteRook);
    const command = new MoveCommand(board, origin, target);
    command.execute();

    command.undo();

    expect(board.getPieceAt(origin)).toBe(whiteRook);
    expect(board.getPieceAt(target)).toBeNull();
    expect(command.getCapturedPiece()).toBeNull();
  });

  it('executes and pushes commands onto history updating undo availability', () => {
    const board = new Board(8, 8);
    const history = new CommandHistory();
    const rook = new Rook('WHITE');
    const origin = new Position(0, 0);
    const target = new Position(0, 4);
    board.placePiece(origin, rook);
    const command = new MoveCommand(board, origin, target);

    history.executeCommand(command);

    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
    expect(board.getPieceAt(target)).toBe(rook);
  });

  it('undoes command and enables redo availability', () => {
    const board = new Board(8, 8);
    const history = new CommandHistory();
    const rook = new Rook('WHITE');
    const origin = new Position(0, 0);
    const target = new Position(0, 4);
    board.placePiece(origin, rook);
    const command = new MoveCommand(board, origin, target);
    history.executeCommand(command);

    const undone = history.undo();

    expect(undone).toBe(true);
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);
    expect(board.getPieceAt(origin)).toBe(rook);
  });

  it('redoes previously undone command moving piece back to target', () => {
    const board = new Board(8, 8);
    const history = new CommandHistory();
    const rook = new Rook('WHITE');
    const origin = new Position(0, 0);
    const target = new Position(0, 4);
    board.placePiece(origin, rook);
    const command = new MoveCommand(board, origin, target);
    history.executeCommand(command);
    history.undo();

    const redone = history.redo();

    expect(redone).toBe(true);
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
    expect(board.getPieceAt(target)).toBe(rook);
  });

  it('clears redo stack when executing a new command after undoing', () => {
    const board = new Board(8, 8);
    const history = new CommandHistory();
    const rook = new Rook('WHITE');
    const origin = new Position(0, 0);
    const firstTarget = new Position(0, 4);
    const secondTarget = new Position(4, 0);
    board.placePiece(origin, rook);
    const firstCommand = new MoveCommand(board, origin, firstTarget);
    history.executeCommand(firstCommand);
    history.undo();

    const secondCommand = new MoveCommand(board, origin, secondTarget);
    history.executeCommand(secondCommand);

    expect(history.canRedo).toBe(false);
    expect(history.canUndo).toBe(true);
    expect(board.getPieceAt(secondTarget)).toBe(rook);
  });

  it('returns false safely when attempting undo on empty history', () => {
    const history = new CommandHistory();

    const undone = history.undo();

    expect(undone).toBe(false);
  });

  it('returns false safely when attempting redo on empty redo stack', () => {
    const history = new CommandHistory();

    const redone = history.redo();

    expect(redone).toBe(false);
  });
});
