import { GameSnapshot } from './GameSnapshot';

export interface IGameObserver {
  onGameStateChanged(snapshot: GameSnapshot): void;
}

export type UnsubscribeFn = () => void;
