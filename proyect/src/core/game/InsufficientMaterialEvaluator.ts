import { IBoardQuery, PiecePlacement } from '../ports/IBoardQuery';

export function isInsufficientMaterial(board: IBoardQuery): boolean {
  const whitePlacements = board.getPiecesByColor('WHITE');
  const blackPlacements = board.getPiecesByColor('BLACK');

  const whiteHasOnlyKing = hasOnlyKing(whitePlacements);
  const blackHasOnlyKing = hasOnlyKing(blackPlacements);

  if (whiteHasOnlyKing && blackHasOnlyKing) {
    return true;
  }

  return (
    hasOnlyKingAndSingleMinor(whitePlacements, blackPlacements) ||
    hasOnlyKingAndSingleMinor(blackPlacements, whitePlacements)
  );
}

function hasOnlyKing(placements: readonly PiecePlacement[]): boolean {
  return placements.length === 1 && placements[0].piece.type === 'KING';
}

function hasOnlyKingAndSingleMinor(
  candidatePlacements: readonly PiecePlacement[],
  opponentPlacements: readonly PiecePlacement[]
): boolean {
  if (!hasOnlyKing(opponentPlacements)) {
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
