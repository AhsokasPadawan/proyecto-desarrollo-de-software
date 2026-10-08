import { Color } from '../../../core/pieces/types';
export { formatClockTime } from './formatClockTime';

export type ClockStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'TIMEOUT';

export interface ChessClockControllerOptions {
  readonly onTimeout: (timedOutColor: Color) => void;
  readonly onTick?: () => void;
}

export class ChessClockController {
  private whiteSeconds = 600;
  private blackSeconds = 600;
  private initialWhiteSeconds = 600;
  private initialBlackSeconds = 600;
  private status: ClockStatus = 'IDLE';
  private activeColor: Color = 'WHITE';
  private timerIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly options: ChessClockControllerOptions) {}

  getWhiteSeconds(): number { return this.whiteSeconds; }
  getBlackSeconds(): number { return this.blackSeconds; }
  getStatus(): ClockStatus { return this.status; }
  getActiveColor(): Color { return this.activeColor; }

  isLowTime(color: Color): boolean {
    const seconds = color === 'WHITE' ? this.whiteSeconds : this.blackSeconds;
    return this.status !== 'IDLE' && seconds < 30;
  }

  setPlayerMinutes(color: Color, minutes: number): void {
    if (this.status !== 'IDLE') return;
    const totalSeconds = Math.max(1, Math.min(60, Math.floor(minutes))) * 60;
    if (color === 'WHITE') {
      this.initialWhiteSeconds = totalSeconds;
      this.whiteSeconds = totalSeconds;
    } else {
      this.initialBlackSeconds = totalSeconds;
      this.blackSeconds = totalSeconds;
    }
  }

  setTimeConfig(whiteMinutes: number, blackMinutes: number): void {
    this.setPlayerMinutes('WHITE', whiteMinutes);
    this.setPlayerMinutes('BLACK', blackMinutes);
  }

  start(initialTurn: Color = 'WHITE'): void {
    this.activeColor = initialTurn;
    this.status = 'RUNNING';
    this.startInterval();
  }

  pause(): void {
    if (this.status !== 'RUNNING') return;
    this.stopInterval();
    this.status = 'PAUSED';
  }

  resume(): void {
    if (this.status !== 'PAUSED') return;
    this.status = 'RUNNING';
    this.startInterval();
  }

  switchTurn(newTurn: Color): void {
    this.activeColor = newTurn;
    if (this.status === 'RUNNING') this.startInterval();
  }

  stop(): void {
    this.stopInterval();
    this.status = 'TIMEOUT';
  }

  reset(): void {
    this.stopInterval();
    this.status = 'IDLE';
    this.activeColor = 'WHITE';
    this.whiteSeconds = this.initialWhiteSeconds;
    this.blackSeconds = this.initialBlackSeconds;
  }

  private startInterval(): void {
    this.stopInterval();
    this.timerIntervalId = setInterval(() => this.tick(), 1000);
  }

  private stopInterval(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private tick(): void {
    if (this.status !== 'RUNNING') return;
    const isWhite = this.activeColor === 'WHITE';
    const remaining = isWhite ? --this.whiteSeconds : --this.blackSeconds;
    if (remaining <= 0) {
      if (isWhite) this.whiteSeconds = 0;
      else this.blackSeconds = 0;
      this.stop();
      this.options.onTimeout(this.activeColor);
    }
    this.options.onTick?.();
  }
}
