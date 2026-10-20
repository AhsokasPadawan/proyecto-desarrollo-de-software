import { MoveRecord } from '../../core/ports/GameSnapshot';
import { AnalyzedMove, FullGameAnalysisResult } from '../services/AnalysisService';
import { PIECE_NAMES_LOOKUP } from './pieceDisplay';

export { PIECE_NAMES_LOOKUP };

export interface FormatTranscriptionOptions {
  readonly modeLabel: string;
  readonly resultLabel: string;
  readonly moveHistory: readonly MoveRecord[];
  readonly analysisResult?: FullGameAnalysisResult | null;
}

export function formatSingleMove(record: MoveRecord, analyzedMove?: AnalyzedMove): string {
  const pieceName = PIECE_NAMES_LOOKUP[record.piece] ?? record.piece;
  const baseNotation = `${pieceName} (${record.from} -> ${record.to})`;
  const eventTags: string[] = [];

  if (record.isCastling) {
    eventTags.push('[Enroque]');
  }
  if (record.capturedPiece) {
    eventTags.push('[Captura]');
  }
  if (record.isPromotion) {
    const promotedName = record.promotionPiece
      ? PIECE_NAMES_LOOKUP[record.promotionPiece] ?? record.promotionPiece
      : 'DAMA';
    eventTags.push(`[Coronación: ${promotedName}]`);
  }

  if (analyzedMove) {
    eventTags.push(`[${analyzedMove.quality.label} | Óptima: ${analyzedMove.bestMoveFrom}->${analyzedMove.bestMoveTo}]`);
  }

  return eventTags.length > 0 ? `${baseNotation} ${eventTags.join(' ')}` : baseNotation;
}

export function formatMatchTranscription(options: FormatTranscriptionOptions): string {
  const headerLines = [
    'Partida de Ajedrez - Transcripción Oficial',
    `Modo de Juego: ${options.modeLabel}`,
    `Resultado: ${options.resultLabel}`,
    `Total de Movimientos: ${options.moveHistory.length}`,
  ];

  if (options.analysisResult) {
    headerLines.push(
      `Precisión Blancas: ${options.analysisResult.whiteAccuracy}% | Precisión Negras: ${options.analysisResult.blackAccuracy}%`
    );
  }

  headerLines.push('=============================================================');

  const roundLines: string[] = [];
  for (let index = 0; index < options.moveHistory.length; index += 2) {
    const roundNumber = Math.floor(index / 2) + 1;
    const whiteMove = options.moveHistory[index];
    const blackMove = options.moveHistory[index + 1];

    const whiteAnalysis = options.analysisResult?.analyzedMoves?.[index];
    const blackAnalysis = options.analysisResult?.analyzedMoves?.[index + 1];

    const whiteText = `Blancas: ${formatSingleMove(whiteMove, whiteAnalysis)}`;
    if (blackMove) {
      const blackText = `Negras: ${formatSingleMove(blackMove, blackAnalysis)}`;
      roundLines.push(`${roundNumber}. ${whiteText} | ${blackText}`);
    } else {
      roundLines.push(`${roundNumber}. ${whiteText}`);
    }

    if (whiteAnalysis?.advice) {
      roundLines.push(`   > Coach (Blancas): ${whiteAnalysis.advice}`);
    }
    if (blackAnalysis?.advice) {
      roundLines.push(`   > Coach (Negras): ${blackAnalysis.advice}`);
    }
  }

  const resultLines = [...headerLines, ...roundLines];

  if (options.analysisResult?.overallSummary) {
    resultLines.push('=============================================================');
    resultLines.push('REPORTE Y CONCLUSIONES DEL COACH DE IA:');
    resultLines.push(options.analysisResult.overallSummary);
  }

  resultLines.push('=============================================================');

  return resultLines.join('\n');
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
