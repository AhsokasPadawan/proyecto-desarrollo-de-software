import { IAiStrategy } from '../../core/strategy/IAiStrategy';
import { GreedyMaterialAiStrategy } from '../../core/strategy/GreedyMaterialAiStrategy';
import { AmateurAiStrategy } from '../../core/strategy/AmateurAiStrategy';
import { AMATEUR_LEVEL_CONFIG, PRO_AI_CONFIG } from '../../core/strategy/AmateurAiConfig';

export type GameMode =
  | 'HUMAN_VS_HUMAN'
  | 'HUMAN_VS_GREEDY_AI'
  | 'HUMAN_VS_AMATEUR_AI'
  | 'HUMAN_VS_PRO_AI';

export interface GameModeConfig {
  readonly id: GameMode;
  readonly label: string;
  readonly strategyFactory?: () => IAiStrategy;
  readonly delayMs?: number;
}

export const GAME_MODES: readonly GameModeConfig[] = [
  {
    id: 'HUMAN_VS_HUMAN',
    label: 'Humano vs Humano',
  },
  {
    id: 'HUMAN_VS_GREEDY_AI',
    label: 'Humano vs IA (Principiante)',
    strategyFactory: () => new GreedyMaterialAiStrategy(),
  },
  {
    id: 'HUMAN_VS_AMATEUR_AI',
    label: 'Humano vs IA (Amateur)',
    strategyFactory: () => new AmateurAiStrategy(AMATEUR_LEVEL_CONFIG),
    delayMs: 400,
  },
  {
    id: 'HUMAN_VS_PRO_AI',
    label: 'Humano vs IA (Pro)',
    strategyFactory: () => new AmateurAiStrategy(PRO_AI_CONFIG),
    delayMs: 400,
  },
];
