import seedLibraryData from './chess-library.json';
import {
  ChessLibraryData,
  IChessLibraryRepository,
  MatePuzzleRecord,
  SavedAnnotatedMatchRecord,
  StudyPositionRecord,
} from './IChessLibraryRepository';

export const CHESS_LIBRARY_STORAGE_KEY = 'chess_library_json_backup';
export const CHESS_LIBRARY_API_ENDPOINT = '/api/chess-library';

export class JsonFileLibraryAdapter implements IChessLibraryRepository {
  private readonly apiEndpoint: string;

  constructor(apiEndpoint: string = CHESS_LIBRARY_API_ENDPOINT) {
    this.apiEndpoint = apiEndpoint;
  }

  async getStudyPositions(): Promise<readonly StudyPositionRecord[]> {
    const library = await this.readLibraryData();
    return library.studyPositions;
  }

  async saveStudyPosition(record: StudyPositionRecord): Promise<void> {
    const current = await this.readLibraryData();
    const filtered = current.studyPositions.filter((item) => item.id !== record.id);
    const updated: ChessLibraryData = {
      ...current,
      studyPositions: [record, ...filtered],
    };
    await this.writeLibraryData(updated);
  }

  async getMatePuzzles(): Promise<readonly MatePuzzleRecord[]> {
    const library = await this.readLibraryData();
    return library.matePuzzles;
  }

  async saveMatePuzzle(record: MatePuzzleRecord): Promise<void> {
    const current = await this.readLibraryData();
    const filtered = current.matePuzzles.filter((item) => item.id !== record.id);
    const updated: ChessLibraryData = {
      ...current,
      matePuzzles: [record, ...filtered],
    };
    await this.writeLibraryData(updated);
  }

  async getAnnotatedMatches(): Promise<readonly SavedAnnotatedMatchRecord[]> {
    const library = await this.readLibraryData();
    return library.annotatedMatches;
  }

  async saveAnnotatedMatch(record: SavedAnnotatedMatchRecord): Promise<void> {
    const current = await this.readLibraryData();
    const filtered = current.annotatedMatches.filter((item) => item.id !== record.id);
    const updated: ChessLibraryData = {
      ...current,
      annotatedMatches: [record, ...filtered],
    };
    await this.writeLibraryData(updated);
  }

  async deleteAnnotatedMatch(matchId: string): Promise<void> {
    const current = await this.readLibraryData();
    const updated: ChessLibraryData = {
      ...current,
      annotatedMatches: current.annotatedMatches.filter((item) => item.id !== matchId),
    };
    await this.writeLibraryData(updated);
  }

  private async readLibraryData(): Promise<ChessLibraryData> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const remoteData = (await response.json()) as ChessLibraryData;
        this.saveToLocalBackup(remoteData);
        return remoteData;
      }
    } catch {
      const fallbackBackup = this.readFromLocalBackup();
      if (fallbackBackup) {
        return fallbackBackup;
      }
      return seedLibraryData as unknown as ChessLibraryData;
    }

    const localBackup = this.readFromLocalBackup();
    if (localBackup) {
      return localBackup;
    }

    return seedLibraryData as unknown as ChessLibraryData;
  }

  private async writeLibraryData(data: ChessLibraryData): Promise<void> {
    this.saveToLocalBackup(data);

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, null, 2),
      });
    } catch {
      return;
    }
  }

  private readFromLocalBackup(): ChessLibraryData | null {
    try {
      const raw = localStorage.getItem(CHESS_LIBRARY_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as ChessLibraryData;
    } catch {
      return null;
    }
  }

  private saveToLocalBackup(data: ChessLibraryData): void {
    try {
      localStorage.setItem(CHESS_LIBRARY_STORAGE_KEY, JSON.stringify(data));
    } catch {
      return;
    }
  }
}
