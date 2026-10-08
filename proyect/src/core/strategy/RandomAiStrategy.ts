import { IGameEngine } from '../ports/IGameEngine';
import { AiMove, collectCandidateMoves, IAiStrategy } from './IAiStrategy';

export type RandomGenerator = () => number;

export class RandomAiStrategy implements IAiStrategy {
  private readonly rng: RandomGenerator;

  constructor(rng: RandomGenerator = Math.random) {
    this.rng = rng;
  }

  chooseMove(engine: IGameEngine): AiMove | null {
    const candidateMoves = collectCandidateMoves(engine);

    if (candidateMoves.length === 0) {
      return null;
    }

    const selectedIndex = Math.floor(this.rng() * candidateMoves.length);
    return candidateMoves[selectedIndex];
  }
}
