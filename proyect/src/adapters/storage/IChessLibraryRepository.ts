import { Color, PieceType } from '../../core/pieces/types';
import { MoveRecord } from '../../core/ports/GameSnapshot';
import { FullGameAnalysisResult } from '../services/IAnalysisService';

export interface BoardPiecePlacement {
  readonly square: string;
  readonly type: PieceType;
  readonly color: Color;
}

export interface StudyPositionRecord {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly initialTurn: Color;
  readonly pieces: readonly BoardPiecePlacement[];
}

export interface PuzzleMoveStep {
  readonly from: string;
  readonly to: string;
  readonly promotionPiece?: PieceType;
}

export interface MatePuzzleRecord {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly initialTurn: Color;
  readonly maxMoves: number;
  readonly pieces: readonly BoardPiecePlacement[];
  readonly opponentResponses: readonly PuzzleMoveStep[];
}

export interface SavedAnnotatedMatchRecord {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly initialTurn?: Color;
  readonly initialPieces?: readonly BoardPiecePlacement[];
  readonly moves: readonly MoveRecord[];
  readonly analysisResult: FullGameAnalysisResult;
}

export interface ChessLibraryData {
  readonly studyPositions: readonly StudyPositionRecord[];
  readonly matePuzzles: readonly MatePuzzleRecord[];
  readonly annotatedMatches: readonly SavedAnnotatedMatchRecord[];
}

export interface IChessLibraryRepository {
  getStudyPositions(): Promise<readonly StudyPositionRecord[]>;
  saveStudyPosition(record: StudyPositionRecord): Promise<void>;
  getMatePuzzles(): Promise<readonly MatePuzzleRecord[]>;
  saveMatePuzzle(record: MatePuzzleRecord): Promise<void>;
  getAnnotatedMatches(): Promise<readonly SavedAnnotatedMatchRecord[]>;
  saveAnnotatedMatch(record: SavedAnnotatedMatchRecord): Promise<void>;
  deleteAnnotatedMatch(matchId: string): Promise<void>;
}
