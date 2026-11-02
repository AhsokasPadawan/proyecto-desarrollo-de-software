# ADR-015: Puerto Asíncrono de Biblioteca (`IChessLibraryRepository`) y Adaptador de Persistencia JSON

* **Estado:** Aceptado
* **Fecha:** 2026-10-29

## 1. What (Qué decidimos)

1. **Contrato Asíncrono de Salida (`IChessLibraryRepository`):**
   * Se define una única interfaz de persistencia (`IChessLibraryRepository`) cuyos métodos devuelven promesas (`Promise<...>`) para desacoplar por completo la aplicación de la tecnología de almacenamiento subyacente:
     * `getStudyPositions(): Promise<readonly StudyPositionRecord[]>`
     * `saveStudyPosition(record: StudyPositionRecord): Promise<void>`
     * `getMatePuzzles(): Promise<readonly MatePuzzleRecord[]>`
     * `saveMatePuzzle(record: MatePuzzleRecord): Promise<void>`
     * `getAnnotatedMatches(): Promise<readonly SavedAnnotatedMatchRecord[]>`
     * `saveAnnotatedMatch(record: SavedAnnotatedMatchRecord): Promise<void>`

2. **Adaptador de Producción en Archivo JSON (`JsonFileLibraryAdapter`):**
   * En el código de producción (`src/adapters/storage/`) se implementa una única clase concreta: `JsonFileLibraryAdapter implements IChessLibraryRepository`.
   * El repositorio cuenta con una base de datos JSON semilla (`chess-library.json`) precargada con disposiciones de estudio de libros, ejercicios tácticos de *"Blancas dan mate en $X$ movimientos"* y partidas históricas comentadas jugada por jugada.
   * En entorno de desarrollo (`npm run dev`), un middleware ligero en `vite.config.ts` expone un endpoint local (`/api/chess-library`) que lee y escribe directamente sobre el archivo físico `chess-library.json` en disco, contando con respaldo automático en `localStorage` y el archivo semilla estático cuando se ejecuta un build estático sin servidor.

3. **Inyección de Dependencias y Seam de Pruebas en Memoria:**
   * `ChessApp` recibe `libraryRepositoryFactory?: () => IChessLibraryRepository` con valor por defecto `() => new JsonFileLibraryAdapter()`.
   * En la suite de pruebas (`tests/`), se inyecta una implementación o fake en memoria que cumple la interfaz `IChessLibraryRepository`, manteniendo el $100\%$ de los tests aislados de I/O y ejecutándose en milisegundos sin ensuciar `src/` con adaptadores exclusivos de testing.

## 2. Why (Por qué lo elegimos)

1. **Cumplimiento Estricto de DIP y OCP (Sustitución por MySQL/PostgreSQL con Cero Cambios):**
   * Al definir un contrato basado en `Promise<...>` e inyectar la dependencia por interfaz, si en el futuro se desea reemplazar el archivo JSON por una base de datos relacional (**MySQL** / **PostgreSQL**) o un servicio cloud, basta con crear `MySqlLibraryAdapter implements IChessLibraryRepository` e inyectarlo en el punto de entrada (`App.tsx`), modificando **0 líneas** del Core y **0 líneas** de los componentes de UI.
2. **Demostración Completa de Arquitectura Hexagonal:**
   * Suma un *Driven Adapter* de persistencia real al sistema que permite precargar y guardar datos de las tres nuevas épicas (posiciones de estudio, ejercicios de mate en $X$ y partidas comentadas con Gemini).
3. **Velocidad y Determinismo en TDD:**
   * Los tests unitarios y de integración continúan ejecutándose íntegramente en memoria mediante inyección de la interfaz `IChessLibraryRepository`.

## 3. When to Break (Cuándo reconsiderar o romper esta decisión)

Esta decisión debería extenderse o revisarse si:
* El volumen de partidas guardadas superara varios miles de registros o requiriera búsquedas concurrentes multiusuario con control transaccional ACID, momento en el cual se implementaría el adaptador `MySqlLibraryAdapter` sobre la misma interfaz `IChessLibraryRepository` incorporando paginación y filtros de consulta.
