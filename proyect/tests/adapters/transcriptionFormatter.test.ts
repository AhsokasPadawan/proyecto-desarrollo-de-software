import { describe, expect, it } from 'vitest';
import { MoveRecord } from '../../src/core/ports/GameSnapshot';
import {
  formatMatchTranscription,
  formatSingleMove,
  generateExportFilename,
} from '../../src/adapters/web/transcriptionFormatter';

describe('transcriptionFormatter', () => {
  it('formats a single standard move in letter-number format with Spanish piece name', () => {
    const record: MoveRecord = {
      moveIndex: 0,
      turn: 'WHITE',
      piece: 'PAWN',
      from: 'e2',
      to: 'e4',
    };

    const formatted = formatSingleMove(record);
    expect(formatted).toBe('PEÓN (e2 -> e4)');
  });

  it('formats a move with capture indicator', () => {
    const record: MoveRecord = {
      moveIndex: 1,
      turn: 'BLACK',
      piece: 'KNIGHT',
      from: 'c6',
      to: 'd4',
      capturedPiece: 'PAWN',
    };

    const formatted = formatSingleMove(record);
    expect(formatted).toBe('CABALLO (c6 -> d4) [Captura]');
  });

  it('formats a castling move indicator', () => {
    const record: MoveRecord = {
      moveIndex: 2,
      turn: 'WHITE',
      piece: 'KING',
      from: 'e1',
      to: 'g1',
      isCastling: true,
    };

    const formatted = formatSingleMove(record);
    expect(formatted).toBe('REY (e1 -> g1) [Enroque]');
  });

  it('formats a promotion move indicator with promoted piece', () => {
    const record: MoveRecord = {
      moveIndex: 3,
      turn: 'WHITE',
      piece: 'PAWN',
      from: 'a7',
      to: 'a8',
      isPromotion: true,
      promotionPiece: 'QUEEN',
    };

    const formatted = formatSingleMove(record);
    expect(formatted).toBe('PEÓN (a7 -> a8) [Coronación: DAMA]');
  });

  it('formats a full match transcription grouped by rounds with header', () => {
    const moves: MoveRecord[] = [
      {
        moveIndex: 0,
        turn: 'WHITE',
        piece: 'PAWN',
        from: 'e2',
        to: 'e4',
      },
      {
        moveIndex: 1,
        turn: 'BLACK',
        piece: 'PAWN',
        from: 'e7',
        to: 'e5',
      },
      {
        moveIndex: 2,
        turn: 'WHITE',
        piece: 'KNIGHT',
        from: 'g1',
        to: 'f3',
      },
    ];

    const output = formatMatchTranscription({
      modeLabel: 'Humano vs Humano',
      resultLabel: 'Jaque Mate (Ganan Blancas)',
      moveHistory: moves,
    });

    expect(output).toContain('Partida de Ajedrez - Transcripción Oficial');
    expect(output).toContain('Modo de Juego: Humano vs Humano');
    expect(output).toContain('Resultado: Jaque Mate (Ganan Blancas)');
    expect(output).toContain('Total de Movimientos: 3');
    expect(output).toContain('1. Blancas: PEÓN (e2 -> e4) | Negras: PEÓN (e7 -> e5)');
    expect(output).toContain('2. Blancas: CABALLO (g1 -> f3)');
  });

  it('generates filename with timestamp in YYYYMMDD-HHmm format', () => {
    const fixedDate = new Date(2026, 9, 1, 19, 55);
    const filename = generateExportFilename(fixedDate);
    expect(filename).toBe('partida-ajedrez-20261001-1955.txt');
  });
});
