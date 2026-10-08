import { IAiStrategy } from '../../core/strategy/IAiStrategy';
import { RandomAiStrategy } from '../../core/strategy/RandomAiStrategy';
import { GreedyMaterialAiStrategy } from '../../core/strategy/GreedyMaterialAiStrategy';

export type GameMode = 'HUMAN_VS_HUMAN' | 'HUMAN_VS_RANDOM_AI' | 'HUMAN_VS_GREEDY_AI';

export interface GameModeConfig {
  readonly id: GameMode;
  readonly label: string;
  readonly strategyFactory?: () => IAiStrategy;
}

export const GAME_MODES: readonly GameModeConfig[] = [
  {
    id: 'HUMAN_VS_HUMAN',
    label: 'Humano vs Humano',
  },
  {
    id: 'HUMAN_VS_RANDOM_AI',
    label: 'Humano vs IA (Aleatoria)',
    strategyFactory: () => new RandomAiStrategy(),
  },
  {
    id: 'HUMAN_VS_GREEDY_AI',
    label: 'Humano vs IA (Heurística Material)',
    strategyFactory: () => new GreedyMaterialAiStrategy(),
  },
];
