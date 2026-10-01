import { GameStateKind } from '../../core/ports/MoveResult';

export const STATE_LABELS: Record<GameStateKind, string> = {
  IN_PROGRESS: 'Partida en Curso',
  CHECK: '¡Jaque al Rey!',
  CHECKMATE: '¡Jaque Mate! Partida Finalizada',
  STALEMATE: 'Tablas por Ahogado',
  DRAW: 'Tablas Declaradas',
};

export const STATE_BADGE_CLASSES: Record<GameStateKind, string> = {
  IN_PROGRESS: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
  CHECK: 'bg-amber-950/90 text-amber-300 border-amber-500 animate-pulse font-semibold',
  CHECKMATE: 'bg-red-950/90 text-red-200 border-red-500 font-bold shadow-lg shadow-red-950/50',
  STALEMATE: 'bg-blue-950/90 text-blue-200 border-blue-500 font-semibold',
  DRAW: 'bg-zinc-900 text-zinc-300 border-zinc-600 font-semibold',
};

export function getStateLabel(stateKind: GameStateKind): string {
  return STATE_LABELS[stateKind] ?? stateKind;
}

export function getStateBadgeClass(stateKind: GameStateKind): string {
  return STATE_BADGE_CLASSES[stateKind] ?? 'bg-zinc-800 text-zinc-200 border-zinc-700';
}

export function isTerminalState(stateKind: GameStateKind): boolean {
  return stateKind === 'CHECKMATE' || stateKind === 'STALEMATE' || stateKind === 'DRAW';
}

