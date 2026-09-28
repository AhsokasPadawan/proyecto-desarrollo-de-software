# 21: Tablero Web Dinámico ($N \times M$) y Lookup Table de Piezas con Fallback en React + Tailwind

**What to build:** Construir el componente de tablero en `src/adapters/web` conectado a `IGameEngine` mediante `useSyncExternalStore(game.subscribe, game.getSnapshot)`, renderizando dinámicamente una grilla de `snapshot.rows` $\times$ `snapshot.cols` con Tailwind CSS y representando las piezas mediante una *lookup table* con *fallback* visual automático para piezas de *Fairy Chess*.

**Blocked by:** `12-patron-observer-y-game-snapshot`

**Branch:** `ticket/21-tablero-web-dinamico-y-piezas`

**Status:** ready-for-agent

## Acceptance Criteria

- [ ] El adaptador React se suscribe al Core usando `useSyncExternalStore` sobre `subscribe` y `getSnapshot` sin utilizar `useEffect` para sincronizar el estado del tablero.
- [ ] La grilla genera dinámicamente `snapshot.rows` filas y `snapshot.cols` columnas con etiquetas algebraicas laterales e inferiores, adaptándose sin romperse tanto a $8 \times 8$ como a dimensiones personalizadas ($10 \times 10$).
- [ ] Una *lookup table* mapea las 6 piezas estándar a su representación visual por color, y provee un *fallback* automático (insignia estilizada con las iniciales de `piece.type`) para cualquier pieza nueva inyectada en la defensa oral.
- [ ] Tests de componente / renderizado verificando la visualización de un `GameSnapshot` estándar y de un `GameSnapshot` con dimensiones y pieza personalizada.
