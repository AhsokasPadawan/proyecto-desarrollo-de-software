import { Position } from '../board/Position';
import { IBoardQuery } from '../ports/IBoardQuery';
import { IMovementRule } from '../rules/IMovementRule';
import { IPiece } from './IPiece';
import { Color, PieceType } from './types';

export abstract class Piece implements IPiece {
  readonly color: Color;
  readonly type: PieceType;
  protected readonly rules: readonly IMovementRule[];
  private moved: boolean = false;

  constructor(color: Color, type: PieceType, rules: readonly IMovementRule[] = []) {
    this.color = color;
    this.type = type;
    this.rules = rules;
  }

  get hasMoved(): boolean {
    return this.moved;
  }

  setHasMoved(value: boolean): void {
    this.moved = value;
  }

  getPseudoLegalMoves(from: Position, board: IBoardQuery): Position[] {
    const uniquePositions = new Map<string, Position>();

    for (const rule of this.rules) {
      const candidatePositions = rule.getPseudoLegalMoves(from, this, board);
      for (const candidate of candidatePositions) {
        const coordinateKey = `${candidate.row},${candidate.col}`;
        if (!uniquePositions.has(coordinateKey)) {
          uniquePositions.set(coordinateKey, candidate);
        }
      }
    }

    return Array.from(uniquePositions.values());
  }
}
