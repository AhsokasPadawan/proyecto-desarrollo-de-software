import { describe, expect, it } from 'vitest';
import seedLibraryData from '../../src/adapters/storage/chess-library.json';
import { MatePuzzleRecord } from '../../src/adapters/storage/IChessLibraryRepository';
import { MatePuzzleController } from '../../src/adapters/web/puzzles/MatePuzzleController';
import { Position } from '../../src/core/board/Position';

const MATE_IN_1_PUZZLE = seedLibraryData.matePuzzles[0] as unknown as MatePuzzleRecord;
const MATE_IN_2_BATTERY_PUZZLE = seedLibraryData.matePuzzles[1] as unknown as MatePuzzleRecord;
const MATE_IN_2_MORPHY_PUZZLE = seedLibraryData.matePuzzles[2] as unknown as MatePuzzleRecord;
const MATE_IN_3_TRIPLE_BATTERY_PUZZLE = seedLibraryData.matePuzzles[3] as unknown as MatePuzzleRecord;

describe('MatePuzzleController (Ticket 41)', () => {
  it('marks a Mate in 1 puzzle as SOLVED when player delivers checkmate on the first move', () => {
    const controller = new MatePuzzleController(MATE_IN_1_PUZZLE);

    expect(controller.getStatus()).toBe('IN_PROGRESS');
    expect(controller.getRemainingMoves()).toBe(1);

    const outcome = controller.makePlayerMove(
      Position.fromAlgebraic('h6'),
      Position.fromAlgebraic('g7')
    );

    expect(outcome.success).toBe(true);
    expect(controller.getStatus()).toBe('SOLVED');
    expect(controller.getRemainingMoves()).toBe(0);
    expect(controller.getEngine().getSnapshot().stateKind).toBe('CHECKMATE');
  });

  it('automatically plays opponent defensive response in Mate in 2 battery, Morphy Opera, and Mate in 3 puzzles', () => {
    const batteryController = new MatePuzzleController(MATE_IN_2_BATTERY_PUZZLE);

    const firstMove = batteryController.makePlayerMove(
      Position.fromAlgebraic('d2'),
      Position.fromAlgebraic('d8')
    );

    expect(firstMove.success).toBe(true);
    expect(batteryController.getStatus()).toBe('IN_PROGRESS');
    expect(batteryController.getRemainingMoves()).toBe(1);
    expect(batteryController.getEngine().getSnapshot().currentTurn).toBe('WHITE');

    const secondMove = batteryController.makePlayerMove(
      Position.fromAlgebraic('d1'),
      Position.fromAlgebraic('d8')
    );

    expect(secondMove.success).toBe(true);
    expect(batteryController.getStatus()).toBe('SOLVED');
    expect(batteryController.getRemainingMoves()).toBe(0);

    const morphyController = new MatePuzzleController(MATE_IN_2_MORPHY_PUZZLE);
    expect(
      morphyController.makePlayerMove(Position.fromAlgebraic('b3'), Position.fromAlgebraic('b8'))
        .success
    ).toBe(true);
    expect(morphyController.getStatus()).toBe('IN_PROGRESS');
    expect(
      morphyController.makePlayerMove(Position.fromAlgebraic('d1'), Position.fromAlgebraic('d8'))
        .success
    ).toBe(true);
    expect(morphyController.getStatus()).toBe('SOLVED');

    const mate3Controller = new MatePuzzleController(MATE_IN_3_TRIPLE_BATTERY_PUZZLE);
    expect(mate3Controller.getRemainingMoves()).toBe(3);
    expect(
      mate3Controller.makePlayerMove(Position.fromAlgebraic('e3'), Position.fromAlgebraic('e8'))
        .success
    ).toBe(true);
    expect(mate3Controller.getRemainingMoves()).toBe(2);
    expect(
      mate3Controller.makePlayerMove(Position.fromAlgebraic('e2'), Position.fromAlgebraic('e8'))
        .success
    ).toBe(true);
    expect(mate3Controller.getRemainingMoves()).toBe(1);
    expect(
      mate3Controller.makePlayerMove(Position.fromAlgebraic('e1'), Position.fromAlgebraic('e8'))
        .success
    ).toBe(true);
    expect(mate3Controller.getStatus()).toBe('SOLVED');
    expect(mate3Controller.getRemainingMoves()).toBe(0);
  });

  it('marks puzzle as FAILED when player exhausts maxMoves without achieving checkmate, and supports undoPlayerMove and resetPuzzle', () => {
    const controller = new MatePuzzleController(MATE_IN_1_PUZZLE);

    const wrongMove = controller.makePlayerMove(
      Position.fromAlgebraic('h6'),
      Position.fromAlgebraic('h5')
    );

    expect(wrongMove.success).toBe(true);
    expect(controller.getStatus()).toBe('FAILED');
    expect(controller.getRemainingMoves()).toBe(0);

    controller.undoPlayerMove();
    expect(controller.getStatus()).toBe('IN_PROGRESS');
    expect(controller.getRemainingMoves()).toBe(1);
    expect(controller.getEngine().getSnapshot().currentTurn).toBe('WHITE');

    controller.resetPuzzle();
    expect(controller.getStatus()).toBe('IN_PROGRESS');
    expect(controller.getRemainingMoves()).toBe(1);
  });
});
