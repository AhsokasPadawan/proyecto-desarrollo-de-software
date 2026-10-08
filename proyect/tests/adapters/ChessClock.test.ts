import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChessClockController, formatClockTime } from '../../src/adapters/web/clock/ChessClockController';

describe('ChessClockController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats total seconds into mm:ss format correctly', () => {
    expect(formatClockTime(600)).toBe('10:00');
    expect(formatClockTime(65)).toBe('01:05');
    expect(formatClockTime(9)).toBe('00:09');
    expect(formatClockTime(0)).toBe('00:00');
    expect(formatClockTime(-5)).toBe('00:00');
  });

  it('initializes with 10 minutes (600 seconds) for both players in IDLE state', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    expect(clock.getWhiteSeconds()).toBe(600);
    expect(clock.getBlackSeconds()).toBe(600);
    expect(clock.getStatus()).toBe('IDLE');
    expect(clock.getActiveColor()).toBe('WHITE');
  });

  it('allows adjusting initial minutes independently before starting', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.setPlayerMinutes('WHITE', 5);
    clock.setPlayerMinutes('BLACK', 15);

    expect(clock.getWhiteSeconds()).toBe(300);
    expect(clock.getBlackSeconds()).toBe(900);
  });

  it('clamps adjusted minutes between 1 and 60 minutes', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.setPlayerMinutes('WHITE', 0);
    clock.setPlayerMinutes('BLACK', 90);

    expect(clock.getWhiteSeconds()).toBe(60);
    expect(clock.getBlackSeconds()).toBe(3600);
  });

  it('decrements only the active player time when running', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.start('WHITE');
    expect(clock.getStatus()).toBe('RUNNING');

    vi.advanceTimersByTime(3000);

    expect(clock.getWhiteSeconds()).toBe(597);
    expect(clock.getBlackSeconds()).toBe(600);
  });

  it('switches the ticking player when turn changes', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.start('WHITE');
    vi.advanceTimersByTime(2000);
    expect(clock.getWhiteSeconds()).toBe(598);

    clock.switchTurn('BLACK');
    vi.advanceTimersByTime(4000);

    expect(clock.getWhiteSeconds()).toBe(598);
    expect(clock.getBlackSeconds()).toBe(596);
  });

  it('pauses and resumes countdown without losing remaining seconds', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.start('WHITE');
    vi.advanceTimersByTime(2000);
    expect(clock.getWhiteSeconds()).toBe(598);

    clock.pause();
    expect(clock.getStatus()).toBe('PAUSED');

    vi.advanceTimersByTime(5000);
    expect(clock.getWhiteSeconds()).toBe(598);

    clock.resume();
    expect(clock.getStatus()).toBe('RUNNING');

    vi.advanceTimersByTime(3000);
    expect(clock.getWhiteSeconds()).toBe(595);
  });

  it('triggers onTimeout and stops ticking when a player clock reaches zero', () => {
    const handleTimeout = vi.fn();
    const clock = new ChessClockController({ onTimeout: handleTimeout });

    clock.setPlayerMinutes('WHITE', 1);
    clock.start('WHITE');

    vi.advanceTimersByTime(59000);
    expect(clock.getWhiteSeconds()).toBe(1);
    expect(handleTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(clock.getWhiteSeconds()).toBe(0);
    expect(clock.getStatus()).toBe('TIMEOUT');
    expect(handleTimeout).toHaveBeenCalledTimes(1);
    expect(handleTimeout).toHaveBeenCalledWith('WHITE');

    vi.advanceTimersByTime(5000);
    expect(handleTimeout).toHaveBeenCalledTimes(1);
  });

  it('identifies low time when remaining seconds are strictly less than 30', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.setPlayerMinutes('WHITE', 1);
    clock.start('WHITE');

    vi.advanceTimersByTime(30000);
    expect(clock.getWhiteSeconds()).toBe(30);
    expect(clock.isLowTime('WHITE')).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(clock.getWhiteSeconds()).toBe(29);
    expect(clock.isLowTime('WHITE')).toBe(true);
  });

  it('resets clock back to initial configured values and stops ticking', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });

    clock.setPlayerMinutes('WHITE', 5);
    clock.setPlayerMinutes('BLACK', 5);
    clock.start('WHITE');

    vi.advanceTimersByTime(10000);
    expect(clock.getWhiteSeconds()).toBe(290);

    clock.reset();

    expect(clock.getStatus()).toBe('IDLE');
    expect(clock.getWhiteSeconds()).toBe(300);
    expect(clock.getBlackSeconds()).toBe(300);

    vi.advanceTimersByTime(5000);
    expect(clock.getWhiteSeconds()).toBe(300);
  });

  it('configures player minutes using setTimeConfig', () => {
    const clock = new ChessClockController({ onTimeout: () => {} });
    clock.setTimeConfig(15, 20);

    expect(clock.getWhiteSeconds()).toBe(900);
    expect(clock.getBlackSeconds()).toBe(1200);
  });
});
