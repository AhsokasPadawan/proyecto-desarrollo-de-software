import { Color, PieceType } from '../../core/pieces/types';
import { IAiStrategy } from '../../core/strategy/IAiStrategy';
import { GreedyMaterialAiStrategy } from '../../core/strategy/GreedyMaterialAiStrategy';
import { AmateurAiStrategy } from '../../core/strategy/AmateurAiStrategy';
import { AMATEUR_LEVEL_CONFIG, PRO_AI_CONFIG } from '../../core/strategy/AmateurAiConfig';

export type GameMode =
  | 'HUMAN_VS_HUMAN'
  | 'HUMAN_VS_GREEDY_AI'
  | 'HUMAN_VS_AMATEUR_AI'
  | 'HUMAN_VS_PRO_AI';

export type ActivityMode =
  | 'CLASSIC_MATCH'
  | 'STUDY_EDITOR'
  | 'MATE_PUZZLES'
  | 'ANNOTATED_MATCHES';

export interface ActivityModeConfig {
  readonly id: ActivityMode;
  readonly label: string;
  readonly icon: string;
}

export const ACTIVITY_MODES: readonly ActivityModeConfig[] = [
  { id: 'CLASSIC_MATCH', label: 'Partida Clásica', icon: '♟' },
  { id: 'STUDY_EDITOR', label: 'Estudio / Libro', icon: '📖' },
  { id: 'MATE_PUZZLES', label: 'Mate en X', icon: '🧩' },
  { id: 'ANNOTATED_MATCHES', label: 'Partidas Guardadas', icon: '🎬' },
];

export type EditorPaletteTool =
  | { readonly kind: 'PIECE'; readonly color: Color; readonly type: PieceType }
  | { readonly kind: 'ERASE' };

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
