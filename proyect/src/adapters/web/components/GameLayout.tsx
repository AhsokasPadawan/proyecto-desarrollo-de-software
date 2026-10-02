import type { CSSProperties, ReactNode } from 'react';

export interface GameLayoutProps {
  readonly header: ReactNode;
  readonly boardArea: ReactNode;
  readonly controlPanel: ReactNode;
  readonly replayBar?: ReactNode;
  readonly boardMaxWidth: string;
  readonly boardColumnHeight: string;
}

export function GameLayout({
  header,
  boardArea,
  controlPanel,
  replayBar,
  boardMaxWidth,
  boardColumnHeight,
}: GameLayoutProps): JSX.Element {
  const containerStyle: CSSProperties = {
    '--board-col-height': boardColumnHeight,
    '--board-max-w': boardMaxWidth,
  } as CSSProperties;

  return (
    <div className="min-h-screen lg:h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-2 sm:p-3 overflow-x-hidden lg:overflow-hidden">
      <main
        className="w-full max-w-[1240px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3 lg:gap-5"
        style={containerStyle}
        data-testid="game-layout-container"
      >
        {header}

        <div className="flex flex-col items-center gap-2.5 w-full max-w-[860px]">
          <div
            className="flex flex-col lg:flex-row items-stretch justify-center gap-3 lg:gap-5 w-full lg:max-h-[var(--board-col-height)]"
            style={{ maxHeight: boardColumnHeight }}
          >
            <div
              className="flex flex-col items-stretch gap-2 w-full lg:max-w-[var(--board-max-w)]"
              style={{ maxWidth: boardMaxWidth }}
            >
              {boardArea}
            </div>

            <div
              className="w-full lg:w-72 xl:w-80 flex flex-col h-full overflow-hidden lg:h-[var(--board-col-height)] lg:max-h-[var(--board-col-height)]"
              style={{ height: boardColumnHeight, maxHeight: boardColumnHeight }}
            >
              {controlPanel}
            </div>
          </div>

          {replayBar}
        </div>
      </main>
    </div>
  );
}
