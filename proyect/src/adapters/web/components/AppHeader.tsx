export function AppHeader(): JSX.Element {
  return (
    <header className="w-full lg:w-56 xl:w-60 flex flex-col justify-between p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md select-none">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg font-bold shadow-inner">
            ♟
          </span>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-emerald-400 leading-tight">
              Chess TPO
            </h1>
            <p className="text-[11px] font-medium text-zinc-400">
              Domain Driven Engine
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-1" />

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Arquitectura & Diseño
          </span>
          <div className="flex flex-col gap-1.5 text-xs text-zinc-300">
            <span className="px-2 py-1 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Arquitectura Hexagonal
            </span>
            <span className="px-2 py-1 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Principios SOLID
            </span>
            <span className="px-2 py-1 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Patrones GoF
            </span>
            <span className="px-2 py-1 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              TypeScript + Vitest
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5 mt-3 text-[10px] text-zinc-500 text-center font-medium">
        Ingeniería de Software · TPO
      </div>
    </header>
  );
}
