# 37: Puerto Asíncrono de Biblioteca (`IChessLibraryRepository`) y Adaptador JSON (`JsonFileLibraryAdapter`)

**What to build:** Definir el contrato asíncrono `IChessLibraryRepository` (con métodos basados en `Promise<...>` para consultar y guardar posiciones de estudio, ejercicios tácticos de mate en $X$ y partidas comentadas) e implementar su adaptador concreto de producción `JsonFileLibraryAdapter` respaldado por el archivo `chess-library.json` y un middleware ligero en `vite.config.ts` (con fallback a la semilla estática + `localStorage`), dejando preparado el archivo `chess-library.json` con datos iniciales precargados para las tres épicas.

**Blocked by:** `12-patron-observer-y-game-snapshot`, `25-modelo-dominio-historial-moverecord`

**Branch:** `ticket/37-puerto-biblioteca-y-adaptador-json`

**Status:** Done

## Acceptance Criteria

- [x] Se define la interfaz `IChessLibraryRepository` con métodos asíncronos (`Promise<...>`) para leer y persistir `StudyPositionRecord`, `MatePuzzleRecord` y `SavedAnnotatedMatchRecord`, garantizando la sustitución transparente por un futuro adaptador SQL (como MySQL) sin tocar el Core ni la UI.
- [x] Se crea el archivo semilla `chess-library.json` con posiciones de estudio de libros, ejercicios clásicos de Mate en 1/2/3 y partidas comentadas jugada a jugada precargadas.
- [x] Se implementa `JsonFileLibraryAdapter implements IChessLibraryRepository` sincronizado con `chess-library.json` (vía middleware en `vite.config.ts` durante el desarrollo y fallback a `localStorage` + semilla en builds estáticos).
- [x] Se añaden pruebas unitarias AAA en memoria verificando la lectura de datos precargados y el guardado de nuevos registros sobre el contrato `IChessLibraryRepository`.
