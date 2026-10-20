import {
  AiCoachBatchReview,
  AiCoachEvaluationContext,
  AiCoachLiveHintRequest,
  IAiCoachEngine,
} from './IAiCoachEngine';

export const GEMINI_API_KEY_STORAGE_KEY = 'chess_gemini_api_key';

export function getStoredGeminiApiKey(): string {
  const localKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)?.trim();
  if (typeof localKey === 'string' && localKey.length > 0) {
    return localKey;
  }
  const envKey = (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return '';
}

export function setStoredGeminiApiKey(key: string): void {
  localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
}

export type MoveEvaluationContext = AiCoachEvaluationContext;
export type LiveHintRequest = AiCoachLiveHintRequest;
export type BatchReviewResponse = AiCoachBatchReview;

export class GeminiCoachService implements IAiCoachEngine {
  private readonly explicitApiKey?: string;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName: string = 'gemini-3.5-flash') {
    this.explicitApiKey = apiKey;
    this.modelName = modelName;
  }

  get apiKey(): string {
    return this.explicitApiKey ?? getStoredGeminiApiKey();
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async requestLiveHint(hintRequest: AiCoachLiveHintRequest): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error('API_KEY_MISSING');
    }

    const promptText = `
Eres un entrenador y maestro pedagógico de ajedrez en español.
El jugador juega con ${hintRequest.currentTurn === 'WHITE' ? 'BLANCAS' : 'NEGRAS'}.
Posición FEN actual: ${hintRequest.fen}
Evaluación de la posición: ${hintRequest.currentEval.toFixed(2)} peones.
El motor táctico recomienda jugar: de ${hintRequest.bestMoveFrom} a ${hintRequest.bestMoveTo}.

Explícale al jugador en 1 o 2 oraciones breves, concisas y directas por qué esta jugada es la más adecuada (desarrollo de piezas, dominio del centro, seguridad del rey o idea táctica). No menciones el tiempo de cálculo ni la evaluación numérica ni repitas las casillas o coordenadas; enfócate exclusivamente en el por qué de la idea.
`;

    const payload = await this.postGenerateContent(promptText, 0.3);
    return this.extractCandidateText(payload);
  }

  async requestBatchReview(moves: readonly AiCoachEvaluationContext[]): Promise<AiCoachBatchReview> {
    if (!this.hasApiKey()) {
      throw new Error('API_KEY_MISSING');
    }

    const movesFormatted = moves
      .map(
        (move) =>
          `[Jugada #${move.moveIndex + 1} | Turno: ${move.turn} | Pieza: ${move.piece} | Jugó: ${move.playedMove} | Mejor jugada: ${move.bestMove} | Calidad: ${move.quality} | Pérdida: ${move.evalLoss.toFixed(2)} peones]`
      )
      .join('\n');

    const promptText = `
Actúa como un entrenador experto de ajedrez. Analiza la siguiente partida con la información táctica ya evaluada por el motor Stockfish:

${movesFormatted}

Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura exacta:
{
  "overallSummary": "Resumen general conciso de 2 párrafos evaluando el desempeño de ambos jugadores y los momentos clave.",
  "moves": [
    {
      "moveIndex": 0,
      "advice": "Explicación breve de 1 oración sobre la idea táctica o estratégica detrás del acierto o del error."
    }
  ]
}
`;

    const payload = await this.postGenerateContent(promptText, 0.2, 'application/json');
    const candidateText = this.extractCandidateText(payload);

    const parsed = JSON.parse(candidateText) as {
      overallSummary?: string;
      moves?: Array<{ moveIndex: number; advice: string }>;
    };

    const advicesMap: Record<number, string> = {};
    if (Array.isArray(parsed.moves)) {
      for (const item of parsed.moves) {
        if (typeof item.moveIndex === 'number' && typeof item.advice === 'string') {
          advicesMap[item.moveIndex] = item.advice;
        }
      }
    }

    return {
      overallSummary: parsed.overallSummary ?? 'Análisis completo de la partida completado.',
      moveAdvices: advicesMap,
    };
  }

  private async postGenerateContent(promptText: string, temperature: number, responseMimeType?: string) {
    const modelsToTry = [this.modelName, 'gemini-flash-latest'];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const bodyPayload: Record<string, unknown> = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature,
            ...(responseMimeType ? { responseMimeType } : {}),
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        if (response.ok) {
          return await response.json();
        }
        lastError = new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError ?? new Error('Gemini API call failed');
  }

  private extractCandidateText(payload: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string {
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('No candidate content in Gemini response');
    }
    return text.trim();
  }
}
