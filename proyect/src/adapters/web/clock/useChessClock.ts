import { useCallback, useEffect, useRef, useState } from 'react';
import { Color } from '../../../core/pieces/types';
import { ChessClockController, ClockStatus, formatClockTime } from './ChessClockController';
import { ChessClockState, UseChessClockOptions } from './useChessClockTypes';

export type { ChessClockState, UseChessClockOptions };

export function useChessClock({
  isEnabled,
  onTimeout,
}: UseChessClockOptions): ChessClockState {
  const [whiteSeconds, setWhiteSeconds] = useState(600);
  const [blackSeconds, setBlackSeconds] = useState(600);
  const [clockStatus, setClockStatus] = useState<ClockStatus>('IDLE');
  const [activeColor, setActiveColor] = useState<Color>('WHITE');

  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const controllerRef = useRef<ChessClockController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = new ChessClockController({
      onTimeout: (timedOutColor) => {
        setClockStatus('TIMEOUT');
        onTimeoutRef.current(timedOutColor);
      },
      onTick: () => {
        if (!controllerRef.current) return;
        setWhiteSeconds(controllerRef.current.getWhiteSeconds());
        setBlackSeconds(controllerRef.current.getBlackSeconds());
        setClockStatus(controllerRef.current.getStatus());
      },
    });
  }

  const syncStateFromController = useCallback(() => {
    if (!controllerRef.current) return;
    setWhiteSeconds(controllerRef.current.getWhiteSeconds());
    setBlackSeconds(controllerRef.current.getBlackSeconds());
    setClockStatus(controllerRef.current.getStatus());
    setActiveColor(controllerRef.current.getActiveColor());
  }, []);

  const startClock = useCallback((initialTurn: Color = 'WHITE') => {
    if (!isEnabled || !controllerRef.current) return;
    controllerRef.current.start(initialTurn);
    syncStateFromController();
  }, [isEnabled, syncStateFromController]);

  const pauseClock = useCallback(() => {
    if (!controllerRef.current) return;
    controllerRef.current.pause();
    syncStateFromController();
  }, [syncStateFromController]);

  const resumeClock = useCallback(() => {
    if (!controllerRef.current) return;
    controllerRef.current.resume();
    syncStateFromController();
  }, [syncStateFromController]);

  const switchClockTurn = useCallback((nextTurn: Color) => {
    if (!controllerRef.current) return;
    controllerRef.current.switchTurn(nextTurn);
    syncStateFromController();
  }, [syncStateFromController]);

  const resetClock = useCallback(() => {
    if (!controllerRef.current) return;
    controllerRef.current.reset();
    syncStateFromController();
  }, [syncStateFromController]);

  const setPlayerMinutes = useCallback((color: Color, minutes: number) => {
    if (!controllerRef.current) return;
    controllerRef.current.setPlayerMinutes(color, minutes);
    syncStateFromController();
  }, [syncStateFromController]);

  const setTimeConfig = useCallback((whiteMinutes: number, blackMinutes: number) => {
    if (!controllerRef.current) return;
    controllerRef.current.setTimeConfig(whiteMinutes, blackMinutes);
    syncStateFromController();
  }, [syncStateFromController]);

  useEffect(() => {
    return () => {
      controllerRef.current?.reset();
    };
  }, []);

  return {
    whiteSeconds,
    blackSeconds,
    whiteFormatted: formatClockTime(whiteSeconds),
    blackFormatted: formatClockTime(blackSeconds),
    clockStatus,
    activeColor,
    isWhiteLowTime: clockStatus !== 'IDLE' && whiteSeconds < 30,
    isBlackLowTime: clockStatus !== 'IDLE' && blackSeconds < 30,
    startClock,
    pauseClock,
    resumeClock,
    switchClockTurn,
    resetClock,
    setPlayerMinutes,
    setTimeConfig,
  };
}
