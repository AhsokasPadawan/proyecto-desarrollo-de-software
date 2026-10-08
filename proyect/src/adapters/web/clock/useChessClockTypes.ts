import { Color } from '../../../core/pieces/types';
import { ClockStatus } from './ChessClockController';

export interface UseChessClockOptions {
  readonly isEnabled: boolean;
  readonly onTimeout: (timedOutColor: Color) => void;
}

export interface ChessClockState {
  readonly whiteSeconds: number;
  readonly blackSeconds: number;
  readonly whiteFormatted: string;
  readonly blackFormatted: string;
  readonly clockStatus: ClockStatus;
  readonly activeColor: Color;
  readonly isWhiteLowTime: boolean;
  readonly isBlackLowTime: boolean;
  readonly startClock: (initialTurn?: Color) => void;
  readonly pauseClock: () => void;
  readonly resumeClock: () => void;
  readonly switchClockTurn: (nextTurn: Color) => void;
  readonly resetClock: () => void;
  readonly setPlayerMinutes: (color: Color, minutes: number) => void;
  readonly setTimeConfig: (whiteMinutes: number, blackMinutes: number) => void;
}
