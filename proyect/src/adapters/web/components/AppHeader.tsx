export function AppHeader(): JSX.Element {
  return (
    <header className="mb-6 text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-400 drop-shadow">
        Chess TPO — Domain Driven Engine
      </h1>
      <p className="text-xs md:text-sm text-zinc-400 mt-1">
        Arquitectura Hexagonal · Principios SOLID · Patrones GoF
      </p>
    </header>
  );
}
