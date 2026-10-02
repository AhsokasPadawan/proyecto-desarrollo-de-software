import { Color } from '../../../core/pieces/types';

export type ClockStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'TIMEOUT';

export interface ChessClockControllerOptions {
  readonly onTimeout: (timedOutColor: Color) => void;
  readonly onTick?: () => void;
}

export function formatClockTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
}

export class ChessClockController {
  private whiteSeconds: number = 600;
  private blackSeconds: number = 600;
  private initialWhiteSeconds: number = 600;
  private initialBlackSeconds: number = 600;
  private status: ClockStatus = 'IDLE';
  private activeColor: Color = 'WHITE';
  private timerIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly options: ChessClockControllerOptions;

  constructor(options: ChessClockControllerOptions) {
    this.options = options;
  }

  getWhiteSeconds(): number {
    return this.whiteSeconds;
  }

  getBlackSeconds(): number {
    return this.blackSeconds;
  }

  getStatus(): ClockStatus {
    return this.status;
  }

  getActiveColor(): Color {
    return this.activeColor;
  }

  isLowTime(color: Color): boolean {
    const seconds = color === 'WHITE' ? this.whiteSeconds : this.blackSeconds;
    return this.status !== 'IDLE' && seconds < 30;
  }

  setPlayerMinutes(color: Color, minutes: number): void {
    if (this.status !== 'IDLE') {
      return;
    }

    const clampedMinutes = Math.max(1, Math.min(60, Math.floor(minutes)));
    const totalSeconds = clampedMinutes * 60;

    if (color === 'WHITE') {
      this.initialWhiteSeconds = totalSeconds;
      this.whiteSeconds = totalSeconds;
    } else {
      this.initialBlackSeconds = totalSeconds;
      this.blackSeconds = totalSeconds;
    }
  }

  start(initialTurn: Color = 'WHITE'): void {
    this.activeColor = initialTurn;
    this.status = 'RUNNING';
    this.startInterval();
  }

  pause(): void {
    if (this.status !== 'RUNNING') {
      return;
    }
    this.stopInterval();
    this.status = 'PAUSED';
  }

  resume(): void {
    if (this.status !== 'PAUSED') {
      return;
    }
    this.status = 'RUNNING';
    this.startInterval();
  }

  switchTurn(newTurn: Color): void {
    this.activeColor = newTurn;
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
    this.timerIntervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private stopInterval(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private tick(): void {
    if (this.status !== 'RUNNING') {
      return;
    }

    if (this.activeColor === 'WHITE') {
      this.whiteSeconds = Math.max(0, this.whiteSeconds - 1);
      if (this.whiteSeconds === 0) {
        this.stopInterval();
        this.status = 'TIMEOUT';
        this.options.onTimeout('WHITE');
      }
    } else {
      this.blackSeconds = Math.max(0, this.blackSeconds - 1);
      if (this.blackSeconds === 0) {
        this.stopInterval();
        this.status = 'TIMEOUT';
        this.options.onTimeout('BLACK');
      }
    }

    this.options.onTick?.();
  }
}
