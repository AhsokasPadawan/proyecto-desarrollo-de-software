import { PieceType } from '../../core/pieces/types';
import { MoveRecord } from '../../core/ports/GameSnapshot';

export const PIECE_NAMES_LOOKUP: Record<PieceType, string> = {
  PAWN: 'PEÓN',
  ROOK: 'TORRE',
  KNIGHT: 'CABALLO',
  BISHOP: 'ALFIL',
  QUEEN: 'DAMA',
  KING: 'REY',
  CHANCELLOR: 'CANCILLER',
};

export interface FormatTranscriptionOptions {
  readonly modeLabel: string;
  readonly resultLabel: string;
  readonly moveHistory: readonly MoveRecord[];
}

export function formatSingleMove(record: MoveRecord): string {
  const pieceName = PIECE_NAMES_LOOKUP[record.piece] ?? record.piece;
  let moveDetails = `${pieceName} (${record.from} -> ${record.to})`;

  if (record.isCastling) {
    return `${pieceName} (${record.from} -> ${record.to}) [Enroque]`;
  }

  if (record.isPromotion) {
    const promotedName = record.promotionPiece
      ? PIECE_NAMES_LOOKUP[record.promotionPiece] ?? record.promotionPiece
      : 'DAMA';
    return `${pieceName} (${record.from} -> ${record.to}) [Coronación: ${promotedName}]`;
  }

  if (record.capturedPiece) {
    return `${moveDetails} [Captura]`;
  }

  return moveDetails;
}

export function formatMatchTranscription(options: FormatTranscriptionOptions): string {
  const headerLines = [
    'Partida de Ajedrez - Transcripción Oficial',
    `Modo de Juego: ${options.modeLabel}`,
    `Resultado: ${options.resultLabel}`,
    `Total de Movimientos: ${options.moveHistory.length}`,
    '=============================================================',
  ];

  const roundLines: string[] = [];
  for (let index = 0; index < options.moveHistory.length; index += 2) {
    const roundNumber = Math.floor(index / 2) + 1;
    const whiteMove = options.moveHistory[index];
    const blackMove = options.moveHistory[index + 1];

    const whiteText = `Blancas: ${formatSingleMove(whiteMove)}`;
    if (blackMove) {
      const blackText = `Negras: ${formatSingleMove(blackMove)}`;
      roundLines.push(`${roundNumber}. ${whiteText} | ${blackText}`);
    } else {
      roundLines.push(`${roundNumber}. ${whiteText}`);
    }
  }

  return [...headerLines, ...roundLines, '============================================================='].join('\n');
}

export function generateExportFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `partida-ajedrez-${year}${month}${day}-${hours}${minutes}.txt`;
}

export function downloadTranscriptionFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchorElement = document.createElement('a');

  anchorElement.href = objectUrl;
  anchorElement.download = filename;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
  URL.revokeObjectURL(objectUrl);
}
