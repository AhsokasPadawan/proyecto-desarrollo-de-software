export type MoveQuality = 'BEST' | 'EXCELLENT' | 'GOOD' | 'INACCURACY' | 'MISTAKE' | 'BLUNDER';

export interface MoveQualityDetails {
  readonly quality: MoveQuality;
  readonly label: string;
  readonly badgeClass: string;
  readonly symbol: string;
}

export const MOVE_QUALITY_LOOKUP: Record<MoveQuality, MoveQualityDetails> = {
  BEST: {
    quality: 'BEST',
    label: 'Mejor jugada',
    badgeClass: 'bg-emerald-600 text-white font-bold',
    symbol: '★',
  },
  EXCELLENT: {
    quality: 'EXCELLENT',
    label: 'Excelente',
    badgeClass: 'bg-teal-600 text-white font-bold',
    symbol: '✓',
  },
  GOOD: {
    quality: 'GOOD',
    label: 'Buena',
    badgeClass: 'bg-sky-600 text-white font-medium',
    symbol: '•',
  },
  INACCURACY: {
    quality: 'INACCURACY',
    label: 'Imprecisión',
    badgeClass: 'bg-amber-500 text-white font-bold',
    symbol: '?!',
  },
  MISTAKE: {
    quality: 'MISTAKE',
    label: 'Error',
    badgeClass: 'bg-orange-600 text-white font-bold',
    symbol: '?',
  },
  BLUNDER: {
    quality: 'BLUNDER',
    label: 'Blunder',
    badgeClass: 'bg-red-600 text-white font-bold animate-pulse',
    symbol: '??',
  },
};

const QUALITY_THRESHOLDS: ReadonlyArray<{
  readonly maxLoss: number;
  readonly details: MoveQualityDetails;
}> = [
  { maxLoss: 0.2, details: MOVE_QUALITY_LOOKUP.EXCELLENT },
  { maxLoss: 0.6, details: MOVE_QUALITY_LOOKUP.GOOD },
  { maxLoss: 1.3, details: MOVE_QUALITY_LOOKUP.INACCURACY },
  { maxLoss: 2.5, details: MOVE_QUALITY_LOOKUP.MISTAKE },
];

export function classifyMoveQuality(evalLoss: number, wasBestMove: boolean): MoveQualityDetails {
  if (wasBestMove) {
    return MOVE_QUALITY_LOOKUP.BEST;
  }

  const normalizedLoss = Math.max(0, evalLoss);
  const matchedThreshold = QUALITY_THRESHOLDS.find(
    (threshold) => normalizedLoss <= threshold.maxLoss
  );

  return matchedThreshold ? matchedThreshold.details : MOVE_QUALITY_LOOKUP.BLUNDER;
}
