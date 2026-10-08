export class Position {
  readonly row: number;
  readonly col: number;

  constructor(row: number, col: number) {
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      throw new Error(`Coordinates must be integers. Received row=${row}, col=${col}`);
    }

    this.row = row;
    this.col = col;
  }

  offset(deltaRow: number, deltaCol: number): Position {
    return new Position(this.row + deltaRow, this.col + deltaCol);
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  toAlgebraic(): string {
    const columnLetter = String.fromCharCode(97 + this.col);
    const rowNumber = this.row + 1;
    return `${columnLetter}${rowNumber}`;
  }

  static fromAlgebraic(algebraic: string): Position {
    const match = /^[a-z]([1-9]\d*)$/i.exec(algebraic);
    if (!match) {
      throw new Error(`Invalid algebraic notation: "${algebraic}"`);
    }

    const columnLetter = algebraic[0].toLowerCase();
    const col = columnLetter.charCodeAt(0) - 97;
    const row = parseInt(match[1], 10) - 1;

    return new Position(row, col);
  }
}
