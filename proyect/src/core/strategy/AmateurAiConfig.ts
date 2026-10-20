export type RandomGenerator = () => number;

export interface AmateurAiConfig {
  readonly searchDepth: number;
  readonly pieceValues: Record<string, number>;
  readonly centerControlScore: number;
  readonly openingDevelopmentScore: number;
  readonly earlyQueenPenalty: number;
  readonly castlingBonus: number;
  readonly kingMovedWithoutCastlingPenalty: number;
  readonly checkBonus: number;
  readonly candidateScoreTolerance: number;
  readonly blunderRate: number;
  readonly thinkingDelayMs: number;
  readonly doubledPawnPenalty: number;
  readonly preferOtherPiecesBonus: number;
  readonly enPassantBonus: number;
  readonly retreatAfterAdvancePenalty: number;
}

export const DEFAULT_AMATEUR_CONFIG: AmateurAiConfig = {
  searchDepth: 3,
  pieceValues: {
    PAWN: 100,
    KNIGHT: 300,
    BISHOP: 300,
    ROOK: 500,
    QUEEN: 900,
    KING: 20000,
    CHANCELLOR: 800,
  },
  centerControlScore: 25,
  openingDevelopmentScore: 50,
  earlyQueenPenalty: 30,
  castlingBonus: 60,
  kingMovedWithoutCastlingPenalty: 50,
  checkBonus: 10,
  candidateScoreTolerance: 20,
  blunderRate: 0.10,
  thinkingDelayMs: 400,
  doubledPawnPenalty: 20,
  preferOtherPiecesBonus: 10,
  enPassantBonus: 15,
  retreatAfterAdvancePenalty: 25,
};
