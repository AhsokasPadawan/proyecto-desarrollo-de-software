import { Board } from '../board/Board';
import { PiecePlacement } from '../ports/IBoardQuery';

export class InsufficientMaterialEvaluator {
  static isInsufficient(board: Board): boolean {
    const whitePlacements = board.getPiecesByColor('WHITE');
    const blackPlacements = board.getPiecesByColor('BLACK');

    const whiteHasOnlyKing = this.hasOnlyKing(whitePlacements);
    const blackHasOnlyKing = this.hasOnlyKing(blackPlacements);

    if (whiteHasOnlyKing && blackHasOnlyKing) {
      return true;
    }

    return (
      this.hasOnlyKingAndSingleMinor(whitePlacements, blackPlacements) ||
      this.hasOnlyKingAndSingleMinor(blackPlacements, whitePlacements)
    );
  }

  private static hasOnlyKing(placements: readonly PiecePlacement[]): boolean {
    return placements.length === 1 && placements[0].piece.type === 'KING';
  }

  private static hasOnlyKingAndSingleMinor(
    candidatePlacements: readonly PiecePlacement[],
    opponentPlacements: readonly PiecePlacement[]
  ): boolean {
    if (!this.hasOnlyKing(opponentPlacements)) {
      return false;
    }

    if (candidatePlacements.length !== 2) {
      return false;
    }

    const kingPlacement = candidatePlacements.find(
      (placement) => placement.piece.type === 'KING'
    );
    if (!kingPlacement) {
      return false;
    }

    const nonKingPlacement = candidatePlacements.find(
      (placement) => placement.piece.type !== 'KING'
    );
    const pieceType = nonKingPlacement?.piece.type;
    return pieceType === 'BISHOP' || pieceType === 'KNIGHT';
  }
}
