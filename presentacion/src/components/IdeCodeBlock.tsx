import { ReactNode } from 'react';

type TokenCategory =
  | 'STRING'
  | 'KEYWORD'
  | 'TYPE'
  | 'FUNCTION'
  | 'NUMBER'
  | 'PROPERTY'
  | 'PLAIN';

const IDE_KEYWORDS = new Set([
  'export',
  'interface',
  'class',
  'implements',
  'extends',
  'readonly',
  'private',
  'public',
  'protected',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'new',
  'async',
  'await',
  'true',
  'false',
  'null',
  'undefined',
  'this',
  'constructor',
  'super',
]);

const IDE_TYPES = new Set([
  'IGameEngine',
  'IBoardQuery',
  'IGameObserver',
  'GameSnapshot',
  'MoveResult',
  'Position',
  'Board',
  'Color',
  'PieceType',
  'IPiece',
  'Piece',
  'PiecePlacement',
  'UnsubscribeFn',
  'ICommand',
  'MoveCommand',
  'CommandHistory',
  'IAiStrategy',
  'AiMoveChoice',
  'IMovementRule',
  'SlidingMoveRule',
  'LeapMoveRule',
  'Chancellor',
  'IAnalysisService',
  'IChessEngine',
  'IAiCoachEngine',
  'LiveHintResult',
  'FullGameAnalysisResult',
  'ChessEngineEvaluation',
  'LiveHintContext',
  'AiCoachEvaluationContext',
  'BatchGameReview',
  'IGameState',
  'GameStateType',
  'GameStateContext',
  'NormalPlayState',
  'StudyPlayState',
  'CheckState',
  'CheckmateState',
  'StalemateState',
  'DrawState',
  'IChessLibraryRepository',
  'StudyPositionRecord',
  'MatePuzzleRecord',
  'SavedAnnotatedMatchRecord',
  'ChessAppProps',
  'ChessGame',
  'AnalysisService',
  'ChessApiService',
  'GeminiCoachService',
  'JsonFileLibraryAdapter',
  'Rook',
  'King',
  'Promise',
  'Record',
  'JSX',
  'Element',
  'boolean',
  'number',
  'string',
  'void',
]);

const TOKEN_COLOR_LOOKUP: Record<TokenCategory, string> = {
  STRING: 'text-amber-300',
  KEYWORD: 'text-fuchsia-400 font-semibold',
  TYPE: 'text-teal-300',
  FUNCTION: 'text-sky-300',
  NUMBER: 'text-emerald-300',
  PROPERTY: 'text-indigo-200',
  PLAIN: 'text-zinc-200',
};

const TOKEN_REGEX =
  /('[^']*'|`[^`]*`|"[^"]*"|\b[A-Za-z_][A-Za-z0-9_]*\b(?=\s*\()|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+\b)/g;

function classifyToken(token: string, nextCharAfterToken: string): TokenCategory {
  if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
    return 'STRING';
  }
  if (/^\d+$/.test(token)) {
    return 'NUMBER';
  }
  if (IDE_KEYWORDS.has(token)) {
    return 'KEYWORD';
  }
  if (IDE_TYPES.has(token) || /^[A-Z]/.test(token)) {
    return 'TYPE';
  }
  if (nextCharAfterToken === '(') {
    return 'FUNCTION';
  }
  return 'PLAIN';
}

function highlightCodeLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = TOKEN_REGEX.exec(line);

  while (match !== null) {
    const matchIndex = match.index;
    const tokenText = match[0];

    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`plain-${lastIndex}`} className="text-zinc-400">
          {line.slice(lastIndex, matchIndex)}
        </span>
      );
    }

    const afterIndex = matchIndex + tokenText.length;
    const nextNonSpace = line.slice(afterIndex).trimStart()[0] ?? '';
    const category = classifyToken(tokenText, nextNonSpace);

    parts.push(
      <span key={`tok-${matchIndex}`} className={TOKEN_COLOR_LOOKUP[category]}>
        {tokenText}
      </span>
    );

    lastIndex = afterIndex;
    match = TOKEN_REGEX.exec(line);
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={`tail-${lastIndex}`} className="text-zinc-400">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}

export function IdeCodeBlock({ code }: { readonly code: string }): JSX.Element {
  const lines = code.split('\n');

  return (
    <div className="rounded-xl bg-[#0d1117] border border-zinc-800 shadow-2xl overflow-hidden">
      <div className="px-4 py-2 bg-[#161b22] border-b border-zinc-800/90 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[11px] font-mono text-zinc-400">TypeScript</span>
      </div>

      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="table-row hover:bg-zinc-800/30">
              <span className="table-cell pr-4 text-right text-zinc-600 select-none text-xs w-8">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre">
                {line.length > 0 ? highlightCodeLine(line) : ' '}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
