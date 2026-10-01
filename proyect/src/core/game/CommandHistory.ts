import { ICommand } from './ICommand';

export class CommandHistory {
  private readonly undoStack: ICommand[] = [];
  private readonly redoStack: ICommand[] = [];

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  executeCommand(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack.length = 0;
  }

  undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) {
      return false;
    }

    command.undo();
    this.redoStack.push(command);
    return true;
  }

  redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) {
      return false;
    }

    command.execute();
    this.undoStack.push(command);
    return true;
  }
}
